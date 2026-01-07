// Minimal Embedded Database
import fs from 'fs';

class EmbeddedDB {
  constructor(file) {
    this.file = file;
    this.data = this.load();
  }

  load() {
    if (!fs.existsSync(this.file)) return {};
    return JSON.parse(fs.readFileSync(this.file, 'utf8'));
  }

  save() {
    fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
  }

  insert(table, row) {
    if (!this.data[table]) this.data[table] = [];
    this.data[table].push(row);
    this.save();
  }

  select(table, filter = {}) {
    if (!this.data[table]) return [];
    return this.data[table].filter(row => 
      Object.entries(filter).every(([k, v]) => row[k] === v)
    );
  }
}

export default EmbeddedDB;
