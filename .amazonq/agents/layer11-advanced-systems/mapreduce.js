#!/usr/bin/env node
/**
 * Layer 11: MapReduce - Distributed data processing framework
 * Dependencies: Layer 5 (RPC), Layer 11 (Distributed File System)
 */

class MapReduce {
  constructor() {
    this.workers = [];
    this.jobs = [];
  }

  // Add worker
  addWorker(workerId) {
    this.workers.push({
      id: workerId,
      busy: false,
      tasksCompleted: 0
    });
    console.log(`[WORKER] Added ${workerId}`);
  }

  // Submit job
  submit(input, mapFn, reduceFn) {
    const jobId = this.jobs.length;
    
    const job = {
      id: jobId,
      input,
      mapFn,
      reduceFn,
      status: 'pending',
      mapResults: [],
      reduceResults: [],
      startTime: Date.now()
    };
    
    this.jobs.push(job);
    console.log(`[JOB] Submitted job ${jobId}`);
    
    return this.execute(job);
  }

  // Execute job
  async execute(job) {
    job.status = 'running';
    
    // Map phase
    console.log(`[MAP] Starting map phase`);
    const mapTasks = this.createMapTasks(job.input);
    
    for (const task of mapTasks) {
      const worker = this.getAvailableWorker();
      const result = await this.runMapTask(worker, task, job.mapFn);
      job.mapResults.push(...result);
    }
    
    console.log(`[MAP] Completed (${job.mapResults.length} intermediate pairs)`);
    
    // Shuffle phase
    console.log(`[SHUFFLE] Grouping by key`);
    const grouped = this.shuffle(job.mapResults);
    
    // Reduce phase
    console.log(`[REDUCE] Starting reduce phase`);
    const reduceTasks = Array.from(grouped.entries());
    
    for (const [key, values] of reduceTasks) {
      const worker = this.getAvailableWorker();
      const result = await this.runReduceTask(worker, key, values, job.reduceFn);
      job.reduceResults.push(result);
    }
    
    console.log(`[REDUCE] Completed (${job.reduceResults.length} results)`);
    
    job.status = 'completed';
    job.endTime = Date.now();
    
    return job.reduceResults;
  }

  // Create map tasks
  createMapTasks(input) {
    const chunkSize = Math.ceil(input.length / this.workers.length);
    const tasks = [];
    
    for (let i = 0; i < input.length; i += chunkSize) {
      tasks.push(input.slice(i, i + chunkSize));
    }
    
    return tasks;
  }

  // Run map task
  async runMapTask(worker, data, mapFn) {
    worker.busy = true;
    
    const results = [];
    for (const item of data) {
      const pairs = mapFn(item);
      results.push(...pairs);
    }
    
    worker.busy = false;
    worker.tasksCompleted++;
    
    return results;
  }

  // Shuffle (group by key)
  shuffle(mapResults) {
    const grouped = new Map();
    
    for (const [key, value] of mapResults) {
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(value);
    }
    
    return grouped;
  }

  // Run reduce task
  async runReduceTask(worker, key, values, reduceFn) {
    worker.busy = true;
    
    const result = reduceFn(key, values);
    
    worker.busy = false;
    worker.tasksCompleted++;
    
    return [key, result];
  }

  // Get available worker
  getAvailableWorker() {
    let worker = this.workers.find(w => !w.busy);
    
    if (!worker) {
      // Wait for worker
      worker = this.workers[0];
    }
    
    return worker;
  }

  // Get stats
  stats() {
    return {
      workers: this.workers.length,
      jobs: this.jobs.length,
      completed: this.jobs.filter(j => j.status === 'completed').length,
      workerStats: this.workers.map(w => ({
        id: w.id,
        tasksCompleted: w.tasksCompleted
      }))
    };
  }
}

// Demo
if (require.main === module) {
  const mr = new MapReduce();
  
  console.log('=== MapReduce Demo ===\n');
  
  // Add workers
  mr.addWorker('worker1');
  mr.addWorker('worker2');
  mr.addWorker('worker3');
  
  console.log();
  
  // Word count example
  const documents = [
    'hello world',
    'hello mapreduce',
    'world of mapreduce',
    'hello world of data'
  ];
  
  // Map function: emit (word, 1) for each word
  const mapFn = (doc) => {
    return doc.split(' ').map(word => [word, 1]);
  };
  
  // Reduce function: sum counts for each word
  const reduceFn = (word, counts) => {
    return counts.reduce((sum, count) => sum + count, 0);
  };
  
  (async () => {
    const results = await mr.submit(documents, mapFn, reduceFn);
    
    console.log('\n--- Word Count Results ---');
    results.forEach(([word, count]) => {
      console.log(`  ${word}: ${count}`);
    });
    
    console.log('\nStats:', mr.stats());
  })();
}

module.exports = MapReduce;
