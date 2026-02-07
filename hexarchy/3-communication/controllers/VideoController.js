// Video Controller (REST API)
import { VideoService } from '../../1-foundation/services/VideoService.js';
import { asyncHandler } from '../../0-core/errors/handler.js';
import { videoSchemas, validate } from '../../0-core/schemas/validation.js';
import { authenticate, optionalAuth } from '../../0-core/auth/middleware.js';
import { upload } from '../../0-core/storage/upload.js';

const videoService = new VideoService();

export class VideoController {
  // POST /api/videos
  static upload = [
    authenticate,
    upload.single('video'),
    validate(videoSchemas.create),
    asyncHandler(async (req, res) => {
      const videoData = {
        ...req.body,
        url: req.file.location,
        size: req.file.size,
        format: req.file.mimetype
      };

      const video = await videoService.createVideo(
        videoData,
        req.user.id,
        req.ip,
        req.get('user-agent')
      );

      res.status(201).json({ success: true, data: video });
    })
  ];

  // GET /api/videos
  static list = [
    optionalAuth,
    asyncHandler(async (req, res) => {
      const { category, limit = 20 } = req.query;

      let videos;
      if (category) {
        videos = await videoService.getVideosByCategory(category, parseInt(limit));
      } else {
        videos = await videoService.getPublicVideos(parseInt(limit));
      }

      res.json({ success: true, data: videos, count: videos.length });
    })
  ];

  // GET /api/videos/trending
  static trending = asyncHandler(async (req, res) => {
    const { limit = 20 } = req.query;
    const videos = await videoService.getTrendingVideos(parseInt(limit));
    res.json({ success: true, data: videos });
  });

  // GET /api/videos/:id
  static getById = [
    optionalAuth,
    asyncHandler(async (req, res) => {
      const video = await videoService.getVideoById(req.params.id);

      if (!video) {
        return res.status(404).json({ success: false, error: 'Video not found' });
      }

      // Check permissions
      if (!videoService.canUserViewVideo(video, req.user)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      // Increment views
      await videoService.incrementViews(video.id);

      res.json({ success: true, data: video });
    })
  ];

  // GET /api/videos/user/:userId
  static getByUser = asyncHandler(async (req, res) => {
    const { limit = 20 } = req.query;
    const videos = await videoService.getVideosByUser(req.params.userId, parseInt(limit));
    res.json({ success: true, data: videos });
  });

  // PUT /api/videos/:id
  static update = [
    authenticate,
    validate(videoSchemas.update),
    asyncHandler(async (req, res) => {
      const video = await videoService.getVideoById(req.params.id);

      if (!video || video.userId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const updated = await videoService.updateVideo(
        req.params.id,
        req.body,
        req.user.id,
        req.ip,
        req.get('user-agent')
      );

      res.json({ success: true, data: updated });
    })
  ];

  // DELETE /api/videos/:id
  static delete = [
    authenticate,
    asyncHandler(async (req, res) => {
      const video = await videoService.getVideoById(req.params.id);

      if (!video || video.userId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      await videoService.deleteVideo(
        req.params.id,
        req.user.id,
        req.ip,
        req.get('user-agent')
      );

      res.json({ success: true, message: 'Video deleted' });
    })
  ];

  // POST /api/videos/:id/like
  static like = [
    authenticate,
    asyncHandler(async (req, res) => {
      await videoService.likeVideo(req.params.id, req.user.id);
      res.json({ success: true, message: 'Video liked' });
    })
  ];

  // POST /api/videos/:id/publish
  static publish = [
    authenticate,
    asyncHandler(async (req, res) => {
      const video = await videoService.getVideoById(req.params.id);

      if (!video || video.userId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      await videoService.publishVideo(req.params.id, req.user.id);
      res.json({ success: true, message: 'Video published' });
    })
  ];
}

export default VideoController;
