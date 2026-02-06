import jwt from 'jsonwebtoken';
import { pubsub } from './subscriptions.js';
import {
  findUserByEmail,
  createUser,
  comparePassword,
  getUserById,
} from '../models/User.js';
import {
  createVideo,
  getVideoById,
  updateVideo as updateVideoRecord,
  deleteVideo as deleteVideoRecord,
  toggleLike,
  addComment,
  deleteComment,
} from '../models/Video.js';
import {
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getPlaylistById,
} from '../models/Playlist.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_min_32_chars_change_prod';

const resolvers = {
  login: async (_, { email, password }) => {
    const user = await findUserByEmail(email);
    if (!user) {
      return {
        success: false,
        message: 'Invalid credentials',
        errors: [{ field: 'email', message: 'User not found' }],
      };
    }

    const valid = await comparePassword(user, password);
    if (!valid) {
      return {
        success: false,
        message: 'Invalid credentials',
        errors: [{ field: 'password', message: 'Incorrect password' }],
      };
    }

    const token = jwt.sign(
      { id: user.userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const refreshToken = jwt.sign({ id: user.userId }, JWT_SECRET, { expiresIn: '30d' });

    return {
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
      user,
      expiresIn: 604800,
    };
  },

  createUser: async (_, { input }) => {
    try {
      const existing = await findUserByEmail(input.email);
      if (existing) {
        return {
          success: false,
          message: 'Email already exists',
          errors: [{ field: 'email', message: 'Email already in use' }],
        };
      }

      const user = await createUser(input);
      return { success: true, message: 'User created', user };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: [{ field: 'general', message: error.message }],
      };
    }
  },

  updateVideo: async (_, { id, input }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    const existing = await getVideoById(id);
    if (!existing) return { success: false, message: 'Video not found' };
    if (existing.userId !== user.id) throw new Error('Not authorized');

    const video = await updateVideoRecord(id, input);
    return { success: true, message: 'Video updated', video };
  },

  deleteVideo: async (_, { id }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    const existing = await getVideoById(id);
    if (!existing) return { success: false, message: 'Video not found' };
    if (existing.userId !== user.id && user.role !== 'ADMIN')
      throw new Error('Not authorized');

    await deleteVideoRecord(id);
    return { success: true, message: 'Video deleted', deletedId: id };
  },

  likeVideo: async (_, { videoId }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    const video = await toggleLike(videoId, user.id);
    if (!video) return { success: false, message: 'Video not found' };
    pubsub.publish('VIDEO_LIKED', { videoLiked: video });
    const wasLiked = (video.likes || []).includes(user.id);
    return { success: true, message: wasLiked ? 'Video liked' : 'Like removed', video };
  },

  addComment: async (_, { videoId, text }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    const result = await addComment(videoId, user.id, text);
    if (!result) return { success: false, message: 'Video not found' };
    pubsub.publish('COMMENT_ADDED', { commentAdded: result });
    return { success: true, message: 'Comment added', video: result.video };
  },

  deleteComment: async (_, { videoId, commentId }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    const updated = await deleteComment(
      videoId,
      commentId,
      user.id,
      user.role === 'ADMIN'
    );
    if (!updated)
      return { success: false, message: 'Comment not found or not authorized' };
    return { success: true, message: 'Comment deleted', video: updated };
  },

  createPlaylist: async (_, { input }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    return createPlaylist({ ...input, userId: user.id });
  },

  updatePlaylist: async (_, { id, input }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    const playlist = await updatePlaylist(id, input, user.id);
    if (!playlist) throw new Error('Playlist not found');
    return playlist;
  },

  deletePlaylist: async (_, { id }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    return deletePlaylist(id, user.id);
  },

  addVideoToPlaylist: async (_, { playlistId, videoId }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    const playlist = await addVideoToPlaylist(playlistId, videoId, user.id);
    if (!playlist) throw new Error('Playlist not found');
    return playlist;
  },

  removeVideoFromPlaylist: async (_, { playlistId, videoId }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    const playlist = await removeVideoFromPlaylist(playlistId, videoId, user.id);
    if (!playlist) throw new Error('Playlist not found');
    return playlist;
  },
};

export default resolvers;
