#!/usr/bin/env node
/**
 * Layer 7: Task Queue - Background job processing
 * Dependencies: Layer 4 (Runtime), Layer 5 (Message Broker), Layer 6 (Database)
 */

class TaskQueue {
  constructor() {
    this.queues = new Map();
    this.workers = new Map();
    this.jobs = new Map();
    this.nextJobId = 1;
  }

  // Create queue
  createQueue(name, options = {}) {
    this.queues.set(name, {
      name,
      jobs: [],
      concurrency: options.concurrency || 1,
      priority: options.priority || false
    });
    console.log(`[QUEUE] Created ${name}`);
  }

  // Add job
  async add(queueName, data, options = {}) {
    const queue = this.queues.get(queueName);
    if (!queue) throw new Error(`Queue ${queueName} not found`);
    
    const job = {
      id: this.nextJobId++,
      queue: queueName,
      data,
      priority: options.priority || 0,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      delay: options.delay || 0,
      status: 'pending',
      createdAt: Date.now(),
      scheduledFor: Date.now() + (options.delay || 0)
    };
    
    this.jobs.set(job.id, job);
    queue.jobs.push(job);
    
    // Sort by priority if enabled
    if (queue.priority) {
      queue.jobs.sort((a, b) => b.priority - a.priority);
    }
    
    console.log(`[JOB] Added ${job.id} to ${queueName}`);
    return job.id;
  }

  // Process queue
  process(queueName, handler) {
    const queue = this.queues.get(queueName);
    if (!queue) throw new Error(`Queue ${queueName} not found`);
    
    const worker = {
      queue: queueName,
      handler,
      active: 0,
      processed: 0,
      failed: 0
    };
    
    this.workers.set(queueName, worker);
    console.log(`[WORKER] Started for ${queueName}`);
    
    // Start processing
    this.processJobs(queueName);
  }

  // Process jobs
  async processJobs(queueName) {
    const queue = this.queues.get(queueName);
    const worker = this.workers.get(queueName);
    
    while (queue.jobs.length > 0 && worker.active < queue.concurrency) {
      const job = queue.jobs.shift();
      
      // Check if scheduled
      if (Date.now() < job.scheduledFor) {
        queue.jobs.push(job);
        continue;
      }
      
      worker.active++;
      job.status = 'active';
      job.startedAt = Date.now();
      
      console.log(`[PROCESS] Job ${job.id}`);
      
      try {
        await worker.handler(job);
        
        job.status = 'completed';
        job.completedAt = Date.now();
        worker.processed++;
        
        console.log(`[COMPLETE] Job ${job.id}`);
      } catch (error) {
        job.attempts++;
        job.error = error.message;
        
        if (job.attempts < job.maxAttempts) {
          // Retry with exponential backoff
          job.status = 'pending';
          job.scheduledFor = Date.now() + Math.pow(2, job.attempts) * 1000;
          queue.jobs.push(job);
          
          console.log(`[RETRY] Job ${job.id} (attempt ${job.attempts})`);
        } else {
          job.status = 'failed';
          job.failedAt = Date.now();
          worker.failed++;
          
          console.log(`[FAILED] Job ${job.id}`);
        }
      } finally {
        worker.active--;
      }
    }
  }

  // Schedule recurring job
  schedule(queueName, cron, data) {
    console.log(`[SCHEDULE] ${queueName} with cron ${cron}`);
    
    // Simplified cron parsing
    const interval = this.parseCron(cron);
    
    setInterval(() => {
      this.add(queueName, data);
    }, interval);
  }

  // Parse cron (simplified)
  parseCron(cron) {
    // Support simple patterns like "*/5 * * * *" (every 5 minutes)
    const parts = cron.split(' ');
    const minutes = parts[0];
    
    if (minutes.startsWith('*/')) {
      return parseInt(minutes.slice(2)) * 60 * 1000;
    }
    
    return 60000; // Default 1 minute
  }

  // Get job status
  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  // Get queue stats
  stats(queueName) {
    const queue = this.queues.get(queueName);
    const worker = this.workers.get(queueName);
    
    const jobs = Array.from(this.jobs.values()).filter(j => j.queue === queueName);
    const byStatus = {};
    
    for (const job of jobs) {
      byStatus[job.status] = (byStatus[job.status] || 0) + 1;
    }
    
    return {
      queue: queueName,
      pending: queue.jobs.length,
      active: worker?.active || 0,
      processed: worker?.processed || 0,
      failed: worker?.failed || 0,
      byStatus
    };
  }

  // Clear queue
  clear(queueName) {
    const queue = this.queues.get(queueName);
    queue.jobs = [];
    console.log(`[CLEAR] Queue ${queueName}`);
  }
}

// Demo
if (require.main === module) {
  const queue = new TaskQueue();
  
  console.log('=== Task Queue Demo ===\n');
  
  // Create queues
  queue.createQueue('emails', { concurrency: 2 });
  queue.createQueue('reports', { priority: true });
  
  console.log();
  
  // Process queue
  queue.process('emails', async (job) => {
    console.log(`  Sending email to ${job.data.to}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  });
  
  console.log();
  
  (async () => {
    // Add jobs
    await queue.add('emails', { to: 'alice@example.com', subject: 'Hello' });
    await queue.add('emails', { to: 'bob@example.com', subject: 'Welcome' });
    await queue.add('emails', { to: 'charlie@example.com', subject: 'Update' }, { delay: 1000 });
    
    // Priority job
    await queue.add('reports', { type: 'monthly' }, { priority: 10 });
    await queue.add('reports', { type: 'weekly' }, { priority: 5 });
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('\nStats:', queue.stats('emails'));
  })();
}

module.exports = TaskQueue;
