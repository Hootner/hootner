#!/usr/bin/env node
/**
 * Layer 8: Text Editor - Code editor with buffer and operations
 * Dependencies: Layer 3 (Filesystem), Layer 6 (Search)
 */

class TextEditor {
  constructor() {
    this.buffer = [''];
    this.cursor = { line: 0, col: 0 };
    this.selection = null;
    this.history = [];
    this.historyIndex = -1;
    this.clipboard = '';
  }

  // Insert text at cursor
  insert(text) {
    const line = this.buffer[this.cursor.line];
    const before = line.slice(0, this.cursor.col);
    const after = line.slice(this.cursor.col);
    
    if (text === '\n') {
      this.buffer[this.cursor.line] = before;
      this.buffer.splice(this.cursor.line + 1, 0, after);
      this.cursor.line++;
      this.cursor.col = 0;
    } else {
      this.buffer[this.cursor.line] = before + text + after;
      this.cursor.col += text.length;
    }
    
    this.saveHistory('insert', { text, pos: { ...this.cursor } });
    console.log(`[INSERT] "${text}" at ${this.cursor.line}:${this.cursor.col}`);
  }

  // Delete character
  delete(direction = 'forward') {
    if (direction === 'backward' && this.cursor.col > 0) {
      const line = this.buffer[this.cursor.line];
      const deleted = line[this.cursor.col - 1];
      this.buffer[this.cursor.line] = line.slice(0, this.cursor.col - 1) + line.slice(this.cursor.col);
      this.cursor.col--;
      this.saveHistory('delete', { char: deleted, pos: { ...this.cursor } });
    } else if (direction === 'forward') {
      const line = this.buffer[this.cursor.line];
      if (this.cursor.col < line.length) {
        const deleted = line[this.cursor.col];
        this.buffer[this.cursor.line] = line.slice(0, this.cursor.col) + line.slice(this.cursor.col + 1);
        this.saveHistory('delete', { char: deleted, pos: { ...this.cursor } });
      }
    }
    
    console.log(`[DELETE] ${direction}`);
  }

  // Move cursor
  moveCursor(direction) {
    switch (direction) {
      case 'left':
        if (this.cursor.col > 0) this.cursor.col--;
        break;
      case 'right':
        if (this.cursor.col < this.buffer[this.cursor.line].length) this.cursor.col++;
        break;
      case 'up':
        if (this.cursor.line > 0) {
          this.cursor.line--;
          this.cursor.col = Math.min(this.cursor.col, this.buffer[this.cursor.line].length);
        }
        break;
      case 'down':
        if (this.cursor.line < this.buffer.length - 1) {
          this.cursor.line++;
          this.cursor.col = Math.min(this.cursor.col, this.buffer[this.cursor.line].length);
        }
        break;
    }
  }

  // Set selection
  select(start, end) {
    this.selection = { start, end };
    console.log(`[SELECT] ${start.line}:${start.col} to ${end.line}:${end.col}`);
  }

  // Get selected text
  getSelection() {
    if (!this.selection) return '';
    
    const { start, end } = this.selection;
    
    if (start.line === end.line) {
      return this.buffer[start.line].slice(start.col, end.col);
    }
    
    let text = this.buffer[start.line].slice(start.col) + '\n';
    for (let i = start.line + 1; i < end.line; i++) {
      text += this.buffer[i] + '\n';
    }
    text += this.buffer[end.line].slice(0, end.col);
    
    return text;
  }

  // Copy
  copy() {
    this.clipboard = this.getSelection();
    console.log(`[COPY] ${this.clipboard.length} chars`);
  }

  // Cut
  cut() {
    this.copy();
    // Delete selection
    if (this.selection) {
      this.deleteSelection();
    }
  }

  // Paste
  paste() {
    this.insert(this.clipboard);
    console.log(`[PASTE] ${this.clipboard.length} chars`);
  }

  // Delete selection
  deleteSelection() {
    if (!this.selection) return;
    
    const { start, end } = this.selection;
    const startLine = this.buffer[start.line];
    const endLine = this.buffer[end.line];
    
    this.buffer[start.line] = startLine.slice(0, start.col) + endLine.slice(end.col);
    this.buffer.splice(start.line + 1, end.line - start.line);
    
    this.cursor = { ...start };
    this.selection = null;
  }

  // Undo
  undo() {
    if (this.historyIndex >= 0) {
      const action = this.history[this.historyIndex];
      this.historyIndex--;
      
      // Reverse action
      if (action.type === 'insert') {
        this.cursor = action.data.pos;
        this.delete('backward');
      }
      
      console.log(`[UNDO] ${action.type}`);
    }
  }

  // Redo
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const action = this.history[this.historyIndex];
      
      // Reapply action
      if (action.type === 'insert') {
        this.cursor = action.data.pos;
        this.insert(action.data.text);
      }
      
      console.log(`[REDO] ${action.type}`);
    }
  }

  // Save to history
  saveHistory(type, data) {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push({ type, data });
    this.historyIndex++;
  }

  // Find text
  find(query) {
    const results = [];
    
    for (let i = 0; i < this.buffer.length; i++) {
      let col = 0;
      while ((col = this.buffer[i].indexOf(query, col)) !== -1) {
        results.push({ line: i, col });
        col += query.length;
      }
    }
    
    console.log(`[FIND] "${query}" - ${results.length} matches`);
    return results;
  }

  // Replace
  replace(query, replacement) {
    let count = 0;
    
    for (let i = 0; i < this.buffer.length; i++) {
      const matches = (this.buffer[i].match(new RegExp(query, 'g')) || []).length;
      this.buffer[i] = this.buffer[i].replace(new RegExp(query, 'g'), replacement);
      count += matches;
    }
    
    console.log(`[REPLACE] ${count} occurrences`);
    return count;
  }

  // Syntax highlighting (simplified)
  highlight(language = 'javascript') {
    const keywords = {
      javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'return']
    };
    
    const highlighted = [];
    
    for (const line of this.buffer) {
      const tokens = [];
      const words = line.split(/(\s+)/);
      
      for (const word of words) {
        if (keywords[language]?.includes(word)) {
          tokens.push({ text: word, type: 'keyword' });
        } else if (word.match(/^["'].*["']$/)) {
          tokens.push({ text: word, type: 'string' });
        } else if (word.match(/^\/\/.*/)) {
          tokens.push({ text: word, type: 'comment' });
        } else {
          tokens.push({ text: word, type: 'text' });
        }
      }
      
      highlighted.push(tokens);
    }
    
    return highlighted;
  }

  // Get content
  getContent() {
    return this.buffer.join('\n');
  }

  // Load content
  loadContent(text) {
    this.buffer = text.split('\n');
    this.cursor = { line: 0, col: 0 };
    console.log(`[LOAD] ${this.buffer.length} lines`);
  }

  // Get stats
  stats() {
    const content = this.getContent();
    return {
      lines: this.buffer.length,
      chars: content.length,
      words: content.split(/\s+/).filter(w => w).length,
      cursor: this.cursor
    };
  }
}

// Demo
if (require.main === module) {
  const editor = new TextEditor();
  
  console.log('=== Text Editor Demo ===\n');
  
  // Type some text
  editor.insert('function hello() {');
  editor.insert('\n');
  editor.insert('  return "world";');
  editor.insert('\n');
  editor.insert('}');
  
  console.log('\nContent:');
  console.log(editor.getContent());
  
  console.log();
  
  // Find
  editor.find('return');
  
  // Replace
  editor.replace('world', 'universe');
  
  console.log('\nAfter replace:');
  console.log(editor.getContent());
  
  console.log();
  
  // Syntax highlighting
  const highlighted = editor.highlight('javascript');
  console.log('Highlighted tokens:', highlighted[1].map(t => `${t.text}(${t.type})`).join(' '));
  
  console.log('\nStats:', editor.stats());
}

module.exports = TextEditor;
