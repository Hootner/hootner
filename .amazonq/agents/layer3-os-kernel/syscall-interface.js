// System Call Interface - Layer 3.9
// Bridge between user space and kernel

class SystemCall {
  constructor(kernel) {
    this.kernel = kernel;
    this.syscalls = this.setupSyscalls();
  }

  setupSyscalls() {
    return {
      // Process management
      0: { name: 'exit', handler: (code) => this.exit(code) },
      1: { name: 'fork', handler: () => this.fork() },
      2: { name: 'exec', handler: (path) => this.exec(path) },
      3: { name: 'wait', handler: (pid) => this.wait(pid) },
      4: { name: 'kill', handler: (pid, sig) => this.kill(pid, sig) },
      
      // File operations
      5: { name: 'open', handler: (path, flags) => this.open(path, flags) },
      6: { name: 'close', handler: (fd) => this.close(fd) },
      7: { name: 'read', handler: (fd, buf, size) => this.read(fd, buf, size) },
      8: { name: 'write', handler: (fd, buf, size) => this.write(fd, buf, size) },
      9: { name: 'lseek', handler: (fd, offset, whence) => this.lseek(fd, offset, whence) },
      
      // Memory management
      10: { name: 'brk', handler: (addr) => this.brk(addr) },
      11: { name: 'mmap', handler: (addr, len, prot) => this.mmap(addr, len, prot) },
      12: { name: 'munmap', handler: (addr, len) => this.munmap(addr, len) },
      
      // IPC
      13: { name: 'pipe', handler: () => this.pipe() },
      14: { name: 'socket', handler: (domain, type) => this.socket(domain, type) },
      15: { name: 'send', handler: (fd, buf, len) => this.send(fd, buf, len) },
      16: { name: 'recv', handler: (fd, buf, len) => this.recv(fd, buf, len) }
    };
  }

  // Invoke system call
  invoke(num, ...args) {
    const syscall = this.syscalls[num];
    
    if (!syscall) {
      console.log(`[SYSCALL] Unknown: ${num}`);
      return -1;
    }
    
    console.log(`[SYSCALL] ${syscall.name}(${args.join(', ')})`);
    
    try {
      return syscall.handler(...args);
    } catch (e) {
      console.log(`[SYSCALL] Error: ${e.message}`);
      return -1;
    }
  }

  // Process management
  exit(code) {
    console.log(`  → Process exiting with code ${code}`);
    return 0;
  }

  fork() {
    console.log('  → Creating child process');
    return 1234; // Child PID
  }

  exec(path) {
    console.log(`  → Executing ${path}`);
    return 0;
  }

  wait(pid) {
    console.log(`  → Waiting for process ${pid}`);
    return 0;
  }

  kill(pid, signal) {
    console.log(`  → Sending signal ${signal} to ${pid}`);
    return 0;
  }

  // File operations
  open(path, flags) {
    console.log(`  → Opening ${path} with flags ${flags}`);
    return 3; // File descriptor
  }

  close(fd) {
    console.log(`  → Closing fd ${fd}`);
    return 0;
  }

  read(fd, buffer, size) {
    console.log(`  → Reading ${size} bytes from fd ${fd}`);
    return size;
  }

  write(fd, buffer, size) {
    console.log(`  → Writing ${size} bytes to fd ${fd}`);
    return size;
  }

  lseek(fd, offset, whence) {
    console.log(`  → Seeking fd ${fd} to offset ${offset}`);
    return offset;
  }

  // Memory management
  brk(addr) {
    console.log(`  → Setting program break to 0x${addr?.toString(16)}`);
    return addr;
  }

  mmap(addr, length, prot) {
    console.log(`  → Mapping ${length} bytes at 0x${addr?.toString(16)}`);
    return addr || 0x1000;
  }

  munmap(addr, length) {
    console.log(`  → Unmapping ${length} bytes at 0x${addr?.toString(16)}`);
    return 0;
  }

  // IPC
  pipe() {
    console.log('  → Creating pipe');
    return [3, 4]; // Read and write FDs
  }

  socket(domain, type) {
    console.log(`  → Creating socket (domain: ${domain}, type: ${type})`);
    return 5; // Socket FD
  }

  send(fd, buffer, length) {
    console.log(`  → Sending ${length} bytes on socket ${fd}`);
    return length;
  }

  recv(fd, buffer, length) {
    console.log(`  → Receiving up to ${length} bytes on socket ${fd}`);
    return 0;
  }
}

// User-space wrapper
class LibC {
  constructor(syscall) {
    this.syscall = syscall;
  }

  // Convenient wrappers
  printf(str) {
    return this.syscall.invoke(8, 1, str, str.length);
  }

  malloc(size) {
    return this.syscall.invoke(11, null, size, 3);
  }

  free(ptr) {
    return this.syscall.invoke(12, ptr, 0);
  }

  fopen(path, mode) {
    const flags = mode === 'r' ? 0 : 1;
    return this.syscall.invoke(5, path, flags);
  }

  fclose(fd) {
    return this.syscall.invoke(6, fd);
  }
}

// Demo
import Kernel from './kernel.js';

const kernel = new Kernel();
const syscall = new SystemCall(kernel);
const libc = new LibC(syscall);

console.log('=== System Call Demo ===\n');

// User program using libc
console.log('User program:');
libc.printf('Hello, World!');
const ptr = libc.malloc(1024);
const fd = libc.fopen('/etc/passwd', 'r');
libc.fclose(fd);
libc.free(ptr);

export { SystemCall, LibC };
