// Serves the v30 artifact-mode dist; answers /_blob/<id> from the local photo the id was uploaded from.
const http = require('http'), fs = require('fs'), path = require('path');
const PV = process.argv[2], PORT = +process.argv[3];
const urls = require(path.join(PV, 'dist/photo-assets.json')), photos = require(path.join(PV, 'dist/preview-photos.json'));
const byKey = Object.fromEntries(photos.map(p => [p.key, p.path])); const blob = {};
for (const [k, u] of Object.entries(urls)) blob[u] = path.join(PV, byKey[k]);
const types = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.html': 'text/html', '.webp': 'image/webp' };
http.createServer((q, r) => {
  const u = q.url.split('?')[0];
  const f = u.startsWith('/_blob/') ? blob[u] : path.join(PV, 'dist', u === '/' ? 'index.html' : u);
  if (!f || !fs.existsSync(f)) { r.writeHead(404); return r.end() }
  r.writeHead(200, { 'content-type': u.startsWith('/_blob/') ? 'image/webp' : types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
}).listen(PORT);
