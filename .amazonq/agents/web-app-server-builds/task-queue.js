// Minimal Task Queue
class TaskQueue {
  constructor(workers = 2) {
    this.queue = [];
    this.workers = workers;
    this.active = 0;
  }

  enqueue(task) {
    this.queue.push(task);
    this.process();
  }

  async process() {
    if (this.active >= this.workers || this.queue.length === 0) return;
    
    this.active++;
    const task = this.queue.shift();
    
    try {
      await task();
    } catch (e) {
      console.error('Task failed:', e);
    }
    
    this.active--;
    this.process();
  }
}

const queue = new TaskQueue(2);
queue.enqueue(async () => console.log('Task 1'));
queue.enqueue(async () => console.log('Task 2'));

export default TaskQueue;
