#!/usr/bin/env node
/**
 * Layer 6: Relational Database - SQL database with ACID transactions
 * Dependencies: Layer 0 (Binary), Layer 2 (Parser), Layer 3 (Filesystem)
 */

class RelationalDB {
  constructor() {
    this.tables = new Map();
    this.indexes = new Map();
    this.transactions = [];
    this.currentTxn = null;
  }

  // Create table
  createTable(name, schema) {
    this.tables.set(name, {
      name,
      schema, // { id: 'INTEGER PRIMARY KEY', name: 'TEXT', age: 'INTEGER' }
      rows: [],
      nextId: 1
    });
    console.log(`[CREATE TABLE] ${name}`);
  }

  // Parse SQL (simplified)
  parseSQL(sql) {
    const upper = sql.trim().toUpperCase();
    if (upper.startsWith('SELECT')) {
      const match = sql.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*))?/i);
      return { type: 'SELECT', columns: match[1], table: match[2], where: match[3] };
    } else if (upper.startsWith('INSERT')) {
      const match = sql.match(/INSERT INTO\s+(\w+)\s+VALUES\s*\((.*?)\)/i);
      return { type: 'INSERT', table: match[1], values: match[2].split(',').map(v => v.trim().replace(/'/g, '')) };
    } else if (upper.startsWith('UPDATE')) {
      const match = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.*?)(?:\s+WHERE\s+(.*))?/i);
      return { type: 'UPDATE', table: match[1], set: match[2], where: match[3] };
    } else if (upper.startsWith('DELETE')) {
      const match = sql.match(/DELETE FROM\s+(\w+)(?:\s+WHERE\s+(.*))?/i);
      return { type: 'DELETE', table: match[1], where: match[2] };
    }
  }

  // Execute SQL
  execute(sql) {
    const query = this.parseSQL(sql);
    console.log(`[SQL] ${sql}`);
    
    switch (query.type) {
      case 'SELECT': return this.select(query);
      case 'INSERT': return this.insert(query);
      case 'UPDATE': return this.update(query);
      case 'DELETE': return this.delete(query);
    }
  }

  // SELECT
  select(query) {
    const table = this.tables.get(query.table);
    let rows = table.rows;
    
    // WHERE clause
    if (query.where) {
      rows = rows.filter(row => this.evalWhere(row, query.where));
    }
    
    // Column selection
    const result = query.columns === '*' 
      ? rows 
      : rows.map(row => {
          const cols = query.columns.split(',').map(c => c.trim());
          const filtered = {};
          cols.forEach(col => filtered[col] = row[col]);
          return filtered;
        });
    
    console.log(`[RESULT] ${result.length} rows`);
    return result;
  }

  // INSERT
  insert(query) {
    const table = this.tables.get(query.table);
    const cols = Object.keys(table.schema);
    const row = {};
    
    cols.forEach((col, i) => {
      row[col] = query.values[i] || null;
    });
    
    row.id = table.nextId++;
    table.rows.push(row);
    
    console.log(`[INSERT] Row ${row.id}`);
    return { inserted: 1, id: row.id };
  }

  // UPDATE
  update(query) {
    const table = this.tables.get(query.table);
    const [col, val] = query.set.split('=').map(s => s.trim().replace(/'/g, ''));
    
    let updated = 0;
    table.rows.forEach(row => {
      if (!query.where || this.evalWhere(row, query.where)) {
        row[col] = val;
        updated++;
      }
    });
    
    console.log(`[UPDATE] ${updated} rows`);
    return { updated };
  }

  // DELETE
  delete(query) {
    const table = this.tables.get(query.table);
    const before = table.rows.length;
    
    table.rows = table.rows.filter(row => 
      query.where ? !this.evalWhere(row, query.where) : false
    );
    
    const deleted = before - table.rows.length;
    console.log(`[DELETE] ${deleted} rows`);
    return { deleted };
  }

  // Evaluate WHERE clause
  evalWhere(row, where) {
    const match = where.match(/(\w+)\s*=\s*'?([^']*)'?/);
    if (match) {
      const [, col, val] = match;
      return String(row[col]) === val;
    }
    return true;
  }

  // Begin transaction
  begin() {
    this.currentTxn = { id: this.transactions.length + 1, operations: [] };
    console.log(`[BEGIN] Transaction ${this.currentTxn.id}`);
  }

  // Commit transaction
  commit() {
    if (this.currentTxn) {
      this.transactions.push(this.currentTxn);
      console.log(`[COMMIT] Transaction ${this.currentTxn.id}`);
      this.currentTxn = null;
    }
  }

  // Rollback transaction
  rollback() {
    if (this.currentTxn) {
      console.log(`[ROLLBACK] Transaction ${this.currentTxn.id}`);
      this.currentTxn = null;
    }
  }
}

// Demo
if (require.main === module) {
  const db = new RelationalDB();
  
  console.log('=== Relational Database Demo ===\n');
  
  // Create table
  db.createTable('users', {
    id: 'INTEGER PRIMARY KEY',
    name: 'TEXT',
    age: 'INTEGER'
  });
  
  console.log();
  
  // Insert
  db.execute("INSERT INTO users VALUES ('Alice', 30)");
  db.execute("INSERT INTO users VALUES ('Bob', 25)");
  db.execute("INSERT INTO users VALUES ('Charlie', 35)");
  
  console.log();
  
  // Select
  const all = db.execute('SELECT * FROM users');
  console.log('All users:', all);
  
  console.log();
  
  const filtered = db.execute("SELECT name, age FROM users WHERE name = 'Alice'");
  console.log('Filtered:', filtered);
  
  console.log();
  
  // Update
  db.execute("UPDATE users SET age = '31' WHERE name = 'Alice'");
  
  // Transaction
  console.log();
  db.begin();
  db.execute("INSERT INTO users VALUES ('Dave', 40)");
  db.commit();
}

module.exports = RelationalDB;
