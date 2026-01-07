// Minimal TCP/IP Stack
class TCPIPStack {
  constructor() {
    this.connections = new Map();
  }

  sendIP(dest, data) {
    console.log(`IP: ${dest} <- ${data.length} bytes`);
    return { dest, data };
  }

  connect(host, port) {
    const id = `${host}:${port}`;
    this.connections.set(id, { state: 'SYN_SENT' });
    console.log(`TCP: Connect ${id}`);
    return id;
  }

  send(id, data) {
    if (!this.connections.has(id)) throw new Error('Not connected');
    const [host] = id.split(':');
    this.sendIP(host, data);
  }
}

const stack = new TCPIPStack();
const conn = stack.connect('192.168.1.1', 80);
stack.send(conn, Buffer.from('GET /'));

export default TCPIPStack;
