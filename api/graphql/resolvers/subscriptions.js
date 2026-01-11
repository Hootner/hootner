/**
 * Subscription Resolvers - Real-time Event Streaming
 * Handles WebSocket-based subscriptions for real-time updates
 *
 * Author: HOOTNER Code Guardian
 */

const { withFilter } = require('graphql-subscriptions');
const { pubsub, EVENTS } = require('../utils/pubsub');
const { validateAuth } = require('../utils/auth');

const subscriptionResolvers = {
    // ==================== VIDEO PROCESSING ====================

    videoProcessed: {
        subscribe: withFilter(
            () => pubsub.asyncIterator([EVENTS.VIDEO_PROCESSED]),
            (payload, variables, context) => {
                // Filter by userId if specified
                if (variables.userId) {
                    return payload.videoProcessed.userId === variables.userId;
                }
                return true;
            }
        ),
        resolve: (payload) => payload.videoProcessed,
    },

    videoProgress: {
        subscribe: withFilter(
            () => pubsub.asyncIterator([EVENTS.VIDEO_PROGRESS]),
            (payload, variables) => {
                // Only send updates for the specific video
                return payload.videoProgress.videoId === variables.videoId;
            }
        ),
        resolve: (payload) => payload.videoProgress,
    },

    // ==================== VIDEO GENERATION (AI) ====================

    generationProgress: {
        subscribe: withFilter(
            () => pubsub.asyncIterator([EVENTS.GENERATION_PROGRESS]),
            (payload, variables, context) => {
                // Validate authentication
                try {
                    validateAuth(context);
                } catch (error) {
                    return false;
                }

                // Only send updates for the specific job
                return payload.generationProgress.jobId === variables.jobId;
            }
        ),
        resolve: (payload) => {
            return {
                jobId: payload.generationProgress.jobId,
                progress: payload.generationProgress.progress,
                status: payload.generationProgress.status,
                message: payload.generationProgress.message,
                estimatedTimeRemaining: payload.generationProgress.estimatedTimeRemaining,
                timestamp: new Date(),
            };
        },
    },

    generationCompleted: {
        subscribe: withFilter(
            () => pubsub.asyncIterator([EVENTS.GENERATION_COMPLETED]),
            (payload, variables, context) => {
                // Validate authentication
                try {
                    validateAuth(context);
                } catch (error) {
                    return false;
                }

                // Filter by userId if specified
                if (variables.userId) {
                    return payload.generationCompleted.userId === variables.userId;
                }

                // Otherwise, only send to the owner
                return payload.generationCompleted.userId === context.user.id;
            }
        ),
        resolve: (payload) => payload.generationCompleted,
    },

    // ==================== REAL-TIME STREAMING ====================

    streamStarted: {
        subscribe: withFilter(
            () => pubsub.asyncIterator([EVENTS.STREAM_STARTED]),
            (payload, variables, context) => {
                // Filter by userId if specified
                if (variables.userId) {
                    return payload.streamStarted.userId === variables.userId;
                }
                return true;
            }
        ),
        resolve: (payload) => payload.streamStarted,
    },

    streamEnded: {
        subscribe: withFilter(
            () => pubsub.asyncIterator([EVENTS.STREAM_ENDED]),
            (payload, variables) => {
                // Only send updates for the specific stream
                return payload.streamEnded.streamId === variables.streamId;
            }
        ),
        resolve: (payload) => payload.streamEnded,
    },

    streamViewers: {
        subscribe: withFilter(
            () => pubsub.asyncIterator([EVENTS.STREAM_VIEWERS]),
            (payload, variables) => {
                // Only send updates for the specific stream
                return payload.streamViewers.streamId === variables.streamId;
            }
        ),
        resolve: (payload) => payload.streamViewers,
    },

    streamQuality: {
        subscribe: withFilter(
            () => pubsub.asyncIterator([EVENTS.STREAM_QUALITY]),
            (payload, variables) => {
                // Only send updates for the specific stream
                return payload.streamQuality.streamId === variables.streamId;
            }
        ),
        resolve: (payload) => payload.streamQuality,
    },

    // ==================== USER ACTIVITY ====================

    userActivity: {
        subscribe: withFilter(
            () => pubsub.asyncIterator([EVENTS.USER_ACTIVITY]),
            (payload, variables, context) => {
                // Validate authentication
                try {
                    validateAuth(context);
                } catch (error) {
                    return false;
                }

                // Only send updates for the specific user
                return payload.userActivity.userId === variables.userId;
            }
        ),
        resolve: (payload) => payload.userActivity,
    },

    // ==================== SYSTEM EVENTS ====================

    systemAlert: {
        subscribe: withFilter(
            () => pubsub.asyncIterator([EVENTS.SYSTEM_ALERT]),
            (payload, variables, context) => {
                // Only admins can subscribe to system alerts
                try {
                    validateAuth(context);
                    return context.user.role === 'ADMIN';
                } catch (error) {
                    return false;
                }
            }
        ),
        resolve: (payload) => payload.systemAlert,
    },
};

module.exports = subscriptionResolvers;
