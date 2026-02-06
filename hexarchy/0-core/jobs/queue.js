// Job Queue Manager (Bull/BullMQ with Redis)
import { Queue, Worker } from 'bullmq';
import { redisClient } from '../database/redis/config.js';
import { logger } from '../logging/logger.js';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

// Queue definitions
export const queues = {
  videoProcessing: new Queue('video-processing', { connection }),
  emailNotifications: new Queue('email-notifications', { connection }),
  thumbnailGeneration: new Queue('thumbnail-generation', { connection }),
  analytics: new Queue('analytics', { connection })
};

// Add job to queue
export const addJob = async (queueName, jobName, data, options = {}) => {
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }

  const job = await queue.add(jobName, data, {
    attempts: options.attempts || 3,
    backoff: {
      type: 'exponential',
      delay: options.delay || 1000
    },
    removeOnComplete: options.removeOnComplete || true,
    removeOnFail: options.removeOnFail || false,
    ...options
  });

  logger.info(`Job added: ${queueName}/${jobName}`, { jobId: job.id });
  return job;
};

// Create worker
export const createWorker = (queueName, processor) => {
  const worker = new Worker(queueName, processor, { connection });

  worker.on('completed', (job) => {
    logger.info(`Job completed: ${queueName}/${job.name}`, { jobId: job.id });
  });

  worker.on('failed', (job, error) => {
    logger.error(`Job failed: ${queueName}/${job?.name}`, {
      jobId: job?.id,
      error: error.message
    });
  });

  worker.on('error', (error) => {
    logger.error(`Worker error in ${queueName}:`, error);
  });

  logger.info(`✅ Worker started for queue: ${queueName}`);
  return worker;
};

// Queue management
export const getQueueStats = async (queueName) => {
  const queue = queues[queueName];
  if (!queue) return null;

  return {
    waiting: await queue.getWaitingCount(),
    active: await queue.getActiveCount(),
    completed: await queue.getCompletedCount(),
    failed: await queue.getFailedCount(),
    delayed: await queue.getDelayedCount()
  };
};

export const pauseQueue = async (queueName) => {
  const queue = queues[queueName];
  if (queue) {
    await queue.pause();
    logger.info(`Queue paused: ${queueName}`);
  }
};

export const resumeQueue = async (queueName) => {
  const queue = queues[queueName];
  if (queue) {
    await queue.resume();
    logger.info(`Queue resumed: ${queueName}`);
  }
};

export const clearQueue = async (queueName) => {
  const queue = queues[queueName];
  if (queue) {
    await queue.obliterate({ force: true });
    logger.warn(`Queue cleared: ${queueName}`);
  }
};

export default { queues, addJob, createWorker, getQueueStats, pauseQueue, resumeQueue, clearQueue };
