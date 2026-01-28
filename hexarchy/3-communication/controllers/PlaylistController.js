
import xss from 'xss';

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input);
  }
  return input;
};
// Playlist Controller (REST API)
import { PlaylistService } from '../../1-foundation/services/PlaylistService.js';
import { asyncHandler } from '../../0-core/errors/handler.js';
import { authenticate, optionalAuth } from '../../0-core/auth/middleware.js';

const playlistService = new PlaylistService();

export class PlaylistController {
  // POST /api/playlists
  static create = [
    authenticate,
    asyncHandler(async (req, res) => {
      const playlist = await playlistService.createPlaylist(req.body, req.user.id);
      res.status(201).json({ success: true, data: playlist });
    })
  ];

  // GET /api/playlists
  static list = [
    optionalAuth,
    asyncHandler(async (req, res) => {
      const { limit = 100 } = req.query;
      const playlists = await playlistService.getPublicPlaylists(parseInt(limit));
      res.json({ success: true, data: playlists });
    })
  ];

  // GET /api/playlists/:id
  static getById = [
    optionalAuth,
    asyncHandler(async (req, res) => {
      const playlist = await playlistService.getPlaylistById(req.params.id);

      if (!playlist) {
        return res.status(404).json({ success: false, error: 'Playlist not found' });
      }

      // Check permissions
      if (!playlist.canBeViewedBy(req.user)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      res.json({ success: true, data: playlist });
    })
  ];

  // GET /api/playlists/user/:userId
  static getByUser = asyncHandler(async (req, res) => {
    const { limit = 100 } = req.query;
    const playlists = await playlistService.getPlaylistsByUser(
      req.params.userId,
      parseInt(limit)
    );
    res.json({ success: true, data: playlists });
  });

  // PUT /api/playlists/:id
  static update = [
    authenticate,
    asyncHandler(async (req, res) => {
      const updated = await playlistService.updatePlaylist(
        req.params.id,
        req.body,
        req.user.id
      );
      res.json({ success: true, data: updated });
    })
  ];

  // DELETE /api/playlists/:id
  static delete = [
    authenticate,
    asyncHandler(async (req, res) => {
      await playlistService.deletePlaylist(req.params.id, req.user.id);
      res.json({ success: true, message: 'Playlist deleted' });
    })
  ];

  // POST /api/playlists/:id/videos
  static addVideo = [
    authenticate,
    asyncHandler(async (req, res) => {
      const { videoId: sanitizeInput(videoId) } = req.body;
      await playlistService.addVideo(req.params.id, videoId, req.user.id);
      res.json({ success: true, message: 'Video added to playlist' });
    })
  ];

  // DELETE /api/playlists/:id/videos/:videoId
  static removeVideo = [
    authenticate,
    asyncHandler(async (req, res) => {
      await playlistService.removeVideo(
        req.params.id,
        req.params.videoId,
        req.user.id
      );
      res.json({ success: true, message: 'Video removed from playlist' });
    })
  ];

  // PUT /api/playlists/:id/reorder
  static reorder = [
    authenticate,
    asyncHandler(async (req, res) => {
      const { videoIds: sanitizeInput(videoIds) } = req.body;
      await playlistService.reorderVideos(req.params.id, videoIds, req.user.id);
      res.json({ success: true, message: 'Playlist reordered' });
    })
  ];
}

export default PlaylistController;
