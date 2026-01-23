import { PubSub, withFilter } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

// Use Redis for production, in-memory for development
const pubsub = process.env.REDIS_URL 
  ? new RedisPubSub({
      publisher: new Redis(process.env.REDIS_URL),
      subscriber: new Redis(process.env.REDIS_URL)
    })
  : new PubSub();

const resolvers = {
  // Video events
  videoProcessed: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(['VIDEO_PROCESSED']),
      (payload, variables) => {
        return !variables.userId || payload.videoProcessed.userId === variables.userId;
      }
    )
  },

  videoProgress: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(['VIDEO_PROGRESS']),
      (payload, variables) => {
        return payload.videoProgress.videoId === variables.videoId;
      }
    )
  },

  // Video likes
  videoLiked: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(['VIDEO_LIKED']),
      (payload, variables) => {
        return !variables.videoId || payload.videoLiked.id === variables.videoId;
      }
    )
  },

  // Comments
  commentAdded: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(['COMMENT_ADDED']),
      (payload, variables) => {
        return !variables.videoId || payload.commentAdded.video.id === variables.videoId;
      }
    )
  },

  // Generation events
  generationProgress: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(['GENERATION_PROGRESS']),
      (payload, variables) => {
        return payload.generationProgress.jobId === variables.jobId;
      }
    )
  },

  generationCompleted: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(['GENERATION_COMPLETED']),
      (payload, variables) => {
        return !variables.userId || payload.generationCompleted.userId === variables.userId;
      }
    )
  },

  // Stream events
  streamStarted: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(['STREAM_STARTED']),
      (payload, variables) => {
        return !variables.userId || payload.streamStarted.userId === variables.userId;
      }
    )
  },

  streamEnded: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(['STREAM_ENDED']),
      (payload, variables) => {
        return payload.streamEnded.streamId === variables.streamId;
      }
    )
  },

  streamViewers: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(['STREAM_VIEWERS']),
      (payload, variables) => {
        return payload.streamViewers.streamId === variables.streamId;
      }
    )
  },

  streamQuality: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(['STREAM_QUALITY']),
      (payload, variables) => {
        return payload.streamQuality.streamId === variables.streamId;
      }
    )
  },

  // User activity
  userActivity: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(['USER_ACTIVITY']),
      (payload, variables) => {
        return payload.userActivity.userId === variables.userId;
      }
    )
  },

  // System alerts
  systemAlert: {
    subscribe: () => pubsub.asyncIterator(['SYSTEM_ALERT'])
  },

  // Real-time activity stream for dashboard/monitoring
  activityStream: {
    subscribe: () => pubsub.asyncIterator(['ACTIVITY_STREAM']),
    resolve: (payload) => payload.activityStream
  }
};

// Export pubsub for use in other resolvers
export { pubsub };

export default resolvers;
