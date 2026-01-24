// Comment Controller (REST API)
import { CommentService } from '../../1-foundation/services/CommentService.js';
import { asyncHandler } from '../../0-core/errors/handler.js';
import { commentSchemas, validate } from '../../0-core/schemas/validation.js';
import { authenticate } from '../../0-core/auth/middleware.js';

const commentService = new CommentService();

export class CommentController {
  // POST /api/comments
  static create = [
    authenticate,
    validate(commentSchemas.create),
    asyncHandler(async (req, res) => {
      const comment = await commentService.createComment(req.body, req.user.id);
      res.status(201).json({ success: true, data: comment });
    })
  ];

  // GET /api/comments/video/:videoId
  static getByVideo = asyncHandler(async (req, res) => {
    const { limit = 100 } = req.query;
    const comments = await commentService.getCommentsByVideo(
      req.params.videoId,
      parseInt(limit)
    );
    res.json({ success: true, data: comments });
  });

  // GET /api/comments/:id/replies
  static getReplies = asyncHandler(async (req, res) => {
    const { limit = 50 } = req.query;
    const replies = await commentService.getReplies(req.params.id, parseInt(limit));
    res.json({ success: true, data: replies });
  });

  // PUT /api/comments/:id
  static update = [
    authenticate,
    validate(commentSchemas.update),
    asyncHandler(async (req, res) => {
      const updated = await commentService.updateComment(
        req.params.id,
        req.body.text,
        req.user.id
      );
      res.json({ success: true, data: updated });
    })
  ];

  // DELETE /api/comments/:id
  static delete = [
    authenticate,
    asyncHandler(async (req, res) => {
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
      await commentService.deleteComment(req.params.id, req.user.id, isAdmin);
      res.json({ success: true, message: 'Comment deleted' });
    })
  ];

  // POST /api/comments/:id/like
  static like = [
    authenticate,
    asyncHandler(async (req, res) => {
      await commentService.likeComment(req.params.id);
      res.json({ success: true, message: 'Comment liked' });
    })
  ];

  // POST /api/comments/:id/pin
  static pin = [
    authenticate,
    asyncHandler(async (req, res) => {
      await commentService.pinComment(req.params.id, req.user.id);
      res.json({ success: true, message: 'Comment pinned' });
    })
  ];
}

export default CommentController;
