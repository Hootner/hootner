// Video Repository
import { BaseRepository } from './BaseRepository.js';
import { Video } from '../models/Video.js';

export class VideoRepository extends BaseRepository {
  constructor() {
    super(process.env.VIDEOS_TABLE || 'Videos');
  }

  async create(videoData) {
    const video = new Video({
      id: `video-${Date.now()}`,
      ...videoData
    });
    await super.create(video);
    return video;
  }

  async findById(id) {
    const data = await super.findById(id);
    return data ? new Video(data) : null;
  }

  async findByUser(userId, limit = 100) {
    const results = await this.query(
      'userId = :userId',
      { ':userId': userId },
      { IndexName: 'UserIndex', Limit: limit, ScanIndexForward: false }
    );
    return results.map(data => new Video(data));
  }

  async findPublic(limit = 100) {
    const results = await this.query(
      'visibility = :visibility AND #status = :status',
      { ':visibility': 'public', ':status': 'published' },
      {
        IndexName: 'VisibilityIndex',
        Limit: limit,
        ScanIndexForward: false,
        ExpressionAttributeNames: { '#status': 'status' }
      }
    );
    return results.map(data => new Video(data));
  }

  async findByCategory(category, limit = 100) {
    const results = await this.query(
      'category = :category',
      { ':category': category },
      { IndexName: 'CategoryIndex', Limit: limit, ScanIndexForward: false }
    );
    return results.map(data => new Video(data));
  }

  async findByTag(tag, limit = 100) {
    const results = await this.query(
      'contains(tags, :tag)',
      { ':tag': tag },
      { Limit: limit }
    );
    return results.map(data => new Video(data));
  }

  async incrementViews(id) {
    return await this.update(id, {
      viewCount: { $add: 1 },
      updatedAt: new Date().toISOString()
    });
  }

  async incrementLikes(id) {
    return await this.update(id, {
      likeCount: { $add: 1 },
      updatedAt: new Date().toISOString()
    });
  }

  async publish(id) {
    return await this.update(id, {
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async getTrending(limit = 20) {
    // Implementation depends on how you calculate trending
    const results = await this.findPublic(limit * 2);
    return results
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  }
}

export default VideoRepository;
