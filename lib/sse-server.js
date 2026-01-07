/**
 * Server-Sent Events server
 */

class SSEServer { constructor() { this.clients = new Map(); }

  middleware() { return (req, res) => { res.writeHead(200, { 'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive' });

      const clientId = Date.now().toString();
      this.clients.set(clientId, res);

      req.on('close', () => { this.clients.delete(clientId); }); }; }

  broadcast(data) { const message = `data: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach(clientRes => { clientRes.write(message); }); }

  sendTo(clientId, data) { const message = `data: ${JSON.stringify(data)}\n\n`;
    const clientRes = this.clients.get(clientId);
    if (clientRes) clientRes.write(message); } }

if (typeof module !== 'undefined' && module.exports) { module.exports = SSEServer; }
