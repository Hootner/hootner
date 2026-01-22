const Video = require('../models/Video');
const User = require('../models/User');

module.exports = {
  User: {
    videos: async (parent) => {
      return Video.find({ userId: parent._id }).sort({ createdAt: -1 });
    }
  },

  Video: {
    user: async (parent) => {
      return User.findById(parent.userId);
    },
    likes: (parent) => parent.likes.length
  }
};
