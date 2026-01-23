export class WebSocketGateway {
  constructor() {
    this.connections = new Map()
    this.rooms = new Map()
  }

  connect(clientId, socket) {
    this.connections.set(clientId, { socket, rooms: new Set() })
    return { clientId, status: 'connected' }
  }

  joinRoom(clientId, roomId) {
    const client = this.connections.get(clientId)
    if (client) {
      client.rooms.add(roomId)
      if (!this.rooms.has(roomId)) this.rooms.set(roomId, new Set())
      this.rooms.get(roomId).add(clientId)
    }
  }

  broadcast(roomId, message) {
    const room = this.rooms.get(roomId)
    if (room) {
      room.forEach((clientId) => {
        const client = this.connections.get(clientId)
        if (client) console.log(`Sending to ${clientId}:`, message)
      })
    }
  }

  getStats() {
    return { connections: this.connections.size, rooms: this.rooms.size }
  }
}

export default new WebSocketGateway()
