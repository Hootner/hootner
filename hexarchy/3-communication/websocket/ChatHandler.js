// Chat WebSocket Handler
import { getIO } from '../../0-core/realtime/socket.js';
import { logger } from '../../0-core/logging/logger.js';

export class ChatHandler {
  constructor() {
    this.rooms = new Map(); // room -> users[]
    this.userRooms = new Map(); // userId -> room[]
  }

  initialize(io) {
    io.on('connection', (socket) => {
      logger.info('Client connected to chat', { socketId: socket.id });

      // Join room
      socket.on('chat:join', ({ roomId, userId, username }) => {
        socket.join(roomId);

        if (!this.rooms.has(roomId)) {
          this.rooms.set(roomId, []);
        }
        this.rooms.get(roomId).push({ userId, username, socketId: socket.id });

        if (!this.userRooms.has(userId)) {
          this.userRooms.set(userId, []);
        }
        this.userRooms.get(userId).push(roomId);

        // Notify room
        io.to(roomId).emit('chat:user-joined', {
          userId,
          username,
          timestamp: new Date().toISOString()
        });

        // Send room info
        socket.emit('chat:room-info', {
          roomId,
          users: this.rooms.get(roomId),
          count: this.rooms.get(roomId).length
        });

        logger.info('User joined chat room', { userId, roomId });
      });

      // Leave room
      socket.on('chat:leave', ({ roomId, userId, username }) => {
        socket.leave(roomId);

        if (this.rooms.has(roomId)) {
          const users = this.rooms.get(roomId);
          const index = users.findIndex(u => u.socketId === socket.id);
          if (index > -1) {
            users.splice(index, 1);
          }
        }

        // Notify room
        io.to(roomId).emit('chat:user-left', {
          userId,
          username,
          timestamp: new Date().toISOString()
        });

        logger.info('User left chat room', { userId, roomId });
      });

      // Send message
      socket.on('chat:message', ({ roomId, userId, username, message }) => {
        const messageData = {
          id: `msg-${Date.now()}`,
          roomId,
          userId,
          username,
          message,
          timestamp: new Date().toISOString()
        };

        // Broadcast to room
        io.to(roomId).emit('chat:message', messageData);

        logger.info('Chat message sent', { userId, roomId });
      });

      // Typing indicator
      socket.on('chat:typing', ({ roomId, userId, username, isTyping }) => {
        socket.to(roomId).emit('chat:typing', {
          userId,
          username,
          isTyping
        });
      });

      // Disconnect
      socket.on('disconnect', () => {
        // Remove user from all rooms
        this.rooms.forEach((users, roomId) => {
          const index = users.findIndex(u => u.socketId === socket.id);
          if (index > -1) {
            const user = users[index];
            users.splice(index, 1);

            io.to(roomId).emit('chat:user-left', {
              userId: user.userId,
              username: user.username,
              timestamp: new Date().toISOString()
            });
          }
        });

        logger.info('Client disconnected from chat', { socketId: socket.id });
      });
    });
  }

  getRoomUsers(roomId) {
    return this.rooms.get(roomId) || [];
  }

  getUserRooms(userId) {
    return this.userRooms.get(userId) || [];
  }
}

export default new ChatHandler();
