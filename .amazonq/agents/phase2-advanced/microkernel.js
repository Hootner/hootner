// Minimal Microkernel - IPC, Process Management, Minimal Kernel Services
class Process {
  constructor(pid, name, code) {
    this.pid = pid;
    this.name = name;
    this.code = code;
    this.state = 'ready'; // ready, running, blocked, terminated
    this.messages = [];
  }

  run(kernel) {
    this.state = 'running';
    try {
      this.code(kernel, this);
      if (this.state === 'running') this.state = 'ready';
    } catch (error) {
      console.error(`Process ${this.pid} error:`, error.message);
      this.state = 'terminated';
    }
  }
}

class Microkernel {
  constructor() {
    this.processes = new Map();
    this.nextPid = 1;
    this.scheduler = [];
  }

  // Create process
  createProcess(name, code) {
    const pid = this.nextPid++;
    const process = new Process(pid, name, code);
    this.processes.set(pid, process);
    this.scheduler.push(pid);
    return pid;
  }

  // IPC: Send message
  send(fromPid, toPid, message) {
    const toProcess = this.processes.get(toPid);
    if (!toProcess) throw new Error(`Process ${toPid} not found`);
    toProcess.messages.push({ from: fromPid, data: message });
    if (toProcess.state === 'blocked') toProcess.state = 'ready';
  }

  // IPC: Receive message (blocking)
  receive(pid) {
    const process = this.processes.get(pid);
    if (!process) throw new Error(`Process ${pid} not found`);
    
    if (process.messages.length > 0) {
      return process.messages.shift();
    }
    process.state = 'blocked';
    return null;
  }

  // Kill process
  kill(pid) {
    const process = this.processes.get(pid);
    if (process) {
      process.state = 'terminated';
      this.scheduler = this.scheduler.filter(p => p !== pid);
    }
  }

  // Round-robin scheduler
  schedule() {
    while (this.scheduler.length > 0) {
      const pid = this.scheduler.shift();
      const process = this.processes.get(pid);
      
      if (!process || process.state === 'terminated') continue;
      if (process.state === 'blocked') {
        this.scheduler.push(pid);
        continue;
      }

      process.run(this);
      if (process.state !== 'terminated') {
        this.scheduler.push(pid);
      }
      break; // Time slice
    }
  }

  run() {
    while (this.scheduler.length > 0) {
      this.schedule();
    }
  }
}

// Demo: Client-Server with IPC
const kernel = new Microkernel();

// Server process
const serverPid = kernel.createProcess('server', (k, proc) => {
  const msg = k.receive(proc.pid);
  if (msg) {
    console.log(`Server received: ${msg.data}`);
    k.send(proc.pid, msg.from, `Echo: ${msg.data}`);
  }
});

// Client process
const clientPid = kernel.createProcess('client', (k, proc) => {
  k.send(proc.pid, serverPid, 'Hello Server');
  const reply = k.receive(proc.pid);
  if (reply) {
    console.log(`Client received: ${reply.data}`);
    k.kill(proc.pid);
    k.kill(serverPid);
  }
});

kernel.run();

export default Microkernel;
