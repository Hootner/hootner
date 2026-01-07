// Minimal Reverse Proxy
import http from 'http';

class ReverseProxy {
  constructor(target) {
    this.target = target;
  }

  forward(req, res) {
    const options = {
      hostname: this.target.host,
      port: this.target.port,
      path: req.url,
      method: req.method,
      headers: req.headers
    };

    const proxy = http.request(options, proxyRes => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    req.pipe(proxy);
  }

  listen(port) {
    http.createServer((req, res) => this.forward(req, res)).listen(port);
    console.log(`Proxy: localhost:${port} -> ${this.target.host}:${this.target.port}`);
  }
}

const proxy = new ReverseProxy({ host: 'example.com', port: 80 });
if (import.meta.url === `file://${process.argv[1]}`) proxy.listen(8080);

export default ReverseProxy;
