// Notification WebSocket Handler
import { getIO } from '../../0-core/realtime/socket.js';
import { logger } from '../../0-core/logging/logger.js';

export class NotificationHandler {
  constructor() {
    this.userSockets = new Map(); // userId -> socketId[]
  }

  initialize(io) {
    io.on('connection', (socket) => {
      // Register user for notifications
      socket.on('notifications:register', ({ userId }) => {
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, []);
        }
        this.userSockets.get(userId).push(socket.id);

        socket.userId = userId;
        socket.join(`user:${userId}`);

        logger.info('User registered for notifications', { userId, socketId: socket.id });
      });

      // Unregister
      socket.on('notifications:unregister', ({ userId }) => {
        if (this.userSockets.has(userId)) {
          const sockets = this.userSockets.get(userId);
          const index = sockets.indexOf(socket.id);
          if (index > -1) {
            sockets.splice(index, 1);
          }
        }
        socket.leave(`user:${userId}`);
      });

      // Mark as read
      socket.on('notifications:read', ({ notificationId }) => {
        // Could update database here
        logger.info('Notification marked as read', { notificationId });
      });

      // Disconnect
      socket.on('disconnect', () => {
        if (socket.userId && this.userSockets.has(socket.userId)) {
          const sockets = this.userSockets.get(socket.userId);
          const index = sockets.indexOf(socket.id);
          if (index > -1) {
            sockets.splice(index, 1);
          }
        }
      });
    });
  }

  // Send notification to user
  sendToUser(userId, notification) {
    const io = getIO();
    io.to(`user:${userId}`).emit('notification:new', notification);
    logger.info('Notification sent to user', { userId, notificationId: notification.id });
  }

  // Send notification to multiple users
  sendToUsers(userIds, notification) {
    userIds.forEach(userId => this.sendToUser(userId, notification));
  }

  // Broadcast to all connected users
  broadcast(notification) {
    const io = getIO();
    io.emit('notification:broadcast', notification);
    logger.info('Notification broadcast to all users');
  }
}

export default new NotificationHandler();
