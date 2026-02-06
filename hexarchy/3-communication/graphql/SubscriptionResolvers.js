// GraphQL Subscription Resolvers
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

// Subscription topics
export const TOPICS = {
  VIDEO_UPLOADED: 'VIDEO_UPLOADED',
  VIDEO_PROCESSED: 'VIDEO_PROCESSED',
  COMMENT_ADDED: 'COMMENT_ADDED',
  NOTIFICATION_RECEIVED: 'NOTIFICATION_RECEIVED',
  USER_ACTIVITY: 'USER_ACTIVITY',
  LIKE_RECEIVED: 'LIKE_RECEIVED'
};

export const Subscription = {
  // Subscribe to new videos
  videoUploaded: {
    subscribe: () => pubsub.asyncIterator([TOPICS.VIDEO_UPLOADED])
  },

  // Subscribe to video processing updates
  videoProcessed: {
    subscribe: (_, { videoId }) => {
      return pubsub.asyncIterator([`${TOPICS.VIDEO_PROCESSED}_${videoId}`]);
    }
  },

  // Subscribe to new comments on a video
  commentAdded: {
    subscribe: (_, { videoId }) => {
      return pubsub.asyncIterator([`${TOPICS.COMMENT_ADDED}_${videoId}`]);
    }
  },

  // Subscribe to user notifications
  notificationReceived: {
    subscribe: (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return pubsub.asyncIterator([`${TOPICS.NOTIFICATION_RECEIVED}_${user.id}`]);
    }
  },

  // Subscribe to user activity
  userActivity: {
    subscribe: (_, { userId }) => {
      return pubsub.asyncIterator([`${TOPICS.USER_ACTIVITY}_${userId}`]);
    }
  },

  // Subscribe to likes on user's content
  likeReceived: {
    subscribe: (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return pubsub.asyncIterator([`${TOPICS.LIKE_RECEIVED}_${user.id}`]);
    }
  }
};

// Publish functions
export const publish = {
  videoUploaded: (video) => {
    pubsub.publish(TOPICS.VIDEO_UPLOADED, { videoUploaded: video });
  },

  videoProcessed: (videoId, status) => {
    pubsub.publish(`${TOPICS.VIDEO_PROCESSED}_${videoId}`, {
      videoProcessed: { videoId, status, timestamp: new Date().toISOString() }
    });
  },

  commentAdded: (comment) => {
    pubsub.publish(`${TOPICS.COMMENT_ADDED}_${comment.videoId}`, {
      commentAdded: comment
    });
  },

  notificationReceived: (userId, notification) => {
    pubsub.publish(`${TOPICS.NOTIFICATION_RECEIVED}_${userId}`, {
      notificationReceived: notification
    });
  },

  userActivity: (userId, activity) => {
    pubsub.publish(`${TOPICS.USER_ACTIVITY}_${userId}`, {
      userActivity: activity
    });
  },

  likeReceived: (userId, like) => {
    pubsub.publish(`${TOPICS.LIKE_RECEIVED}_${userId}`, {
      likeReceived: like
    });
  }
};

export default { Subscription, publish, TOPICS };
