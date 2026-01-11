/**
 * PubSub Utility - Event Publishing and Subscription
 * Handles real-time event distribution for GraphQL subscriptions
 *
 * Author: HOOTNER Code Guardian
 */

const { PubSub } = require('graphql-subscriptions');
const { RedisPubSub } = require('graphql-redis-subscriptions');
const Redis = require('ioredis');

// Event names
const EVENTS = {
    // Video Processing
    VIDEO_PROCESSED: 'VIDEO_PROCESSED',
    VIDEO_PROGRESS: 'VIDEO_PROGRESS',
    VIDEO_UPLOAD_STARTED: 'VIDEO_UPLOAD_STARTED',

    // Video Generation (AI)
    GENERATION_STARTED: 'GENERATION_STARTED',
    GENERATION_PROGRESS: 'GENERATION_PROGRESS',
    GENERATION_COMPLETED: 'GENERATION_COMPLETED',
    GENERATION_FAILED: 'GENERATION_FAILED',
    GENERATION_CANCELLED: 'GENERATION_CANCELLED',

    // Streaming
    STREAM_STARTED: 'STREAM_STARTED',
    STREAM_ENDED: 'STREAM_ENDED',
    STREAM_VIEWERS: 'STREAM_VIEWERS',
    STREAM_QUALITY: 'STREAM_QUALITY',

    // User Activity
    USER_ACTIVITY: 'USER_ACTIVITY',

    // System Events
    SYSTEM_ALERT: 'SYSTEM_ALERT',
};

// Initialize PubSub
let pubsub;

if (process.env.REDIS_URL) {
    // Use Redis for production (multi-server support)
    const redisOptions = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        retryStrategy: (times) => {
            // Reconnect after
            return Math.min(times * 50, 2000);
        },
    };

    pubsub = new RedisPubSub({
        publisher: new Redis(redisOptions),
        subscriber: new Redis(redisOptions),
    });

    console.log('✅ Redis PubSub initialized');
} else {
    // Use in-memory PubSub for development
    pubsub = new PubSub();
    console.log('⚠️  In-memory PubSub initialized (dev mode)');
}

/**
 * Publish an event to subscribers
 * @param {string} eventName - Event name from EVENTS
 * @param {object} payload - Event payload
 */
async function publishEvent(eventName, payload) {
    try {
        const eventPayload = {
            [toCamelCase(eventName)]: {
                ...payload,
                timestamp: payload.timestamp || new Date(),
            },
        };

        await pubsub.publish(eventName, eventPayload);
        console.log(`📡 Published event: ${eventName}`, payload);
    } catch (error) {
        console.error(`Error publishing event ${eventName}:`, error);
        throw error;
    }
}

/**
 * Simulate video generation progress updates
 * @param {string} jobId - Generation job ID
 * @param {number} totalSteps - Total inference steps
 */
async function simulateGenerationProgress(jobId, totalSteps = 50) {
    try {
        for (let i = 1; i <= totalSteps; i++) {
            const progress = Math.round((i / totalSteps) * 100);
            const status = i === totalSteps ? 'COMPLETED' : 'PROCESSING';
            const estimatedTimeRemaining = ((totalSteps - i) * 0.6); // ~0.6s per step

            await publishEvent(EVENTS.GENERATION_PROGRESS, {
                jobId,
                progress,
                status,
                message: `Generating frame ${i}/${totalSteps}`,
                estimatedTimeRemaining: Math.round(estimatedTimeRemaining),
            });

            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 600));
        }

        // Publish completion event
        await publishEvent(EVENTS.GENERATION_COMPLETED, {
            job: {
                id: jobId,
                status: 'COMPLETED',
                progress: 100,
            },
            userId: 'user-id', // TODO: Get from context
        });
    } catch (error) {
        console.error(`Error simulating generation progress for job ${jobId}:`, error);
    }
}

/**
 * Simulate stream viewer updates
 * @param {string} streamId - Stream ID
 * @param {number} duration - Duration in seconds
 */
async function simulateStreamViewers(streamId, duration = 60) {
    try {
        const startViewers = Math.floor(Math.random() * 50) + 10;
        const interval = 5000; // Update every 5 seconds
        const updates = Math.floor((duration * 1000) / interval);

        for (let i = 0; i < updates; i++) {
            const variance = Math.floor(Math.random() * 20) - 10;
            const viewers = Math.max(1, startViewers + variance);

            await publishEvent(EVENTS.STREAM_VIEWERS, {
                streamId,
                viewers,
            });

            await new Promise(resolve => setTimeout(resolve, interval));
        }
    } catch (error) {
        console.error(`Error simulating stream viewers for ${streamId}:`, error);
    }
}

/**
 * Simulate stream quality metrics
 * @param {string} streamId - Stream ID
 * @param {number} duration - Duration in seconds
 */
async function simulateStreamQuality(streamId, duration = 60) {
    try {
        const interval = 10000; // Update every 10 seconds
        const updates = Math.floor((duration * 1000) / interval);

        for (let i = 0; i < updates; i++) {
            const bitrate = 4000 + Math.floor(Math.random() * 2000);
            const fps = 29 + Math.floor(Math.random() * 2);
            const droppedFrames = Math.floor(Math.random() * 5);
            const latency = 200 + Math.floor(Math.random() * 300);

            await publishEvent(EVENTS.STREAM_QUALITY, {
                streamId,
                bitrate,
                fps,
                droppedFrames,
                latency,
            });

            await new Promise(resolve => setTimeout(resolve, interval));
        }
    } catch (error) {
        console.error(`Error simulating stream quality for ${streamId}:`, error);
    }
}

/**
 * Convert event name to camelCase for payload
 * @param {string} eventName - Event name in UPPER_SNAKE_CASE
 * @returns {string} Event name in camelCase
 */
function toCamelCase(eventName) {
    return eventName
        .toLowerCase()
        .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

module.exports = {
    pubsub,
    EVENTS,
    publishEvent,
    simulateGenerationProgress,
    simulateStreamViewers,
    simulateStreamQuality,
};
