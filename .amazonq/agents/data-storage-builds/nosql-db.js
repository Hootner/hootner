// Minimal NoSQL Database
class NoSQLDB {
  constructor() {
    this.collections = new Map();
  }

  insert(collection, doc) {
    if (!this.collections.has(collection)) this.collections.set(collection, []);
    doc._id = Date.now() + Math.random();
    this.collections.get(collection).push(doc);
    return doc._id;
  }

  find(collection, query = {}) {
    if (!this.collections.has(collection)) return [];
    return this.collections.get(collection).filter(doc =>
      Object.entries(query).every(([k, v]) => doc[k] === v)
    );
  }

  update(collection, query, update) {
    const docs = this.find(collection, query);
    docs.forEach(doc => Object.assign(doc, update));
    return docs.length;
  }
}

const db = new NoSQLDB();
db.insert('users', { name: 'Alice', age: 30 });
console.log(db.find('users', { name: 'Alice' }));

export default NoSQLDB;
