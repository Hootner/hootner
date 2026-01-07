#!/usr/bin/env node
/**
 * Layer 6: Document Database - MongoDB-like document store
 * Dependencies: Layer 0 (Hash), Layer 2 (Parser), Layer 3 (Filesystem)
 */

class DocumentDB {
  constructor() {
    this.collections = new Map();
    this.indexes = new Map();
  }

  // Create collection
  createCollection(name) {
    this.collections.set(name, {
      name,
      documents: [],
      nextId: 1
    });
    console.log(`[CREATE] Collection ${name}`);
  }

  // Insert document
  insert(collection, doc) {
    const coll = this.collections.get(collection);
    if (!coll) throw new Error(`Collection ${collection} not found`);
    
    const document = {
      _id: coll.nextId++,
      ...doc,
      _created: Date.now()
    };
    
    coll.documents.push(document);
    console.log(`[INSERT] ${collection} _id=${document._id}`);
    return document._id;
  }

  // Insert many
  insertMany(collection, docs) {
    return docs.map(doc => this.insert(collection, doc));
  }

  // Find documents
  find(collection, query = {}, options = {}) {
    const coll = this.collections.get(collection);
    if (!coll) return [];
    
    let results = coll.documents.filter(doc => this.matchQuery(doc, query));
    
    // Sort
    if (options.sort) {
      const [field, order] = Object.entries(options.sort)[0];
      results.sort((a, b) => {
        const aVal = this.getNestedValue(a, field);
        const bVal = this.getNestedValue(b, field);
        return order === 1 ? aVal - bVal : bVal - aVal;
      });
    }
    
    // Limit
    if (options.limit) {
      results = results.slice(0, options.limit);
    }
    
    console.log(`[FIND] ${collection} matched ${results.length} documents`);
    return results;
  }

  // Find one
  findOne(collection, query = {}) {
    const results = this.find(collection, query, { limit: 1 });
    return results[0] || null;
  }

  // Update documents
  update(collection, query, update) {
    const coll = this.collections.get(collection);
    let updated = 0;
    
    coll.documents.forEach(doc => {
      if (this.matchQuery(doc, query)) {
        // $set operator
        if (update.$set) {
          Object.assign(doc, update.$set);
        }
        // $inc operator
        if (update.$inc) {
          for (const [field, value] of Object.entries(update.$inc)) {
            doc[field] = (doc[field] || 0) + value;
          }
        }
        // $push operator
        if (update.$push) {
          for (const [field, value] of Object.entries(update.$push)) {
            if (!Array.isArray(doc[field])) doc[field] = [];
            doc[field].push(value);
          }
        }
        doc._updated = Date.now();
        updated++;
      }
    });
    
    console.log(`[UPDATE] ${collection} updated ${updated} documents`);
    return { updated };
  }

  // Delete documents
  delete(collection, query) {
    const coll = this.collections.get(collection);
    const before = coll.documents.length;
    
    coll.documents = coll.documents.filter(doc => !this.matchQuery(doc, query));
    
    const deleted = before - coll.documents.length;
    console.log(`[DELETE] ${collection} deleted ${deleted} documents`);
    return { deleted };
  }

  // Match query
  matchQuery(doc, query) {
    for (const [key, value] of Object.entries(query)) {
      const docValue = this.getNestedValue(doc, key);
      
      // Operators
      if (typeof value === 'object' && !Array.isArray(value)) {
        for (const [op, opValue] of Object.entries(value)) {
          if (op === '$gt' && !(docValue > opValue)) return false;
          if (op === '$gte' && !(docValue >= opValue)) return false;
          if (op === '$lt' && !(docValue < opValue)) return false;
          if (op === '$lte' && !(docValue <= opValue)) return false;
          if (op === '$ne' && docValue === opValue) return false;
          if (op === '$in' && !opValue.includes(docValue)) return false;
        }
      } else {
        if (docValue !== value) return false;
      }
    }
    return true;
  }

  // Get nested value
  getNestedValue(obj, path) {
    return path.split('.').reduce((val, key) => val?.[key], obj);
  }

  // Create index
  createIndex(collection, field) {
    const key = `${collection}:${field}`;
    this.indexes.set(key, new Map());
    console.log(`[INDEX] Created on ${collection}.${field}`);
  }

  // Aggregate
  aggregate(collection, pipeline) {
    const coll = this.collections.get(collection);
    let results = [...coll.documents];
    
    for (const stage of pipeline) {
      if (stage.$match) {
        results = results.filter(doc => this.matchQuery(doc, stage.$match));
      }
      if (stage.$group) {
        const grouped = new Map();
        for (const doc of results) {
          const key = this.getNestedValue(doc, stage.$group._id.replace('$', ''));
          if (!grouped.has(key)) {
            grouped.set(key, { _id: key, count: 0 });
          }
          grouped.get(key).count++;
        }
        results = Array.from(grouped.values());
      }
    }
    
    console.log(`[AGGREGATE] ${collection} returned ${results.length} results`);
    return results;
  }

  // Stats
  stats() {
    const collStats = Array.from(this.collections.values()).map(c => ({
      name: c.name,
      documents: c.documents.length
    }));
    
    return {
      collections: this.collections.size,
      indexes: this.indexes.size,
      collections: collStats
    };
  }
}

// Demo
if (require.main === module) {
  const db = new DocumentDB();
  
  console.log('=== Document Database Demo ===\n');
  
  // Create collection
  db.createCollection('users');
  
  console.log();
  
  // Insert documents
  db.insert('users', { name: 'Alice', age: 30, city: 'NYC' });
  db.insert('users', { name: 'Bob', age: 25, city: 'LA' });
  db.insert('users', { name: 'Charlie', age: 35, city: 'NYC' });
  
  console.log();
  
  // Find
  const all = db.find('users');
  console.log('All users:', all.map(u => u.name));
  
  console.log();
  
  const filtered = db.find('users', { city: 'NYC' });
  console.log('NYC users:', filtered.map(u => u.name));
  
  console.log();
  
  const range = db.find('users', { age: { $gte: 30 } });
  console.log('Age >= 30:', range.map(u => u.name));
  
  console.log();
  
  // Update
  db.update('users', { name: 'Alice' }, { $set: { age: 31 }, $push: { tags: 'premium' } });
  
  // Aggregate
  console.log();
  const byCity = db.aggregate('users', [
    { $group: { _id: '$city' } }
  ]);
  console.log('By city:', byCity);
  
  console.log('\nStats:', db.stats());
}

module.exports = DocumentDB;
