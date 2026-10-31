from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os,re
class Handler(SimpleHTTPRequestHandler):
 def send_head(self):
  p=Path(self.translate_path(self.path))
  if p.is_dir(): return super().send_head()
  try: f=p.open('rb')
  except OSError: self.send_error(404); return None
  size=os.fstat(f.fileno()).st_size
  header=self.headers.get('Range','')
  match=re.fullmatch(r'bytes=(\d+)-(\d*)',header)
  start,end=0,size-1
  if match:
   start=int(match[1]);end=min(int(match[2]) if match[2] else end,end)
   if start>end: f.close();self.send_error(416);return None
  self.send_response(206 if match else 200)
  self.send_header('Content-Type',self.guess_type(str(p)))
  self.send_header('Accept-Ranges','bytes')
  self.send_header('Cache-Control','no-store')
  self.send_header('Content-Length',str(end-start+1))
  if match:self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
  self.end_headers();f.seek(start);self.remaining=end-start+1
  return f
 def copyfile(self,source,outputfile):
  if not hasattr(self,'remaining'):return super().copyfile(source,outputfile)
  while self.remaining:
   data=source.read(min(65536,self.remaining))
   if not data:break
   try:outputfile.write(data)
   except (BrokenPipeError,ConnectionResetError):break
   self.remaining-=len(data)
os.chdir(Path(__file__).resolve().parent.parent / 'design')
print('Veila preview: http://127.0.0.1:4173/veila-hero.html', flush=True)
ThreadingHTTPServer(('127.0.0.1',4173),Handler).serve_forever()
