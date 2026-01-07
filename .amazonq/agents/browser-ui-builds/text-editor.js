// Minimal Text Editor - Basic editing like Vim
class TextEditor {
  constructor() {
    this.buffer = [''];
    this.cursor = { line: 0, col: 0 };
    this.mode = 'normal'; // normal, insert
    this.clipboard = '';
    this.history = [];
    this.historyIndex = -1;
  }

  // Insert mode
  insert(text) {
    if (this.mode !== 'insert') {
      this.mode = 'insert';
      console.log('-- INSERT --');
    }

    const line = this.buffer[this.cursor.line];
    this.buffer[this.cursor.line] = 
      line.slice(0, this.cursor.col) + text + line.slice(this.cursor.col);
    this.cursor.col += text.length;
    
    this.saveHistory();
  }

  // Delete character
  deleteChar() {
    const line = this.buffer[this.cursor.line];
    if (this.cursor.col > 0) {
      this.buffer[this.cursor.line] = 
        line.slice(0, this.cursor.col - 1) + line.slice(this.cursor.col);
      this.cursor.col--;
      this.saveHistory();
    }
  }

  // Delete line
  deleteLine() {
    this.clipboard = this.buffer[this.cursor.line];
    this.buffer.splice(this.cursor.line, 1);
    if (this.buffer.length === 0) this.buffer = [''];
    if (this.cursor.line >= this.buffer.length) {
      this.cursor.line = this.buffer.length - 1;
    }
    this.cursor.col = 0;
    this.saveHistory();
  }

  // New line
  newLine() {
    const line = this.buffer[this.cursor.line];
    const before = line.slice(0, this.cursor.col);
    const after = line.slice(this.cursor.col);
    
    this.buffer[this.cursor.line] = before;
    this.buffer.splice(this.cursor.line + 1, 0, after);
    this.cursor.line++;
    this.cursor.col = 0;
    
    this.saveHistory();
  }

  // Move cursor
  moveCursor(direction) {
    switch (direction) {
      case 'up':
        if (this.cursor.line > 0) this.cursor.line--;
        break;
      case 'down':
        if (this.cursor.line < this.buffer.length - 1) this.cursor.line++;
        break;
      case 'left':
        if (this.cursor.col > 0) this.cursor.col--;
        break;
      case 'right':
        if (this.cursor.col < this.buffer[this.cursor.line].length) {
          this.cursor.col++;
        }
        break;
    }
    
    // Clamp column
    const lineLen = this.buffer[this.cursor.line].length;
    if (this.cursor.col > lineLen) this.cursor.col = lineLen;
  }

  // Copy line
  yank() {
    this.clipboard = this.buffer[this.cursor.line];
    console.log('Yanked line');
  }

  // Paste
  paste() {
    this.buffer.splice(this.cursor.line + 1, 0, this.clipboard);
    this.cursor.line++;
    this.saveHistory();
  }

  // Undo
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.buffer = JSON.parse(this.history[this.historyIndex]);
      console.log('Undo');
    }
  }

  // Redo
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.buffer = JSON.parse(this.history[this.historyIndex]);
      console.log('Redo');
    }
  }

  // Save to history
  saveHistory() {
    const state = JSON.stringify(this.buffer);
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(state);
    this.historyIndex++;
  }

  // Display buffer
  display() {
    console.log('\n--- Buffer ---');
    this.buffer.forEach((line, i) => {
      const marker = i === this.cursor.line ? '>' : ' ';
      console.log(`${marker} ${i + 1}: ${line}`);
    });
    console.log(`Cursor: Line ${this.cursor.line + 1}, Col ${this.cursor.col + 1}`);
    console.log(`Mode: ${this.mode}`);
  }

  // Get content
  getContent() {
    return this.buffer.join('\n');
  }
}

// Demo
console.log('=== Text Editor Demo ===\n');

const editor = new TextEditor();

// Insert text
editor.insert('Hello World');
editor.newLine();
editor.insert('This is a text editor');
editor.newLine();
editor.insert('Like Vim!');

editor.display();

// Edit
console.log('\n--- Editing ---');
editor.moveCursor('up');
editor.moveCursor('up');
editor.insert(' minimal');
editor.display();

// Delete line
console.log('\n--- Delete Line ---');
editor.deleteLine();
editor.display();

// Undo
console.log('\n--- Undo ---');
editor.undo();
editor.display();

// Final content
console.log('\n--- Final Content ---');
console.log(editor.getContent());

export default TextEditor;
