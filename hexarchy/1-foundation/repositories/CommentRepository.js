// Comment Repository
import { BaseRepository } from './BaseRepository.js';
import { Comment } from '../models/Comment.js';

export class CommentRepository extends BaseRepository {
  constructor() {
    super(process.env.COMMENTS_TABLE || 'Comments');
  }

  async create(commentData) {
    const comment = new Comment({
      id: `comment-${Date.now()}`,
      ...commentData
    });
    await super.create(comment);
    return comment;
  }

  async findById(id) {
    const data = await super.findById(id);
    return data ? new Comment(data) : null;
  }

  async findByVideo(videoId, limit = 100) {
    const results = await this.query(
      'videoId = :videoId AND isDeleted = :isDeleted',
      { ':videoId': videoId, ':isDeleted': false },
      { IndexName: 'VideoIndex', Limit: limit, ScanIndexForward: false }
    );
    return results.map(data => new Comment(data));
  }

  async findReplies(parentId, limit = 50) {
    const results = await this.query(
      'parentId = :parentId AND isDeleted = :isDeleted',
      { ':parentId': parentId, ':isDeleted': false },
      { IndexName: 'ParentIndex', Limit: limit }
    );
    return results.map(data => new Comment(data));
  }

  async findByUser(userId, limit = 100) {
    const results = await this.query(
      'userId = :userId',
      { ':userId': userId },
      { IndexName: 'UserIndex', Limit: limit, ScanIndexForward: false }
    );
    return results.map(data => new Comment(data));
  }

  async softDelete(id) {
    return await this.update(id, {
      isDeleted: true,
      text: '[Deleted]',
      updatedAt: new Date().toISOString()
    });
  }

  async pin(id) {
    return await this.update(id, {
      isPinned: true,
      updatedAt: new Date().toISOString()
    });
  }
}

export default CommentRepository;
