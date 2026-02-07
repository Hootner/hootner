// Video Domain Events
import { EventEmitter } from 'events';

const eventEmitter = new EventEmitter();

export const VIDEO_EVENTS = {
  VIDEO_UPLOADED: 'video.uploaded',
  VIDEO_PROCESSING_STARTED: 'video.processing_started',
  VIDEO_PROCESSING_COMPLETED: 'video.processing_completed',
  VIDEO_PROCESSING_FAILED: 'video.processing_failed',
  VIDEO_PUBLISHED: 'video.published',
  VIDEO_DELETED: 'video.deleted',
  VIDEO_VIEWED: 'video.viewed',
  VIDEO_LIKED: 'video.liked',
  VIDEO_UNLIKED: 'video.unliked'
};

export const emitVideoUploaded = (video) => {
  eventEmitter.emit(VIDEO_EVENTS.VIDEO_UPLOADED, {
    videoId: video.id,
    userId: video.userId,
    title: video.title,
    timestamp: new Date().toISOString()
  });
};

export const emitVideoPublished = (video) => {
  eventEmitter.emit(VIDEO_EVENTS.VIDEO_PUBLISHED, {
    videoId: video.id,
    userId: video.userId,
    title: video.title,
    timestamp: new Date().toISOString()
  });
};

export const emitVideoViewed = (videoId, userId) => {
  eventEmitter.emit(VIDEO_EVENTS.VIDEO_VIEWED, {
    videoId,
    userId,
    timestamp: new Date().toISOString()
  });
};

export const emitVideoLiked = (videoId, userId) => {
  eventEmitter.emit(VIDEO_EVENTS.VIDEO_LIKED, {
    videoId,
    userId,
    timestamp: new Date().toISOString()
  });
};

export const onVideoEvent = (event, handler) => {
  eventEmitter.on(event, handler);
};

export default {
  VIDEO_EVENTS,
  emitVideoUploaded,
  emitVideoPublished,
  emitVideoViewed,
  emitVideoLiked,
  onVideoEvent
};
