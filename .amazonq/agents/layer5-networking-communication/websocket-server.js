#!/usr/bin/env node
/**
 * Layer 5: WebSocket Server - Real-time bidirectional communication
 * Dependencies: Layer 0 (Binary), Layer 2 (Parser), Layer 5 (HTTP)
 */

class WebSocketServer {
  constructor() {
    this.clients = new Map();
    this.nextId = 1;
    this.messages = [];
  }

  // WebSocket handshake
  handshake(request) {
    const key = request.headers['sec-websocket-key'];
    const magic = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
    const accept = Buffer.from(key + magic).toString('base64').slice(0, 28);
    
    return [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${accept}`,
      '',
      ''
    ].join('\r\n');
  }

  // Connect client
  connect(clientId = null) {
    const id = clientId || `client-${this.nextId++}`;
    this.clients.set(id, { id, connected: Date.now(), messages: [] });
    console.log(`[CONNECT] ${id}`);
    return id;
  }

  // Parse WebSocket frame
  parseFrame(data) {
    const bytes = Buffer.from(data, 'hex');
    const fin = (bytes[0] & 0x80) !== 0;
    const opcode = bytes[0] & 0x0F;
    const masked = (bytes[1] & 0x80) !== 0;
    let payloadLen = bytes[1] & 0x7F;
    let offset = 2;
    
    if (payloadLen === 126) {
      payloadLen = bytes.readUInt16BE(2);
      offset = 4;
    }
    
    const payload = masked 
      ? bytes.slice(offset + 4, offset + 4 + payloadLen)
      : bytes.slice(offset, offset + payloadLen);
    
    return { fin, opcode, masked, payload: payload.toString() };
  }

  // Build WebSocket frame
  buildFrame(data, opcode = 0x01) {
    const payload = Buffer.from(data);
    const len = payload.length;
    const frame = [];
    
    frame.push(0x80 | opcode); // FIN + opcode
    
    if (len < 126) {
      frame.push(len);
    } else {
      frame.push(126);
      frame.push((len >> 8) & 0xFF);
      frame.push(len & 0xFF);
    }
    
    return Buffer.concat([Buffer.from(frame), payload]).toString('hex');
  }

  // Send message
  send(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) throw new Error('Client not found');
    
    const frame = this.buildFrame(message);
    client.messages.push({ type: 'sent', message, time: Date.now() });
    this.messages.push({ from: 'server', to: clientId, message });
    console.log(`[SEND] ${clientId}: ${message}`);
    return frame;
  }

  // Receive message
  receive(clientId, frameHex) {
    const client = this.clients.get(clientId);
    const frame = this.parseFrame(frameHex);
    
    client.messages.push({ type: 'received', message: frame.payload, time: Date.now() });
    this.messages.push({ from: clientId, to: 'server', message: frame.payload });
    console.log(`[RECV] ${clientId}: ${frame.payload}`);
    
    return frame.payload;
  }

  // Broadcast to all clients
  broadcast(message, except = null) {
    for (const [id, client] of this.clients) {
      if (id !== except) this.send(id, message);
    }
  }

  // Disconnect client
  disconnect(clientId) {
    this.clients.delete(clientId);
    console.log(`[DISCONNECT] ${clientId}`);
  }
}

// Demo
if (require.main === module) {
  const ws = new WebSocketServer();
  
  console.log('=== WebSocket Server Demo ===\n');
  
  // Connect clients
  const alice = ws.connect('alice');
  const bob = ws.connect('bob');
  
  // Send messages
  ws.send(alice, 'Hello Bob!');
  ws.send(bob, 'Hi Alice!');
  
  // Broadcast
  ws.broadcast('Server announcement', alice);
  
  // Simulate receiving
  const frame = ws.buildFrame('Client message');
  ws.receive(alice, frame);
  
  console.log('\nClients:', ws.clients.size);
  console.log('Messages:', ws.messages.length);
}

module.exports = WebSocketServer;
