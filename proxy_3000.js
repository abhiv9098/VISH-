const http = require('http');

const server = http.createServer((req, res) => {
  const target = `http://localhost:4000${req.url || '/'}`;
  res.writeHead(302, {
    'Location': target,
    'Content-Type': 'text/html'
  });
  res.end(`Redirecting to <a href="${target}">${target}</a>`);
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Redirect server on port 3000 -> http://localhost:4000');
});
