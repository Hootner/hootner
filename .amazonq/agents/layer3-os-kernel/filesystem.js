// Filesystem - Layer 3.5
// Uses: B-Tree (0.3 concepts), Memory Manager

class Filesystem {
  constructor() {
    this.root = { type: 'dir', name: '/', children: new Map() };
    this.cwd = this.root;
    this.openFiles = new Map();
    this.nextFD = 3; // 0,1,2 reserved for stdin/stdout/stderr
  }

  // Parse path
  parsePath(path) {
    if (path === '/') return [];
    return path.split('/').filter(p => p.length > 0);
  }

  // Navigate to path
  navigate(path) {
    const parts = this.parsePath(path);
    let node = path.startsWith('/') ? this.root : this.cwd;
    
    for (const part of parts) {
      if (part === '..') {
        node = node.parent || node;
      } else if (part !== '.') {
        if (node.type !== 'dir') return null;
        node = node.children.get(part);
        if (!node) return null;
      }
    }
    
    return node;
  }

  // Create file
  touch(path) {
    const parts = this.parsePath(path);
    const name = parts.pop();
    const parent = this.navigate(parts.join('/') || '/');
    
    if (!parent || parent.type !== 'dir') {
      console.log(`[FS] Cannot create file: ${path}`);
      return false;
    }
    
    if (parent.children.has(name)) {
      console.log(`[FS] File exists: ${path}`);
      return false;
    }
    
    parent.children.set(name, {
      type: 'file',
      name,
      parent,
      data: '',
      size: 0,
      created: Date.now()
    });
    
    console.log(`[FS] Created: ${path}`);
    return true;
  }

  // Create directory
  mkdir(path) {
    const parts = this.parsePath(path);
    const name = parts.pop();
    const parent = this.navigate(parts.join('/') || '/');
    
    if (!parent || parent.type !== 'dir') {
      console.log(`[FS] Cannot create directory: ${path}`);
      return false;
    }
    
    parent.children.set(name, {
      type: 'dir',
      name,
      parent,
      children: new Map(),
      created: Date.now()
    });
    
    console.log(`[FS] Created directory: ${path}`);
    return true;
  }

  // Remove file/directory
  rm(path) {
    const parts = this.parsePath(path);
    const name = parts.pop();
    const parent = this.navigate(parts.join('/') || '/');
    
    if (!parent || !parent.children.has(name)) {
      console.log(`[FS] Not found: ${path}`);
      return false;
    }
    
    parent.children.delete(name);
    console.log(`[FS] Removed: ${path}`);
    return true;
  }

  // Open file
  open(path, mode = 'r') {
    const node = this.navigate(path);
    
    if (!node || node.type !== 'file') {
      console.log(`[FS] Cannot open: ${path}`);
      return -1;
    }
    
    const fd = this.nextFD++;
    this.openFiles.set(fd, { node, mode, pos: 0 });
    console.log(`[FS] Opened: ${path} (fd: ${fd})`);
    return fd;
  }

  // Close file
  close(fd) {
    if (!this.openFiles.has(fd)) return false;
    this.openFiles.delete(fd);
    console.log(`[FS] Closed fd: ${fd}`);
    return true;
  }

  // Read file
  read(fd, size) {
    const file = this.openFiles.get(fd);
    if (!file) return null;
    
    const data = file.node.data.slice(file.pos, file.pos + size);
    file.pos += data.length;
    return data;
  }

  // Write file
  write(fd, data) {
    const file = this.openFiles.get(fd);
    if (!file || file.mode === 'r') return -1;
    
    file.node.data += data;
    file.node.size = file.node.data.length;
    return data.length;
  }

  // List directory
  ls(path = '.') {
    const node = this.navigate(path);
    if (!node || node.type !== 'dir') return [];
    
    return Array.from(node.children.values()).map(n => ({
      name: n.name,
      type: n.type,
      size: n.size || 0
    }));
  }

  // Change directory
  cd(path) {
    const node = this.navigate(path);
    if (!node || node.type !== 'dir') {
      console.log(`[FS] Not a directory: ${path}`);
      return false;
    }
    this.cwd = node;
    return true;
  }

  // Get current path
  pwd() {
    const parts = [];
    let node = this.cwd;
    while (node.parent) {
      parts.unshift(node.name);
      node = node.parent;
    }
    return '/' + parts.join('/');
  }
}

// Demo
const fs = new Filesystem();

console.log('Current dir:', fs.pwd());

fs.mkdir('/home');
fs.mkdir('/home/user');
fs.touch('/home/user/test.txt');

console.log('\nListing /home/user:');
console.log(fs.ls('/home/user'));

const fd = fs.open('/home/user/test.txt', 'w');
fs.write(fd, 'Hello, filesystem!');
fs.close(fd);

const fd2 = fs.open('/home/user/test.txt', 'r');
console.log('\nFile contents:', fs.read(fd2, 100));
fs.close(fd2);

export default Filesystem;
