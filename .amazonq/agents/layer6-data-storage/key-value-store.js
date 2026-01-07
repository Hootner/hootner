#!/usr/bin/env node
/**
 * Layer 6: Key-Value Store - Redis-like in-memory database
 * Dependencies: Layer 0 (Hash), Layer 3 (Memory), Layer 5 (TCP)
 */

class KeyValueStore {
  constructor() {
    this.data = new Map();
    this.expires = new Map();
    this.commands = [];
  }

  // SET key value [EX seconds]
  set(key, value, options = {}) {
    this.data.set(key, value);
    
    if (options.ex) {
      this.expires.set(key, Date.now() + options.ex * 1000);
    }
    
    this.commands.push({ cmd: 'SET', key, time: Date.now() });
    console.log(`[SET] ${key} = ${value}${options.ex ? ` (TTL: ${options.ex}s)` : ''}`);
    return 'OK';
  }

  // GET key
  get(key) {
    if (this.isExpired(key)) {
      this.data.delete(key);
      this.expires.delete(key);
      return null;
    }
    
    const value = this.data.get(key);
    this.commands.push({ cmd: 'GET', key, time: Date.now() });
    console.log(`[GET] ${key} = ${value}`);
    return value;
  }

  // DEL key [key ...]
  del(...keys) {
    let deleted = 0;
    for (const key of keys) {
      if (this.data.delete(key)) {
        this.expires.delete(key);
        deleted++;
      }
    }
    console.log(`[DEL] ${deleted} keys deleted`);
    return deleted;
  }

  // EXISTS key
  exists(key) {
    if (this.isExpired(key)) {
      this.data.delete(key);
      this.expires.delete(key);
      return 0;
    }
    return this.data.has(key) ? 1 : 0;
  }

  // INCR key
  incr(key) {
    const val = parseInt(this.data.get(key) || '0');
    const newVal = val + 1;
    this.data.set(key, String(newVal));
    console.log(`[INCR] ${key} = ${newVal}`);
    return newVal;
  }

  // LPUSH key value [value ...]
  lpush(key, ...values) {
    const list = this.data.get(key) || [];
    list.unshift(...values);
    this.data.set(key, list);
    console.log(`[LPUSH] ${key} (length: ${list.length})`);
    return list.length;
  }

  // RPUSH key value [value ...]
  rpush(key, ...values) {
    const list = this.data.get(key) || [];
    list.push(...values);
    this.data.set(key, list);
    console.log(`[RPUSH] ${key} (length: ${list.length})`);
    return list.length;
  }

  // LRANGE key start stop
  lrange(key, start, stop) {
    const list = this.data.get(key) || [];
    return list.slice(start, stop === -1 ? undefined : stop + 1);
  }

  // HSET key field value
  hset(key, field, value) {
    const hash = this.data.get(key) || {};
    hash[field] = value;
    this.data.set(key, hash);
    console.log(`[HSET] ${key}.${field} = ${value}`);
    return 1;
  }

  // HGET key field
  hget(key, field) {
    const hash = this.data.get(key) || {};
    return hash[field];
  }

  // HGETALL key
  hgetall(key) {
    return this.data.get(key) || {};
  }

  // EXPIRE key seconds
  expire(key, seconds) {
    if (!this.data.has(key)) return 0;
    this.expires.set(key, Date.now() + seconds * 1000);
    console.log(`[EXPIRE] ${key} in ${seconds}s`);
    return 1;
  }

  // TTL key
  ttl(key) {
    if (!this.expires.has(key)) return -1;
    const remaining = Math.floor((this.expires.get(key) - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  // Check if key expired
  isExpired(key) {
    if (!this.expires.has(key)) return false;
    return Date.now() >= this.expires.get(key);
  }

  // KEYS pattern
  keys(pattern = '*') {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(this.data.keys()).filter(k => regex.test(k));
  }

  // INFO
  info() {
    return {
      keys: this.data.size,
      expires: this.expires.size,
      commands: this.commands.length,
      memory: JSON.stringify(Array.from(this.data.entries())).length
    };
  }
}

// Demo
if (require.main === module) {
  const kv = new KeyValueStore();
  
  console.log('=== Key-Value Store Demo ===\n');
  
  // String operations
  kv.set('user:1:name', 'Alice');
  kv.set('user:1:age', '30');
  kv.get('user:1:name');
  
  console.log();
  
  // Counter
  kv.incr('page:views');
  kv.incr('page:views');
  kv.incr('page:views');
  
  console.log();
  
  // List operations
  kv.rpush('queue', 'job1', 'job2', 'job3');
  console.log('Queue:', kv.lrange('queue', 0, -1));
  
  console.log();
  
  // Hash operations
  kv.hset('user:2', 'name', 'Bob');
  kv.hset('user:2', 'age', '25');
  console.log('User 2:', kv.hgetall('user:2'));
  
  console.log();
  
  // Expiration
  kv.set('session:abc', 'token123', { ex: 5 });
  console.log('TTL:', kv.ttl('session:abc'), 'seconds');
  
  console.log();
  
  // Pattern matching
  console.log('User keys:', kv.keys('user:*'));
  
  console.log('\nInfo:', kv.info());
}

module.exports = KeyValueStore;
