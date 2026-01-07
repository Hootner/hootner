// Complete Operating System - Layer 3.10
// Integrates all Layer 3 components

import Bootloader from './bootloader.js';
import Kernel from './kernel.js';
import Scheduler from './scheduler.js';
import MemoryManager from './memory-manager.js';
import Filesystem from './filesystem.js';
import Shell from './shell.js';
import { DeviceManager, DiskDriver, NetworkDriver, KeyboardDriver } from './device-driver.js';
import { InterruptController } from './interrupt-handler.js';
import { SystemCall } from './syscall-interface.js';

class OperatingSystem {
  constructor() {
    this.bootloader = new Bootloader();
    this.kernel = new Kernel();
    this.scheduler = new Scheduler('round-robin', 10);
    this.memory = new MemoryManager(65536);
    this.fs = new Filesystem();
    this.devices = new DeviceManager();
    this.interrupts = new InterruptController();
    this.syscall = new SystemCall(this.kernel);
    this.shell = null;
    this.running = false;
  }

  // Boot sequence
  boot() {
    console.log('╔════════════════════════════════════╗');
    console.log('║   Simple OS v1.0 - Booting...     ║');
    console.log('╚════════════════════════════════════╝\n');

    // 1. Bootloader
    const disk = Bootloader.createBootDisk();
    if (!this.bootloader.boot(disk)) {
      console.log('Boot failed!');
      return false;
    }

    // 2. Kernel initialization
    console.log();
    this.kernel.start();

    // 3. Initialize subsystems
    console.log('\n[OS] Initializing subsystems...');
    this.initSubsystems();

    // 4. Start shell
    console.log('\n[OS] Starting shell...');
    this.shell = new Shell(this.kernel, this.fs);

    this.running = true;
    console.log('\n[OS] System ready!\n');
    return true;
  }

  initSubsystems() {
    // Memory
    console.log('[OS] Memory: 64KB');
    
    // Devices
    this.devices.register(new DiskDriver());
    this.devices.register(new NetworkDriver());
    this.devices.register(new KeyboardDriver());
    
    // Filesystem
    this.fs.mkdir('/bin');
    this.fs.mkdir('/etc');
    this.fs.mkdir('/home');
    this.fs.mkdir('/tmp');
    console.log('[OS] Filesystem mounted');
    
    // Scheduler
    console.log('[OS] Scheduler ready');
  }

  // Create and run a process
  createProcess(name, code) {
    const pid = this.kernel.createProcess(name, code);
    const process = this.kernel.processes.find(p => p.pid === pid);
    
    if (process) {
      this.scheduler.addProcess(process);
      return pid;
    }
    
    return -1;
  }

  // System statistics
  stats() {
    return {
      uptime: Date.now(),
      processes: this.kernel.processes.length,
      memory: this.memory.stats(),
      devices: this.devices.list().length,
      scheduler: this.scheduler.stats()
    };
  }

  // Shutdown
  shutdown() {
    console.log('\n[OS] Shutting down...');
    
    // Stop scheduler
    this.scheduler.readyQueue = [];
    
    // Kill processes
    this.kernel.shutdown();
    
    // Unmount filesystem
    console.log('[OS] Unmounting filesystem...');
    
    // Stop devices
    console.log('[OS] Stopping devices...');
    
    this.running = false;
    console.log('[OS] System halted.');
  }

  // Run demo
  demo() {
    if (!this.boot()) return;

    console.log('═══════════════════════════════════════\n');
    console.log('Running demo programs...\n');

    // Create some processes
    const p1 = this.createProcess('init', []);
    const p2 = this.createProcess('daemon', []);
    
    // Simulate some operations
    console.log('\n--- File Operations ---');
    this.fs.touch('/tmp/test.txt');
    const fd = this.fs.open('/tmp/test.txt', 'w');
    this.fs.write(fd, 'Hello from OS!');
    this.fs.close(fd);
    
    console.log('\n--- Memory Operations ---');
    const ptr1 = this.memory.malloc(256);
    const ptr2 = this.memory.malloc(512);
    console.log('Memory stats:', this.memory.stats());
    
    console.log('\n--- System Calls ---');
    this.syscall.invoke(8, 1, 'Hello via syscall!', 18);
    
    console.log('\n--- Scheduling ---');
    for (let i = 0; i < 3; i++) {
      this.scheduler.tick();
    }
    
    console.log('\n--- System Stats ---');
    console.log(this.stats());
    
    console.log('\n--- Shell Demo ---');
    this.shell.exec('pwd');
    this.shell.exec('ls /');
    this.shell.exec('cat /tmp/test.txt');
    
    console.log('\n═══════════════════════════════════════');
    this.shutdown();
  }
}

// Run demo
const os = new OperatingSystem();
os.demo();

export default OperatingSystem;
