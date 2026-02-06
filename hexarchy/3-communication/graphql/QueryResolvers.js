// GraphQL Query Resolvers
import { UserService } from '../../1-foundation/services/UserService.js';
import { VideoService } from '../../1-foundation/services/VideoService.js';
import { CommentService } from '../../1-foundation/services/CommentService.js';
import { PlaylistService } from '../../1-foundation/services/PlaylistService.js';
import { NotificationService } from '../../1-foundation/services/NotificationService.js';

const userService = new UserService();
const videoService = new VideoService();
const commentService = new CommentService();
const playlistService = new PlaylistService();
const notificationService = new NotificationService();

export const Query = {
  // User queries
  me: async (_, __, { user }) => {
    if (!user) throw new Error('Not authenticated');
    return await userService.getUserById(user.id);
  },

  user: async (_, { id }) => {
    return await userService.getUserById(id);
  },

  // Video queries
  video: async (_, { id }, { user }) => {
    const video = await videoService.getVideoById(id);
    if (!video) throw new Error('Video not found');

    if (!videoService.canUserViewVideo(video, user)) {
      throw new Error('Access denied');
    }

    return video;
  },

  videos: async (_, { limit = 20, category }) => {
    if (category) {
      return await videoService.getVideosByCategory(category, limit);
    }
    return await videoService.getPublicVideos(limit);
  },

  trendingVideos: async (_, { limit = 20 }) => {
    return await videoService.getTrendingVideos(limit);
  },

  userVideos: async (_, { userId, limit = 20 }) => {
    return await videoService.getVideosByUser(userId, limit);
  },

  // Comment queries
  comment: async (_, { id }) => {
    return await commentService.getCommentById(id);
  },

  videoComments: async (_, { videoId, limit = 100 }) => {
    return await commentService.getCommentsByVideo(videoId, limit);
  },

  commentReplies: async (_, { commentId, limit = 50 }) => {
    return await commentService.getReplies(commentId, limit);
  },

  // Playlist queries
  playlist: async (_, { id }, { user }) => {
    const playlist = await playlistService.getPlaylistById(id);
    if (!playlist) throw new Error('Playlist not found');

    if (!playlist.canBeViewedBy(user)) {
      throw new Error('Access denied');
    }

    return playlist;
  },

  playlists: async (_, { limit = 100 }) => {
    return await playlistService.getPublicPlaylists(limit);
  },

  userPlaylists: async (_, { userId, limit = 100 }) => {
    return await playlistService.getPlaylistsByUser(userId, limit);
  },

  // Notification queries
  notifications: async (_, { limit = 100 }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    return await notificationService.getNotificationsByUser(user.id, limit);
  },

  unreadNotifications: async (_, { limit = 100 }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    return await notificationService.getUnreadNotifications(user.id, limit);
  },

  unreadCount: async (_, __, { user }) => {
    if (!user) throw new Error('Not authenticated');
    return await notificationService.getUnreadCount(user.id);
  }
};

export default Query;
