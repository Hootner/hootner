// Video Service
import VideoRepository from '../repositories/VideoRepository.js';
import { auditLog, AUDIT_EVENTS } from '../../0-core/audit/logger.js';
import { sendWebhook, WEBHOOK_EVENTS } from '../../0-core/webhooks/sender.js';
import { addJob } from '../../0-core/jobs/queue.js';

export class VideoService {
  constructor() {
    this.repository = new VideoRepository();
  }

  async createVideo(videoData, userId, ipAddress, userAgent) {
    const video = await this.repository.create({
      ...videoData,
      userId,
      status: 'processing'
    });

    // Queue video processing
    await addJob('videoProcessing', 'process-video', {
      videoId: video.id,
      url: video.url
    });

    // Audit log
    await auditLog({
      event: AUDIT_EVENTS.VIDEO_UPLOADED,
      userId,
      resourceType: 'video',
      resourceId: video.id,
      action: 'create',
      ipAddress,
      userAgent
    });

    // Webhook
    await sendWebhook(WEBHOOK_EVENTS.VIDEO_UPLOADED, {
      videoId: video.id,
      userId,
      title: video.title
    });

    return video;
  }

  async getVideoById(id) {
    return await this.repository.findById(id);
  }

  async getVideosByUser(userId, limit = 100) {
    return await this.repository.findByUser(userId, limit);
  }

  async getPublicVideos(limit = 100) {
    return await this.repository.findPublic(limit);
  }

  async getVideosByCategory(category, limit = 100) {
    return await this.repository.findByCategory(category, limit);
  }

  async getTrendingVideos(limit = 20) {
    return await this.repository.getTrending(limit);
  }

  async updateVideo(id, updates, userId, ipAddress, userAgent) {
    const video = await this.repository.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    await auditLog({
      event: AUDIT_EVENTS.VIDEO_UPDATED,
      userId,
      resourceType: 'video',
      resourceId: id,
      action: 'update',
      ipAddress,
      userAgent,
      metadata: { updates }
    });

    return video;
  }

  async deleteVideo(id, userId, ipAddress, userAgent) {
    await this.repository.delete(id);

    await auditLog({
      event: AUDIT_EVENTS.VIDEO_DELETED,
      userId,
      resourceType: 'video',
      resourceId: id,
      action: 'delete',
      ipAddress,
      userAgent
    });

    return true;
  }

  async incrementViews(id) {
    return await this.repository.incrementViews(id);
  }

  async likeVideo(id, userId) {
    return await this.repository.incrementLikes(id);
  }

  async publishVideo(id, userId) {
    const video = await this.repository.publish(id);

    await sendWebhook(WEBHOOK_EVENTS.VIDEO_PROCESSED, {
      videoId: id,
      userId,
      status: 'published'
    });

    return video;
  }

  async canUserViewVideo(video, user) {
    if (!video) return false;
    return video.canBeViewedBy(user);
  }
}

export default VideoService;
