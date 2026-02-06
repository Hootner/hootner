// Video Sync WebSocket Handler (Watch Parties)
import { getIO } from '../../0-core/realtime/socket.js';
import { logger } from '../../0-core/logging/logger.js';

export class VideoSyncHandler {
  constructor() {
    this.watchParties = new Map(); // partyId -> { videoId, host, viewers, state }
  }

  initialize(io) {
    io.on('connection', (socket) => {
      // Create watch party
      socket.on('watch-party:create', ({ videoId, userId, username }) => {
        const partyId = `party-${Date.now()}`;
        const party = {
          partyId,
          videoId,
          host: { userId, username, socketId: socket.id },
          viewers: [],
          state: {
            playing: false,
            currentTime: 0,
            playbackRate: 1
          },
          createdAt: new Date().toISOString()
        };

        this.watchParties.set(partyId, party);
        socket.join(partyId);

        socket.emit('watch-party:created', { partyId, party });
        logger.info('Watch party created', { partyId, videoId, userId });
      });

      // Join watch party
      socket.on('watch-party:join', ({ partyId, userId, username }) => {
        const party = this.watchParties.get(partyId);
        if (!party) {
          socket.emit('watch-party:error', { message: 'Watch party not found' });
          return;
        }

        socket.join(partyId);
        party.viewers.push({ userId, username, socketId: socket.id });

        // Send current state to new viewer
        socket.emit('watch-party:state', party.state);

        // Notify others
        socket.to(partyId).emit('watch-party:viewer-joined', {
          userId,
          username,
          viewerCount: party.viewers.length + 1
        });

        logger.info('User joined watch party', { partyId, userId });
      });

      // Leave watch party
      socket.on('watch-party:leave', ({ partyId, userId }) => {
        const party = this.watchParties.get(partyId);
        if (!party) return;

        socket.leave(partyId);
        party.viewers = party.viewers.filter(v => v.socketId !== socket.id);

        socket.to(partyId).emit('watch-party:viewer-left', {
          userId,
          viewerCount: party.viewers.length + 1
        });

        // Delete party if host leaves and no viewers
        if (party.host.socketId === socket.id && party.viewers.length === 0) {
          this.watchParties.delete(partyId);
          logger.info('Watch party deleted', { partyId });
        }
      });

      // Play/Pause sync
      socket.on('watch-party:play', ({ partyId }) => {
        const party = this.watchParties.get(partyId);
        if (!party || party.host.socketId !== socket.id) return;

        party.state.playing = true;
        io.to(partyId).emit('watch-party:play', {
          timestamp: new Date().toISOString()
        });
      });

      socket.on('watch-party:pause', ({ partyId }) => {
        const party = this.watchParties.get(partyId);
        if (!party || party.host.socketId !== socket.id) return;

        party.state.playing = false;
        io.to(partyId).emit('watch-party:pause', {
          timestamp: new Date().toISOString()
        });
      });

      // Seek sync
      socket.on('watch-party:seek', ({ partyId, currentTime }) => {
        const party = this.watchParties.get(partyId);
        if (!party || party.host.socketId !== socket.id) return;

        party.state.currentTime = currentTime;
        io.to(partyId).emit('watch-party:seek', {
          currentTime,
          timestamp: new Date().toISOString()
        });
      });

      // Playback rate sync
      socket.on('watch-party:playback-rate', ({ partyId, playbackRate }) => {
        const party = this.watchParties.get(partyId);
        if (!party || party.host.socketId !== socket.id) return;

        party.state.playbackRate = playbackRate;
        io.to(partyId).emit('watch-party:playback-rate', { playbackRate });
      });

      // Chat during watch party
      socket.on('watch-party:chat', ({ partyId, userId, username, message }) => {
        io.to(partyId).emit('watch-party:chat', {
          userId,
          username,
          message,
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  getWatchParty(partyId) {
    return this.watchParties.get(partyId);
  }

  getAllParties() {
    return Array.from(this.watchParties.values());
  }
}

export default new VideoSyncHandler();
