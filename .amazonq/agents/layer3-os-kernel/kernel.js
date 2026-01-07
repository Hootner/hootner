// Kernel - Layer 3.2
// Uses: Memory Manager, Scheduler, Filesystem

class Kernel {
  constructor() {
    this.processes = [];
    this.memory = new Uint8Array(65536); // 64KB
    this.running = false;
    this.currentPID = 0;
  }

  // Initialize kernel
  init() {
    console.log('[KERNEL] Initializing...');
    this.initMemory();
    this.initScheduler();
    this.initFilesystem();
    this.initDevices();
    console.log('[KERNEL] Ready');
  }

  initMemory() {
    console.log('[KERNEL] Memory: 64KB');
  }

  initScheduler() {
    console.log('[KERNEL] Scheduler: Round-robin');
  }

  initFilesystem() {
    console.log('[KERNEL] Filesystem: Ready');
  }

  initDevices() {
    console.log('[KERNEL] Devices: Initialized');
  }

  // System calls
  syscall(num, ...args) {
    const calls = {
      0: () => this.exit(args[0]),
      1: () => this.write(args[0], args[1]),
      2: () => this.read(args[0]),
      3: () => this.open(args[0]),
      4: () => this.close(args[0]),
      5: () => this.fork(),
      6: () => this.exec(args[0])
    };
    
    return calls[num]?.() || -1;
  }

  // Process management
  createProcess(name, code) {
    const pid = this.currentPID++;
    const process = {
      pid,
      name,
      code,
      state: 'ready',
      pc: 0,
      registers: new Array(16).fill(0),
      memory: new Uint8Array(4096)
    };
    
    this.processes.push(process);
    console.log(`[KERNEL] Process ${pid} (${name}) created`);
    return pid;
  }

  killProcess(pid) {
    const idx = this.processes.findIndex(p => p.pid === pid);
    if (idx !== -1) {
      this.processes.splice(idx, 1);
      console.log(`[KERNEL] Process ${pid} killed`);
    }
  }

  // System call implementations
  exit(code) {
    console.log(`[SYSCALL] exit(${code})`);
    return 0;
  }

  write(fd, data) {
    console.log(`[SYSCALL] write(${fd}, "${data}")`);
    return data.length;
  }

  read(fd) {
    console.log(`[SYSCALL] read(${fd})`);
    return '';
  }

  open(path) {
    console.log(`[SYSCALL] open("${path}")`);
    return 3; // File descriptor
  }

  close(fd) {
    console.log(`[SYSCALL] close(${fd})`);
    return 0;
  }

  fork() {
    console.log('[SYSCALL] fork()');
    return this.currentPID;
  }

  exec(path) {
    console.log(`[SYSCALL] exec("${path}")`);
    return 0;
  }

  // Kernel panic
  panic(message) {
    console.error(`\n*** KERNEL PANIC ***`);
    console.error(`${message}`);
    console.error('System halted.');
    this.running = false;
  }

  // Start kernel
  start() {
    this.init();
    this.running = true;
    console.log('[KERNEL] System running');
  }

  // Shutdown
  shutdown() {
    console.log('[KERNEL] Shutting down...');
    this.processes.forEach(p => this.killProcess(p.pid));
    this.running = false;
    console.log('[KERNEL] Shutdown complete');
  }
}

// Demo
const kernel = new Kernel();
kernel.start();

// Create some processes
kernel.createProcess('init', []);
kernel.createProcess('shell', []);

// Make system calls
kernel.syscall(1, 1, 'Hello from kernel!');
kernel.syscall(3, '/etc/passwd');

kernel.shutdown();

export default Kernel;
