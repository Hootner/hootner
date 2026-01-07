// Shell - Layer 3.6
// Uses: Filesystem (3.5), Kernel (3.2)

class Shell {
  constructor(kernel, fs) {
    this.kernel = kernel;
    this.fs = fs;
    this.env = new Map([
      ['PATH', '/bin:/usr/bin'],
      ['HOME', '/home/user'],
      ['USER', 'root']
    ]);
    this.history = [];
  }

  // Parse command line
  parse(line) {
    const parts = line.trim().split(/\s+/);
    return {
      cmd: parts[0],
      args: parts.slice(1)
    };
  }

  // Execute command
  exec(line) {
    if (!line.trim()) return;
    
    this.history.push(line);
    const { cmd, args } = this.parse(line);
    
    const builtins = {
      'cd': () => this.cd(args[0]),
      'pwd': () => console.log(this.fs.pwd()),
      'ls': () => console.log(this.fs.ls(args[0] || '.')),
      'mkdir': () => this.fs.mkdir(args[0]),
      'touch': () => this.fs.touch(args[0]),
      'rm': () => this.fs.rm(args[0]),
      'cat': () => this.cat(args[0]),
      'echo': () => console.log(args.join(' ')),
      'env': () => this.printEnv(),
      'export': () => this.export(args[0]),
      'history': () => this.printHistory(),
      'clear': () => console.clear(),
      'exit': () => this.exit(),
      'help': () => this.help()
    };
    
    if (builtins[cmd]) {
      builtins[cmd]();
    } else {
      console.log(`${cmd}: command not found`);
    }
  }

  cd(path) {
    if (!path) path = this.env.get('HOME');
    this.fs.cd(path);
  }

  cat(path) {
    const fd = this.fs.open(path, 'r');
    if (fd < 0) return;
    const content = this.fs.read(fd, 1024);
    console.log(content);
    this.fs.close(fd);
  }

  printEnv() {
    this.env.forEach((val, key) => {
      console.log(`${key}=${val}`);
    });
  }

  export(assignment) {
    const [key, val] = assignment.split('=');
    this.env.set(key, val);
  }

  printHistory() {
    this.history.forEach((cmd, i) => {
      console.log(`${i + 1}  ${cmd}`);
    });
  }

  exit() {
    console.log('Goodbye!');
    process.exit(0);
  }

  help() {
    console.log('Available commands:');
    console.log('  cd <dir>      - Change directory');
    console.log('  pwd           - Print working directory');
    console.log('  ls [dir]      - List directory');
    console.log('  mkdir <dir>   - Create directory');
    console.log('  touch <file>  - Create file');
    console.log('  rm <path>     - Remove file/directory');
    console.log('  cat <file>    - Display file contents');
    console.log('  echo <text>   - Print text');
    console.log('  env           - Show environment');
    console.log('  export VAR=val - Set environment variable');
    console.log('  history       - Show command history');
    console.log('  clear         - Clear screen');
    console.log('  exit          - Exit shell');
    console.log('  help          - Show this help');
  }

  // Prompt
  prompt() {
    const user = this.env.get('USER');
    const cwd = this.fs.pwd();
    return `${user}:${cwd}$ `;
  }

  // REPL
  repl() {
    console.log('Simple Shell v1.0');
    console.log('Type "help" for commands\n');
    
    // Simulate interactive mode
    const commands = [
      'pwd',
      'mkdir /test',
      'cd /test',
      'touch file.txt',
      'ls',
      'pwd'
    ];
    
    commands.forEach(cmd => {
      console.log(this.prompt() + cmd);
      this.exec(cmd);
      console.log();
    });
  }
}

// Demo
import Kernel from './kernel.js';
import Filesystem from './filesystem.js';

const kernel = new Kernel();
const fs = new Filesystem();
const shell = new Shell(kernel, fs);

shell.repl();

export default Shell;
