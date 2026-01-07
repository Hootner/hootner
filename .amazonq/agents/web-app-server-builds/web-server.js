// Minimal Web Server
import http from 'http';

class WebServer {
  constructor() {
    this.routes = new Map();
  }

  route(method, path, handler) {
    this.routes.set(`${method}:${path}`, handler);
  }

  handle(req, res) {
    const key = `${req.method}:${req.url}`;
    const handler = this.routes.get(key);
    
    if (handler) {
      handler(req, res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  }

  listen(port) {
    http.createServer((req, res) => this.handle(req, res)).listen(port);
    console.log(`Server: http://localhost:${port}`);
  }
}

const server = new WebServer();
server.route('GET', '/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Hello</h1>');
});
if (import.meta.url === `file://${process.argv[1]}`) server.listen(3000);

export default WebServer;
