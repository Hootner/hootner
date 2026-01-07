class SQLDatabase {
    constructor() {
        this.tables = new Map();
        this.transactions = [];
    }
    
    createTable(name, columns) {
        this.tables.set(name, {
            columns,
            rows: [],
            indexes: new Map()
        });
        console.log(`✓ Created table: ${name}`);
    }
    
    insert(tableName, values) {
        const table = this.tables.get(tableName);
        if (!table) throw new Error(`Table ${tableName} not found`);
        
        const row = { id: table.rows.length + 1, ...values };
        table.rows.push(row);
        
        console.log(`✓ Inserted row into ${tableName}`);
        return row.id;
    }
    
    select(tableName, where = null) {
        const table = this.tables.get(tableName);
        if (!table) throw new Error(`Table ${tableName} not found`);
        
        let results = table.rows;
        
        if (where) {
            results = results.filter(row => {
                return Object.keys(where).every(key => row[key] === where[key]);
            });
        }
        
        return results;
    }
    
    update(tableName, where, values) {
        const table = this.tables.get(tableName);
        if (!table) throw new Error(`Table ${tableName} not found`);
        
        let updated = 0;
        table.rows.forEach(row => {
            const matches = Object.keys(where).every(key => row[key] === where[key]);
            if (matches) {
                Object.assign(row, values);
                updated++;
            }
        });
        
        console.log(`✓ Updated ${updated} rows in ${tableName}`);
        return updated;
    }
    
    delete(tableName, where) {
        const table = this.tables.get(tableName);
        if (!table) throw new Error(`Table ${tableName} not found`);
        
        const before = table.rows.length;
        table.rows = table.rows.filter(row => {
            return !Object.keys(where).every(key => row[key] === where[key]);
        });
        
        const deleted = before - table.rows.length;
        console.log(`✓ Deleted ${deleted} rows from ${tableName}`);
        return deleted;
    }
    
    createIndex(tableName, column) {
        const table = this.tables.get(tableName);
        if (!table) throw new Error(`Table ${tableName} not found`);
        
        const index = new Map();
        table.rows.forEach((row, idx) => {
            const key = row[column];
            if (!index.has(key)) index.set(key, []);
            index.get(key).push(idx);
        });
        
        table.indexes.set(column, index);
        console.log(`✓ Created index on ${tableName}.${column}`);
    }
    
    beginTransaction() {
        this.transactions.push({ operations: [] });
        console.log('✓ Transaction started');
    }
    
    commit() {
        this.transactions.pop();
        console.log('✓ Transaction committed');
    }
    
    rollback() {
        this.transactions.pop();
        console.log('✓ Transaction rolled back');
    }
}

// Test
const db = new SQLDatabase();

db.createTable('users', ['id', 'name', 'email', 'age']);

db.insert('users', { name: 'Alice', email: 'alice@example.com', age: 30 });
db.insert('users', { name: 'Bob', email: 'bob@example.com', age: 25 });
db.insert('users', { name: 'Charlie', email: 'charlie@example.com', age: 35 });

console.log('\nAll users:', db.select('users'));
console.log('\nUsers age 30:', db.select('users', { age: 30 }));

db.update('users', { name: 'Bob' }, { age: 26 });
console.log('\nAfter update:', db.select('users', { name: 'Bob' }));

db.createIndex('users', 'email');

db.delete('users', { name: 'Charlie' });
console.log('\nRemaining users:', db.select('users').length);

export default SQLDatabase;
