#!/usr/bin/env node
// Serves the `mint export` output in ./site under /docs (also works when a proxy strips the prefix).
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIR = path.join(__dirname, 'site');
const BASE = '/docs';
const IMMUTABLE = /^\/_mintlify\/(?:assets|export-assets)\//;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.webp': 'image/webp', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

function inside(p) {
  return p === DIR || p.startsWith(DIR + path.sep);
}

function isFile(p) {
  return fs.existsSync(p) && fs.statSync(p).isFile();
}

function resolve(urlPath, rsc) {
  const p = path.resolve(DIR, urlPath.replace(/^\/+/, ''));
  if (!inside(p)) return undefined;
  const candidates = rsc ? [path.join(p, 'index.txt')] : [p, path.join(p, 'index.html'), p + '.html'];
  return candidates.find(isFile);
}

http
  .createServer((req, res) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    } catch {
      res.writeHead(400).end('Bad request');
      return;
    }
    if (urlPath === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok');
      return;
    }
    if (urlPath === BASE || urlPath.startsWith(BASE + '/')) urlPath = urlPath.slice(BASE.length) || '/';
    const rsc = req.headers.rsc === '1' || /[?&]_rsc=/.test(req.url || '');
    const file = resolve(urlPath, rsc);
    if (!file) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404 Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': rsc ? 'text/x-component' : MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      Vary: 'RSC',
      'Cache-Control': IMMUTABLE.test(urlPath) ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`docs on :${PORT}${BASE}/`));
