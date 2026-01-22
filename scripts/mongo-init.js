// MongoDB Initialization Script for HOOTNER Development
// Creates database, collections, and indexes

db = db.getSiblingDB('hootner');

// Create collections
db.createCollection('users');
db.createCollection('videos');
db.createCollection('sessions');
db.createCollection('analytics');

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.videos.createIndex({ userId: 1 });
db.videos.createIndex({ createdAt: -1 });
db.sessions.createIndex({ token: 1 }, { unique: true });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

print('✅ HOOTNER database initialized successfully');
