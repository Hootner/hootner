// Comment Service
import CommentRepository from '../repositories/CommentRepository.js';
import VideoRepository from '../repositories/VideoRepository.js';

export class CommentService {
  constructor() {
    this.repository = new CommentRepository();
    this.videoRepository = new VideoRepository();
  }

  async createComment(commentData, userId) {
    const comment = await this.repository.create({
      ...commentData,
      userId
    });

    // Increment video comment count
    const video = await this.videoRepository.findById(commentData.videoId);
    if (video) {
      await this.videoRepository.update(video.id, {
        commentCount: video.commentCount + 1,
        updatedAt: new Date().toISOString()
      });
    }

    // If reply, increment parent reply count
    if (commentData.parentId) {
      const parent = await this.repository.findById(commentData.parentId);
      if (parent) {
        await this.repository.update(parent.id, {
          replyCount: parent.replyCount + 1,
          updatedAt: new Date().toISOString()
        });
      }
    }

    return comment;
  }

  async getCommentById(id) {
    return await this.repository.findById(id);
  }

  async getCommentsByVideo(videoId, limit = 100) {
    return await this.repository.findByVideo(videoId, limit);
  }

  async getReplies(parentId, limit = 50) {
    return await this.repository.findReplies(parentId, limit);
  }

  async updateComment(id, text, userId) {
    const comment = await this.repository.findById(id);

    if (!comment || comment.userId !== userId) {
      throw new Error('Cannot edit this comment');
    }

    return await this.repository.update(id, {
      text,
      isEdited: true,
      updatedAt: new Date().toISOString()
    });
  }

  async deleteComment(id, userId, isAdmin = false) {
    const comment = await this.repository.findById(id);

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== userId && !isAdmin) {
      throw new Error('Cannot delete this comment');
    }

    return await this.repository.softDelete(id);
  }

  async pinComment(id, userId) {
    return await this.repository.pin(id);
  }

  async likeComment(id) {
    const comment = await this.repository.findById(id);
    if (comment) {
      comment.incrementLikes();
      await this.repository.update(id, {
        likeCount: comment.likeCount,
        updatedAt: comment.updatedAt
      });
    }
    return comment;
  }
}

export default CommentService;
