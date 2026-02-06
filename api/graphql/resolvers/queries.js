import {
  listVideos,
  getVideoById,
  incrementViews,
  trendingVideos as listTrendingVideos,
} from '../models/Video.js';
import { listUsers, getUserById } from '../models/User.js';
import { listPlaylists, getPlaylistById } from '../models/Playlist.js';

const resolvers = {
  health: () => ({
    status: 'OK',
    timestamp: new Date(),
    services: {
      graphql: 'running',
      database: 'connected',
      redis: 'connected',
      videoGeneration: 'available',
      streaming: 'ready',
    },
    uptime: Math.floor(process.uptime()),
  }),

  version: () => '2.0.0',

  videos: async (_, { filter, limit = 20, offset = 0 }) => {
    const { items, totalCount } = await listVideos(filter || {}, limit, offset);
    return {
      edges: items.map((v) => ({ node: v, cursor: v.videoId })),
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
        startCursor: items[0]?.videoId,
        endCursor: items[items.length - 1]?.videoId,
      },
      totalCount,
    };
  },

  video: async (_, { id }) => {
    const video = await getVideoById(id);
    if (video) {
      await incrementViews(id);
      video.views = (video.views || 0) + 1;
    }
    return video;
  },

  myVideos: async (_, __, { user }) => {
    if (!user) throw new Error('Not authenticated');
    const { items } = await listVideos({ userId: user.id }, 100, 0);
    return items;
  },

  trendingVideos: async (_, { limit = 10 }) => {
    return listTrendingVideos(limit);
  },

  users: async (_, { limit = 20, offset = 0 }) => {
    return listUsers(limit, offset);
  },

  user: async (_, { id }) => {
    return getUserById(id);
  },

  me: async (_, __, { user }) => {
    if (!user) return null;
    return getUserById(user.id);
  },

  playlists: async (_, { userId, limit = 20 }) => {
    return listPlaylists({ userId, limit });
  },

  playlist: async (_, { id }) => {
    return getPlaylistById(id);
  },

  myPlaylists: async (_, __, { user }) => {
    if (!user) throw new Error('Not authenticated');
    return listPlaylists({ userId: user.id, limit: 50 });
  },
};

export default resolvers;
