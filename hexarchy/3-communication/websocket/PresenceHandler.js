// Presence WebSocket Handler (Online/Offline Status)
import { getIO } from '../../0-core/realtime/socket.js';
import { logger } from '../../0-core/logging/logger.js';

export class PresenceHandler {
  constructor() {
    this.onlineUsers = new Map(); // userId -> { status, lastSeen, socketIds }
  }

  initialize(io) {
    io.on('connection', (socket) => {
      // User comes online
      socket.on('presence:online', ({ userId, username }) => {
        if (!this.onlineUsers.has(userId)) {
          this.onlineUsers.set(userId, {
            userId,
            username,
            status: 'online',
            lastSeen: new Date().toISOString(),
            socketIds: []
          });
        }

        const user = this.onlineUsers.get(userId);
        user.socketIds.push(socket.id);
        user.status = 'online';
        user.lastSeen = new Date().toISOString();

        socket.userId = userId;

        // Broadcast online status
        io.emit('presence:user-online', {
          userId,
          username,
          timestamp: user.lastSeen
        });

        logger.info('User online', { userId });
      });

      // User status update (online, away, busy, offline)
      socket.on('presence:status', ({ userId, status }) => {
        if (this.onlineUsers.has(userId)) {
          const user = this.onlineUsers.get(userId);
          user.status = status;
          user.lastSeen = new Date().toISOString();

          io.emit('presence:status-changed', {
            userId,
            status,
            timestamp: user.lastSeen
          });

          logger.info('User status changed', { userId, status });
        }
      });

      // Heartbeat to keep connection alive
      socket.on('presence:heartbeat', ({ userId }) => {
        if (this.onlineUsers.has(userId)) {
          const user = this.onlineUsers.get(userId);
          user.lastSeen = new Date().toISOString();
        }
      });

      // Get online users
      socket.on('presence:get-online', (callback) => {
        const online = Array.from(this.onlineUsers.values())
          .filter(u => u.status !== 'offline')
          .map(u => ({
            userId: u.userId,
            username: u.username,
            status: u.status,
            lastSeen: u.lastSeen
          }));

        if (callback) callback(online);
      });

      // Get user status
      socket.on('presence:get-status', ({ userId }, callback) => {
        const user = this.onlineUsers.get(userId);
        if (callback) {
          callback(user || { userId, status: 'offline' });
        }
      });

      // Disconnect
      socket.on('disconnect', () => {
        if (socket.userId && this.onlineUsers.has(socket.userId)) {
          const user = this.onlineUsers.get(socket.userId);
          user.socketIds = user.socketIds.filter(id => id !== socket.id);

          // If no more sockets, mark as offline
          if (user.socketIds.length === 0) {
            user.status = 'offline';
            user.lastSeen = new Date().toISOString();

            io.emit('presence:user-offline', {
              userId: socket.userId,
              username: user.username,
              timestamp: user.lastSeen
            });

            logger.info('User offline', { userId: socket.userId });
          }
        }
      });
    });
  }

  // Get online users
  getOnlineUsers() {
    return Array.from(this.onlineUsers.values())
      .filter(u => u.status !== 'offline');
  }

  // Get user status
  getUserStatus(userId) {
    const user = this.onlineUsers.get(userId);
    return user ? user.status : 'offline';
  }

  // Check if user is online
  isUserOnline(userId) {
    const user = this.onlineUsers.get(userId);
    return user && user.status !== 'offline';
  }

  // Get online count
  getOnlineCount() {
    return this.getOnlineUsers().length;
  }
}

export default new PresenceHandler();
