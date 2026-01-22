const Video = require('../models/Video');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { pubsub } = require('./subscriptions');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_min_32_chars_change_prod';

module.exports = {
  // Authentication
  login: async (_, { email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: 'Invalid credentials', errors: [{ field: 'email', message: 'User not found' }] };
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return { success: false, message: 'Invalid credentials', errors: [{ field: 'password', message: 'Incorrect password' }] };
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

    return {
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
      user,
      expiresIn: 604800
    };
  },

  // Create user
  createUser: async (_, { input }) => {
    try {
      const existing = await User.findOne({ email: input.email });
      if (existing) {
        return { success: false, message: 'Email already exists', errors: [{ field: 'email', message: 'Email already in use' }] };
      }

      const user = await User.create(input);
      return { success: true, message: 'User created', user };
    } catch (error) {
      return { success: false, message: error.message, errors: [{ field: 'general', message: error.message }] };
    }
  },

  // Update video
  updateVideo: async (_, { id, input }, { user }) => {
    if (!user) throw new Error('Not authenticated');

    const video = await Video.findById(id);
    if (!video) return { success: false, message: 'Video not found' };
    if (video.userId.toString() !== user.id) throw new Error('Not authorized');

    Object.assign(video, input);
    await video.save();

    return { success: true, message: 'Video updated', video };
  },

  // Delete video
  deleteVideo: async (_, { id }, { user }) => {
    if (!user) throw new Error('Not authenticated');

    const video = await Video.findById(id);
    if (!video) return { success: false, message: 'Video not found' };
    if (video.userId.toString() !== user.id && user.role !== 'ADMIN') throw new Error('Not authorized');

    await video.deleteOne();
    return { success: true, message: 'Video deleted', deletedId: id };
  },

  // Like video
  likeVideo: async (_, { videoId }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    
    const video = await Video.findById(videoId);
    if (!video) return { success: false, message: 'Video not found' };

    const likeIndex = video.likes.indexOf(user.id);
    if (likeIndex > -1) {
      video.likes.splice(likeIndex, 1);
    } else {
      video.likes.push(user.id);
    }

    await video.save();
    pubsub.publish('VIDEO_LIKED', { videoLiked: video });

    return { success: true, message: likeIndex > -1 ? 'Like removed' : 'Video liked', video };
  },

  // Add comment
  addComment: async (_, { videoId, text }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    
    const video = await Video.findById(videoId);
    if (!video) return { success: false, message: 'Video not found' };

    video.comments.push({ userId: user.id, text });
    await video.save();

    const comment = video.comments[video.comments.length - 1];
    pubsub.publish('COMMENT_ADDED', { commentAdded: { video, comment } });

    return { success: true, message: 'Comment added', video };
  },

  // Delete comment
  deleteComment: async (_, { videoId, commentId }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    
    const video = await Video.findById(videoId);
    if (!video) return { success: false, message: 'Video not found' };

    const comment = video.comments.id(commentId);
    if (!comment) return { success: false, message: 'Comment not found' };
    if (comment.userId.toString() !== user.id && user.role !== 'ADMIN') throw new Error('Not authorized');

    comment.remove();
    await video.save();

    return { success: true, message: 'Comment deleted', video };
  }
};
