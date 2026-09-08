const http = require('http');
const fs = require('fs');
const path = require('path');

const outFile = process.argv[2] || path.join(__dirname, 'extracted-data.json');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      fs.writeFileSync(outFile, body);
      console.log('Saved', body.length, 'bytes to', outFile);
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('OK');
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});
server.listen(8935, () => console.log('Receiver listening on :8935, writing to', outFile));
