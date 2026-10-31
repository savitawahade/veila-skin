import Foundation
import AVFoundation
import AppKit
let source = URL(fileURLWithPath: CommandLine.arguments[1])
let destination = URL(fileURLWithPath: CommandLine.arguments[2])
let asset = AVURLAsset(url: source)
let track = asset.tracks(withMediaType: .video)[0]
let size = track.naturalSize
let duration = CMTimeGetSeconds(asset.duration)
print("Source: \(size.width)x\(size.height), \(duration)s")
let reader = try AVAssetReader(asset: asset)
let output = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange])
reader.add(output)
let writer = try AVAssetWriter(outputURL: destination, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: size.width, AVVideoHeightKey: size.height, AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 6000000, AVVideoMaxKeyFrameIntervalKey: 1, AVVideoAllowFrameReorderingKey: false]])
input.expectsMediaDataInRealTime = false
writer.add(input)
writer.shouldOptimizeForNetworkUse = true
writer.startWriting();writer.startSession(atSourceTime: .zero);reader.startReading()
while let sample = output.copyNextSampleBuffer() {
  while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.002) }
  guard input.append(sample) else { fatalError("Write failed: \(String(describing: writer.error))") }
}
input.markAsFinished()
let done=DispatchSemaphore(value:0)
writer.finishWriting { done.signal() }
done.wait()
guard writer.status == .completed else { fatalError("Encode failed") }
print("Prepared frame-accurate interaction video")
