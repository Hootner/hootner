/**
 * WebSocket Collaboration Server
 */

const WebSocket = require('ws');

class CollaborationServer { constructor(port = 3002) { this.wss = new WebSocket.Server({ port });
    this.rooms = new Map();
    this.clients = new Map();
    this.init(); }

  init() { this.wss.on('connection', (ws) => { const clientId = this.generateId();
      this.clients.set(clientId, { ws, rooms: new Set() });

      ws.on('message', (data) => { try { const msg = JSON.parse(data);
          this.handleMessage(clientId, msg); } ' });

      ws.on('close', () => { this.handleDisconnect(clientId); }); }); }

  handleMessage(clientId, msg) { switch (msg.type) { case 'join':
        this.joinRoom(clientId, msg.roomId || 'default', msg.userId);
        break;
      case 'edit':
        this.broadcastEdit(clientId, msg);
        break;
      case 'conflict-resolved':
        this.broadcastResolution(clientId, msg);
        break; } }

  joinRoom(clientId, roomId, userId) { if (!this.rooms.has(roomId)) { this.rooms.set(roomId, new Set()); }

    const room = this.rooms.get(roomId);
    room.add(clientId);

    const client = this.clients.get(clientId);
    client.rooms.add(roomId);
    client.userId = userId;

    this.broadcast(roomId, { type: 'user-joined',
      userId,
      user: { name: userId } }, clientId); }

  broadcastEdit(senderId, msg) { const sender = this.clients.get(senderId);
    sender.rooms.forEach(roomId => { this.broadcast(roomId, msg, senderId); }); }

  broadcastResolution(senderId, msg) { const sender = this.clients.get(senderId);
    sender.rooms.forEach(roomId => { this.broadcast(roomId, msg, senderId); }); }

  broadcast(roomId, msg, excludeId) { const room = this.rooms.get(roomId);
    if (!room) return;

    room.forEach(clientId => { if (clientId !== excludeId) { const client = this.clients.get(clientId);
        if (client?.ws.readyState === WebSocket.OPEN) { client.ws.send(JSON.stringify(msg)); } } }); }

  handleDisconnect(clientId) { const client = this.clients.get(clientId);
    if (!client) return;

    client.rooms.forEach(roomId => { const room = this.rooms.get(roomId);
      room?.delete(clientId);

      this.broadcast(roomId, { type: 'user-left',
        userId: client.userId }); });

    this.clients.delete(clientId); }

  generateId() { return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; } }

if (require.main === module) { new CollaborationServer(3002); }

module.exports = CollaborationServer;
