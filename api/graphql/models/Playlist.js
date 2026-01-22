const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  visibility: {
    type: String,
    enum: ['PUBLIC', 'PRIVATE'],
    default: 'PUBLIC'
  },
  thumbnail: String
}, { timestamps: true });

playlistSchema.index({ userId: 1, createdAt: -1 });

playlistSchema.virtual('videoCount').get(function() {
  return this.videos.length;
});

module.exports = mongoose.model('Playlist', playlistSchema);
