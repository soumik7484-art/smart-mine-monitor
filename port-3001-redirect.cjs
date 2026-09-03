const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting to MineGuard Dashboard...</title>
  <script>
    window.location.replace(window.location.href.replace(':3001', ':3000'));
  </script>
</head>
<body>
  <p>Redirecting to <a href="http://localhost:3000">Dashboard on port 3000</a>...</p>
</body>
</html>`);
});

server.listen(3001, '0.0.0.0', () => {
  console.log('Port 3001 redirect server running -> forwarding to port 3000');
});
