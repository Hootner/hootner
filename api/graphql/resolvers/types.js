import { listVideos } from '../models/Video.js';
import { getUserById } from '../models/User.js';

const typeResolvers = {
  User: {
    videos: async (parent) => {
      const userId = parent.id || parent.userId;
      const { items } = await listVideos({ userId }, 50, 0);
      return items;
    },
  },
  Video: {
    user: async (parent) => getUserById(parent.userId),
    likes: (parent) =>
      Array.isArray(parent.likes) ? parent.likes.length : parent.likes || 0,
  },
};

export default typeResolvers;
