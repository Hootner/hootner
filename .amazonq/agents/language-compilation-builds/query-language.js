// Minimal Query Language - SQL-like for data queries
class QueryLanguage {
  constructor() {
    this.tables = new Map();
  }

  // Execute query
  execute(query) {
    query = query.trim().toUpperCase();

    if (query.startsWith('CREATE TABLE')) {
      return this.createTable(query);
    }
    if (query.startsWith('INSERT INTO')) {
      return this.insert(query);
    }
    if (query.startsWith('SELECT')) {
      return this.select(query);
    }
    if (query.startsWith('UPDATE')) {
      return this.update(query);
    }
    if (query.startsWith('DELETE FROM')) {
      return this.delete(query);
    }

    throw new Error('Unknown query');
  }

  createTable(query) {
    const match = query.match(/CREATE TABLE (\w+)/);
    if (match) {
      this.tables.set(match[1], []);
      return { success: true, message: `Table ${match[1]} created` };
    }
  }

  insert(query) {
    const match = query.match(/INSERT INTO (\w+) VALUES \(([^)]+)\)/);
    if (match) {
      const [, table, values] = match;
      const row = values.split(',').map(v => v.trim().replace(/'/g, ''));
      this.tables.get(table).push(row);
      return { success: true, inserted: 1 };
    }
  }

  select(query) {
    const match = query.match(/SELECT (.+) FROM (\w+)(?: WHERE (.+))?/);
    if (match) {
      const [, columns, table, where] = match;
      let rows = this.tables.get(table) || [];

      // Filter WHERE
      if (where) {
        rows = rows.filter(row => this.evaluateWhere(row, where));
      }

      // Select columns
      if (columns === '*') {
        return rows;
      }

      return rows;
    }
  }

  update(query) {
    const match = query.match(/UPDATE (\w+) SET (.+) WHERE (.+)/);
    if (match) {
      const [, table, set, where] = match;
      const rows = this.tables.get(table);
      let updated = 0;

      rows.forEach(row => {
        if (this.evaluateWhere(row, where)) {
          // Simple SET parsing
          const [col, val] = set.split('=').map(s => s.trim());
          row[0] = val.replace(/'/g, '');
          updated++;
        }
      });

      return { success: true, updated };
    }
  }

  delete(query) {
    const match = query.match(/DELETE FROM (\w+) WHERE (.+)/);
    if (match) {
      const [, table, where] = match;
      const rows = this.tables.get(table);
      const filtered = rows.filter(row => !this.evaluateWhere(row, where));
      const deleted = rows.length - filtered.length;
      this.tables.set(table, filtered);
      return { success: true, deleted };
    }
  }

  evaluateWhere(row, where) {
    // Simple: column = 'value'
    const match = where.match(/(\w+) = '([^']+)'/);
    if (match) {
      const [, col, val] = match;
      return row[0] === val; // Simplified: only first column
    }
    return true;
  }
}

// Demo
console.log('=== Query Language Demo ===\n');

const ql = new QueryLanguage();

console.log('--- CREATE TABLE ---');
console.log(ql.execute('CREATE TABLE users'));

console.log('\n--- INSERT ---');
console.log(ql.execute("INSERT INTO users VALUES ('Alice', '30')"));
console.log(ql.execute("INSERT INTO users VALUES ('Bob', '25')"));
console.log(ql.execute("INSERT INTO users VALUES ('Charlie', '35')"));

console.log('\n--- SELECT * ---');
console.log(ql.execute('SELECT * FROM users'));

console.log('\n--- SELECT WHERE ---');
console.log(ql.execute("SELECT * FROM users WHERE name = 'Alice'"));

console.log('\n--- UPDATE ---');
console.log(ql.execute("UPDATE users SET name = 'Alicia' WHERE name = 'Alice'"));
console.log(ql.execute('SELECT * FROM users'));

console.log('\n--- DELETE ---');
console.log(ql.execute("DELETE FROM users WHERE name = 'Bob'"));
console.log(ql.execute('SELECT * FROM users'));

export default QueryLanguage;
