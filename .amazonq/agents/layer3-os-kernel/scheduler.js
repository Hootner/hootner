// Process Scheduler - Layer 3.3
// Uses: FSM (0.4), Queue data structure

class Scheduler {
  constructor(algorithm = 'round-robin', quantum = 10) {
    this.algorithm = algorithm;
    this.quantum = quantum;
    this.readyQueue = [];
    this.currentProcess = null;
    this.time = 0;
  }

  // Add process to ready queue
  addProcess(process) {
    process.state = 'ready';
    this.readyQueue.push(process);
    console.log(`[SCHED] Process ${process.pid} added to queue`);
  }

  // Remove process
  removeProcess(pid) {
    this.readyQueue = this.readyQueue.filter(p => p.pid !== pid);
  }

  // Schedule next process
  schedule() {
    if (this.algorithm === 'round-robin') {
      return this.roundRobin();
    } else if (this.algorithm === 'priority') {
      return this.priority();
    } else if (this.algorithm === 'fcfs') {
      return this.fcfs();
    }
  }

  // Round-robin scheduling
  roundRobin() {
    if (this.currentProcess) {
      this.currentProcess.state = 'ready';
      this.readyQueue.push(this.currentProcess);
    }

    if (this.readyQueue.length === 0) {
      this.currentProcess = null;
      return null;
    }

    this.currentProcess = this.readyQueue.shift();
    this.currentProcess.state = 'running';
    this.currentProcess.timeSlice = this.quantum;
    
    console.log(`[SCHED] Running process ${this.currentProcess.pid} (quantum: ${this.quantum})`);
    return this.currentProcess;
  }

  // Priority scheduling
  priority() {
    if (this.readyQueue.length === 0) return null;

    // Sort by priority (higher = more important)
    this.readyQueue.sort((a, b) => b.priority - a.priority);
    
    this.currentProcess = this.readyQueue.shift();
    this.currentProcess.state = 'running';
    
    console.log(`[SCHED] Running process ${this.currentProcess.pid} (priority: ${this.currentProcess.priority})`);
    return this.currentProcess;
  }

  // First-Come-First-Served
  fcfs() {
    if (this.readyQueue.length === 0) return null;

    this.currentProcess = this.readyQueue.shift();
    this.currentProcess.state = 'running';
    
    console.log(`[SCHED] Running process ${this.currentProcess.pid}`);
    return this.currentProcess;
  }

  // Tick (time slice)
  tick() {
    this.time++;
    
    if (this.currentProcess) {
      this.currentProcess.timeSlice--;
      
      if (this.currentProcess.timeSlice <= 0) {
        console.log(`[SCHED] Time slice expired for process ${this.currentProcess.pid}`);
        this.schedule();
      }
    } else {
      this.schedule();
    }
  }

  // Block process (I/O wait)
  block(pid) {
    if (this.currentProcess && this.currentProcess.pid === pid) {
      this.currentProcess.state = 'blocked';
      console.log(`[SCHED] Process ${pid} blocked`);
      this.currentProcess = null;
      this.schedule();
    }
  }

  // Unblock process
  unblock(pid) {
    const process = this.readyQueue.find(p => p.pid === pid);
    if (process) {
      process.state = 'ready';
      console.log(`[SCHED] Process ${pid} unblocked`);
    }
  }

  // Statistics
  stats() {
    return {
      time: this.time,
      queueLength: this.readyQueue.length,
      current: this.currentProcess?.pid || null
    };
  }
}

// Demo
const scheduler = new Scheduler('round-robin', 5);

// Create processes
const p1 = { pid: 1, name: 'proc1', state: 'new', priority: 5 };
const p2 = { pid: 2, name: 'proc2', state: 'new', priority: 3 };
const p3 = { pid: 3, name: 'proc3', state: 'new', priority: 7 };

scheduler.addProcess(p1);
scheduler.addProcess(p2);
scheduler.addProcess(p3);

// Simulate scheduling
console.log('\n--- Scheduling Simulation ---');
for (let i = 0; i < 15; i++) {
  console.log(`\nTime: ${i}`);
  scheduler.tick();
  console.log('Stats:', scheduler.stats());
}

export default Scheduler;
