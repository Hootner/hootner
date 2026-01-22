const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:dev_password_change_in_prod@localhost:27017/hootner?authSource=admin';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    
    isConnected = true;
    console.log('✅ MongoDB connected');

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err);
      isConnected = false;
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

module.exports = { connectDB };
