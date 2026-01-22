// MongoDB Initialization Script for HOOTNER Development
// Creates database, collections, and indexes

/* eslint-env mongo */

const hootnerDb = db.getSiblingDB('hootner');

// Create collections
hootnerDb.createCollection('users');
hootnerDb.createCollection('videos');
hootnerDb.createCollection('sessions');
hootnerDb.createCollection('analytics');

// Create indexes for performance
hootnerDb.users.createIndex({ email: 1 }, { unique: true });
hootnerDb.users.createIndex({ username: 1 }, { unique: true });
hootnerDb.videos.createIndex({ userId: 1 });
hootnerDb.videos.createIndex({ createdAt: -1 });
hootnerDb.sessions.createIndex({ token: 1 }, { unique: true });
hootnerDb.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

print('✅ HOOTNER database initialized successfully');
