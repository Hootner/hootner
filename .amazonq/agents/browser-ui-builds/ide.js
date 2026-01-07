// Minimal IDE
class IDE {
  constructor() {
    this.files = new Map();
    this.currentFile = null;
  }

  open(filename) {
    if (!this.files.has(filename)) {
      this.files.set(filename, '');
    }
    this.currentFile = filename;
    return this.files.get(filename);
  }

  edit(content) {
    if (!this.currentFile) throw new Error('No file open');
    this.files.set(this.currentFile, content);
  }

  save() {
    console.log(`Saved: ${this.currentFile}`);
  }

  run() {
    const code = this.files.get(this.currentFile);
    console.log('Running:', code);
    try {
      eval(code);
    } catch (e) {
      console.error('Error:', e.message);
    }
  }
}

const ide = new IDE();
ide.open('test.js');
ide.edit('console.log("Hello from IDE")');
ide.save();
ide.run();

export default IDE;
