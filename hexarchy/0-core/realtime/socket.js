// Socket.io Real-time Configuration
import { Server } from 'socket.io';
import { verifyToken } from '../auth/jwt.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.id}`);

    // Join user-specific room
    socket.join(`user:${socket.user.id}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.id}`);
    });

    // Video watch party
    socket.on('join:watch-party', (partyId) => {
      socket.join(`party:${partyId}`);
      socket.to(`party:${partyId}`).emit('user:joined', socket.user);
    });

    socket.on('leave:watch-party', (partyId) => {
      socket.leave(`party:${partyId}`);
      socket.to(`party:${partyId}`).emit('user:left', socket.user);
    });

    // Live chat
    socket.on('chat:message', (data) => {
      io.to(`party:${data.partyId}`).emit('chat:message', {
        user: socket.user,
        message: data.message,
        timestamp: Date.now()
      });
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitToUser = (userId, event, data) => {
  getIO().to(`user:${userId}`).emit(event, data);
};

export const emitToParty = (partyId, event, data) => {
  getIO().to(`party:${partyId}`).emit(event, data);
};

export default { initializeSocket, getIO, emitToUser, emitToParty };
