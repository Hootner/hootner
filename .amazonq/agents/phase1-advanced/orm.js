class Model {
    constructor(data = {}) {
        Object.assign(this, data);
    }
    
    static get tableName() {
        return this.name.toLowerCase() + 's';
    }
    
    static setDatabase(db) {
        this.db = db;
    }
    
    static create(data) {
        const id = this.db.insert(this.tableName, data);
        return new this({ id, ...data });
    }
    
    static find(id) {
        const results = this.db.select(this.tableName, { id });
        return results.length > 0 ? new this(results[0]) : null;
    }
    
    static findBy(criteria) {
        const results = this.db.select(this.tableName, criteria);
        return results.map(row => new this(row));
    }
    
    static all() {
        const results = this.db.select(this.tableName);
        return results.map(row => new this(row));
    }
    
    save() {
        if (this.id) {
            this.constructor.db.update(
                this.constructor.tableName,
                { id: this.id },
                this.toJSON()
            );
        } else {
            const id = this.constructor.db.insert(
                this.constructor.tableName,
                this.toJSON()
            );
            this.id = id;
        }
        return this;
    }
    
    delete() {
        if (this.id) {
            this.constructor.db.delete(
                this.constructor.tableName,
                { id: this.id }
            );
        }
    }
    
    toJSON() {
        const obj = {};
        for (let key in this) {
            if (this.hasOwnProperty(key) && typeof this[key] !== 'function') {
                obj[key] = this[key];
            }
        }
        return obj;
    }
}

class ORM {
    constructor(database) {
        this.database = database;
    }
    
    define(name, schema) {
        const ModelClass = class extends Model {};
        Object.defineProperty(ModelClass, 'name', { value: name });
        ModelClass.setDatabase(this.database);
        
        // Create table
        const columns = ['id', ...Object.keys(schema)];
        this.database.createTable(ModelClass.tableName, columns);
        
        return ModelClass;
    }
}

// Test
import SQLDatabase from './sql-database.js';

const db = new SQLDatabase();
const orm = new ORM(db);

const User = orm.define('User', {
    name: 'string',
    email: 'string',
    age: 'number'
});

console.log('\n--- ORM Demo ---');

const user1 = User.create({ name: 'Alice', email: 'alice@test.com', age: 30 });
console.log('Created user:', user1.name);

const user2 = User.create({ name: 'Bob', email: 'bob@test.com', age: 25 });

const allUsers = User.all();
console.log(`\nAll users (${allUsers.length}):`);
allUsers.forEach(u => console.log(`  ${u.name} - ${u.email}`));

const found = User.find(1);
console.log(`\nFound user by ID: ${found.name}`);

const byEmail = User.findBy({ email: 'bob@test.com' });
console.log(`Found by email: ${byEmail[0].name}`);

user1.age = 31;
user1.save();
console.log(`\nUpdated ${user1.name}'s age to ${user1.age}`);

export { ORM, Model };
