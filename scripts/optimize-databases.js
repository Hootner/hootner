#!/usr/bin/env node
/**
 * Database Optimization Script
 * Configures MongoDB and Redis for optimal performance
 */

const { MongoClient } = require('mongodb');
const redis = require('redis');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:dev_password_change_in_prod@localhost:27017/hootner?authSource=admin';
const REDIS_URL = process.env.REDIS_URL || 'redis://:dev_redis_password@localhost:6379';

console.log('🔧 HOOTNER Database Optimization\n');

// MongoDB Optimization
async function optimizeMongoDB() {
  console.log('📊 Optimizing MongoDB...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('hootner');
    
    // Create collections if they don't exist
    const collections = ['users', 'videos', 'sessions', 'analytics'];
    for (const collName of collections) {
      const exists = await db.listCollections({ name: collName }).hasNext();
      if (!exists) {
        await db.createCollection(collName);
        console.log(`   Created collection: ${collName}`);
      }
    }
    
    // Create indexes for performance
    console.log('\n📑 Creating indexes...');
    
    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true, background: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true, background: true });
    await db.collection('users').createIndex({ createdAt: -1 }, { background: true });
    console.log('   ✓ Users indexes');
    
    // Videos indexes
    await db.collection('videos').createIndex({ userId: 1, createdAt: -1 }, { background: true });
    await db.collection('videos').createIndex({ status: 1 }, { background: true });
    await db.collection('videos').createIndex({ tags: 1 }, { background: true });
    console.log('   ✓ Videos indexes');
    
    // Sessions indexes with TTL
    await db.collection('sessions').createIndex({ token: 1 }, { unique: true, background: true });
    await db.collection('sessions').createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0, background: true }
    );
    console.log('   ✓ Sessions indexes (with TTL)');
    
    // Analytics indexes
    await db.collection('analytics').createIndex({ videoId: 1, timestamp: -1 }, { background: true });
    await db.collection('analytics').createIndex({ userId: 1, timestamp: -1 }, { background: true });
    console.log('   ✓ Analytics indexes');
    
    // Get database stats
    const stats = await db.stats();
    console.log('\n📈 Database Stats:');
    console.log(`   Collections: ${stats.collections}`);
    console.log(`   Indexes: ${stats.indexes}`);
    console.log(`   Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\n✅ MongoDB optimization complete');
    
  } catch (error) {
    console.error('❌ MongoDB optimization failed:', error.message);
  } finally {
    await client.close();
  }
}

// Redis Optimization
async function optimizeRedis() {
  console.log('\n📊 Optimizing Redis...');
  
  const client = redis.createClient({
    url: REDIS_URL,
  });
  
  client.on('error', (err) => console.error('Redis error:', err));
  
  try {
    await client.connect();
    console.log('✅ Connected to Redis');
    
    // Set memory policy
    await client.configSet('maxmemory-policy', 'allkeys-lru');
    console.log('   ✓ Set LRU eviction policy');
    
    // Enable RDB persistence
    await client.configSet('save', '900 1 300 10 60 10000');
    console.log('   ✓ Configured RDB snapshots');
    
    // Set max memory (1GB)
    await client.configSet('maxmemory', '1gb');
    console.log('   ✓ Set max memory to 1GB');
    
    // Get Redis info
    const info = await client.info('memory');
    const memoryLines = info.split('\r\n');
    const usedMemory = memoryLines.find(l => l.startsWith('used_memory_human:'));
    const peakMemory = memoryLines.find(l => l.startsWith('used_memory_peak_human:'));
    
    console.log('\n📈 Redis Stats:');
    console.log(`   ${usedMemory}`);
    console.log(`   ${peakMemory}`);
    
    // Test connection
    await client.set('hootner:health', 'ok', { EX: 60 });
    const health = await client.get('hootner:health');
    console.log(`   Health check: ${health}`);
    
    console.log('\n✅ Redis optimization complete');
    
  } catch (error) {
    console.error('❌ Redis optimization failed:', error.message);
  } finally {
    await client.quit();
  }
}

// Main execution
async function main() {
  try {
    await optimizeMongoDB();
    await optimizeRedis();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Database optimization complete!');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Optimization failed:', error);
    process.exit(1);
  }
}

main();
