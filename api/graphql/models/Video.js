const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  url: { type: String },
  thumbnailUrl: { type: String },
  duration: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['UPLOADING', 'PROCESSING', 'READY', 'FAILED', 'DELETED'],
    default: 'UPLOADING'
  },
  visibility: {
    type: String,
    enum: ['PUBLIC', 'UNLISTED', 'PRIVATE'],
    default: 'PUBLIC'
  },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resolution: String,
  format: String,
  size: Number,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

videoSchema.index({ userId: 1, createdAt: -1 });
videoSchema.index({ status: 1 });
videoSchema.index({ visibility: 1 });

videoSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

videoSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

module.exports = mongoose.model('Video', videoSchema);
