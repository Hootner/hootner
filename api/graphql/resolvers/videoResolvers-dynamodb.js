/**
 * Video Resolvers - DynamoDB Implementation
 * Complete replacement for MongoDB/Mongoose patterns
 */

const { PubSub } = require('graphql-subscriptions');
const {
  createVideo,
  getVideo,
  getVideosByUser,
  updateVideo,
  deleteVideo,
  incrementViews,
  searchVideos
} = require('./dynamodb-helpers');

const pubsub = new PubSub();

module.exports = {
  // Get all videos (with filtering and pagination)
  videos: async (_, { filter, limit = 20, lastKey }) => {
    try {
      // For now, get by user if userId provided, otherwise return empty
      // In production, implement proper filtering with OpenSearch
      if (filter?.userId) {
        const result = await getVideosByUser(filter.userId, { limit, lastKey });
        
        return {
          edges: result.items.map(v => ({ 
            node: v, 
            cursor: v.id 
          })),
          pageInfo: {
            hasNextPage: result.hasMore,
            hasPreviousPage: !!lastKey,
            endCursor: result.items[result.items.length - 1]?.id,
          },
          totalCount: result.items.length,
        };
      }

      // Search functionality
      if (filter?.search) {
        const result = await searchVideos(filter.search, { limit });
        return {
          edges: result.items.map(v => ({ node: v, cursor: v.id })),
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
          },
          totalCount: result.count,
        };
      }

      // Default: return empty (implement proper query in production)
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
        totalCount: 0,
      };
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  // Get single video
  video: async (_, { id }) => {
    try {
      const video = await getVideo(id);
      if (video) {
        // Increment view count asynchronously
        incrementViews(id).catch(err => 
          console.error('Error incrementing views:', err)
        );
      }
      return video;
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  },

  // Get user's videos
  userVideos: async (_, { userId, limit = 20, lastKey }) => {
    try {
      return await getVideosByUser(userId, { limit, lastKey });
    } catch (error) {
      console.error('Error fetching user videos:', error);
      throw error;
    }
  },

  // Create video
  createVideo: async (_, { input }, context) => {
    try {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const videoData = {
        ...input,
        userId: context.user.id,
        status: 'processing',
      };

      const video = await createVideo(videoData);

      // Publish to subscriptions
      pubsub.publish('VIDEO_CREATED', { videoCreated: video });

      return video;
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  },

  // Update video
  updateVideo: async (_, { id, input }, context) => {
    try {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      // Check ownership
      const existingVideo = await getVideo(id);
      if (!existingVideo) {
        throw new Error('Video not found');
      }

      if (existingVideo.userId !== context.user.id) {
        throw new Error('Not authorized to update this video');
      }

      const updatedVideo = await updateVideo(id, input);

      // Publish to subscriptions
      pubsub.publish('VIDEO_UPDATED', { videoUpdated: updatedVideo });

      return updatedVideo;
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  },

  // Delete video
  deleteVideo: async (_, { id }, context) => {
    try {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      // Check ownership
      const existingVideo = await getVideo(id);
      if (!existingVideo) {
        throw new Error('Video not found');
      }

      if (existingVideo.userId !== context.user.id) {
        throw new Error('Not authorized to delete this video');
      }

      await deleteVideo(id);

      // Publish to subscriptions
      pubsub.publish('VIDEO_DELETED', { videoDeleted: { id } });

      return { success: true, id };
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  },

  // Subscriptions
  Subscription: {
    videoCreated: {
      subscribe: () => pubsub.asyncIterator(['VIDEO_CREATED']),
    },
    videoUpdated: {
      subscribe: () => pubsub.asyncIterator(['VIDEO_UPDATED']),
    },
    videoDeleted: {
      subscribe: () => pubsub.asyncIterator(['VIDEO_DELETED']),
    },
  },
};
