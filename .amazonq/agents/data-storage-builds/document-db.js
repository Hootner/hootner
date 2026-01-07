const fs = require('fs');

class DocumentDB {
    constructor(filename = 'db.json') {
        this.filename = filename;
        this.data = this.load();
    }
    
    load() {
        try {
            return JSON.parse(fs.readFileSync(this.filename, 'utf8'));
        } catch {
            return {};
        }
    }
    
    save() {
        fs.writeFileSync(this.filename, JSON.stringify(this.data, null, 2));
    }
    
    insert(collection, doc) {
        if (!this.data[collection]) {
            this.data[collection] = [];
        }
        doc._id = Date.now().toString();
        this.data[collection].push(doc);
        this.save();
        return doc;
    }
    
    find(collection, query = {}) {
        if (!this.data[collection]) return [];
        
        return this.data[collection].filter(doc => {
            return Object.keys(query).every(key => doc[key] === query[key]);
        });
    }
    
    update(collection, query, update) {
        if (!this.data[collection]) return 0;
        
        let count = 0;
        this.data[collection].forEach(doc => {
            if (Object.keys(query).every(key => doc[key] === query[key])) {
                Object.assign(doc, update);
                count++;
            }
        });
        this.save();
        return count;
    }
    
    delete(collection, query) {
        if (!this.data[collection]) return 0;
        
        const before = this.data[collection].length;
        this.data[collection] = this.data[collection].filter(doc => {
            return !Object.keys(query).every(key => doc[key] === query[key]);
        });
        const deleted = before - this.data[collection].length;
        this.save();
        return deleted;
    }
}

// Test
const db = new DocumentDB('test.json');
db.insert('users', { name: 'Alice', age: 30 });
db.insert('users', { name: 'Bob', age: 25 });
console.log('All users:', db.find('users'));
console.log('Age 30:', db.find('users', { age: 30 }));
