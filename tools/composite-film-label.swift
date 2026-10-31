import Foundation
import AVFoundation
import CoreImage
import AppKit

let folder = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let asset = AVURLAsset(url: folder.appendingPathComponent("flow-original.mp4"))
let track = asset.tracks(withMediaType: .video)[0]
let duration = asset.duration
let composition = AVMutableComposition()
let videoTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)!
try videoTrack.insertTimeRange(CMTimeRange(start: .zero, duration: duration), of: track, at: .zero)
videoTrack.preferredTransform = track.preferredTransform
let bounds = CGRect(x: 0, y: 0, width: 1280, height: 720)
let reference = CIImage(contentsOf: folder.appendingPathComponent("bottle-master.png"))!
let master = reference.transformed(by: CGAffineTransform(scaleX: 1280/reference.extent.width, y: 720/reference.extent.height)).cropped(to: bounds)
// Core Image's origin is bottom-left. Feather only the body label region;
// all moving dropper/neck pixels remain from the original generated video.
let patch = CGRect(x: 859, y: 720-535, width: 109, height: 160)
let white = CIColor(red: 1, green: 1, blue: 1)
let clear = CIImage(color: CIColor(red: 0, green: 0, blue: 0)).cropped(to: bounds)
let rounded = CIFilter(name: "CIRoundedRectangleGenerator", parameters: ["inputExtent": CIVector(cgRect: patch), "inputRadius": 8, "inputColor": white])!.outputImage!
let mask = rounded.composited(over: clear).applyingFilter("CIGaussianBlur", parameters:[kCIInputRadiusKey:3]).cropped(to: bounds)
let videoComposition = AVVideoComposition(asset: composition, applyingCIFiltersWithHandler: { request in
  let frame = request.sourceImage.clampedToExtent()
  let result = master.applyingFilter("CIBlendWithMask", parameters: [kCIInputBackgroundImageKey: frame, kCIInputMaskImageKey: mask]).cropped(to: bounds)
  request.finish(with: result, context: nil)
})
let mutable = videoComposition.mutableCopy() as! AVMutableVideoComposition
mutable.renderSize = bounds.size
mutable.frameDuration = CMTime(value: 1, timescale: Int32(track.nominalFrameRate.rounded()))
let destination = folder.appendingPathComponent("ritual-final.mp4")
if FileManager.default.fileExists(atPath: destination.path) { try FileManager.default.removeItem(at: destination) }
let exporter = AVAssetExportSession(asset: composition, presetName: AVAssetExportPreset1280x720)!
exporter.outputURL = destination
exporter.outputFileType = .mp4
exporter.videoComposition = mutable
exporter.shouldOptimizeForNetworkUse = true
let done = DispatchSemaphore(value: 0)
exporter.exportAsynchronously { done.signal() }
done.wait()
guard exporter.status == .completed else { fatalError("Export failed: \(String(describing: exporter.error))") }
let resultAsset = AVURLAsset(url: destination)
print("Exported \(CMTimeGetSeconds(resultAsset.duration)) seconds; audio tracks: \(resultAsset.tracks(withMediaType:.audio).count)")
let generator = AVAssetImageGenerator(asset: resultAsset)
generator.appliesPreferredTrackTransform = true
generator.requestedTimeToleranceBefore = .zero
generator.requestedTimeToleranceAfter = .zero
for second in [0.0, 3.0, 5.5, 8.5] {
  let image = try generator.copyCGImage(at: CMTime(seconds:second, preferredTimescale:600), actualTime:nil)
  let data = NSBitmapImageRep(cgImage:image).representation(using:.jpeg,properties:[.compressionFactor:0.95])!
  try data.write(to: URL(fileURLWithPath:"/private/tmp/veila-v4-final-\(second).jpg"))
}
print("Review frames saved in /private/tmp/veila-v4-final-*.jpg")
