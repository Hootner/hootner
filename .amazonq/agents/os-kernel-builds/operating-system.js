// Minimal Operating System (simulation)
class OperatingSystem {
  constructor() {
    this.processes = [];
    this.memory = new Array(1024).fill(0);
    this.fs = new Map();
  }

  boot() {
    console.log('Booting OS...');
    this.loadKernel();
    this.initFS();
    console.log('OS Ready');
  }

  loadKernel() {
    console.log('Kernel loaded');
  }

  initFS() {
    this.fs.set('/', { type: 'dir', children: [] });
  }

  createProcess(name, fn) {
    const pid = this.processes.length;
    this.processes.push({ pid, name, fn, state: 'ready' });
    return pid;
  }

  schedule() {
    this.processes.forEach(p => {
      if (p.state === 'ready') {
        p.state = 'running';
        p.fn();
        p.state = 'done';
      }
    });
  }

  shutdown() {
    console.log('Shutting down...');
  }
}

const os = new OperatingSystem();
os.boot();
os.createProcess('init', () => console.log('Init process'));
os.schedule();

export default OperatingSystem;
