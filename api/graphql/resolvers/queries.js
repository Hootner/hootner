const Video = require('../models/Video');
const User = require('../models/User');

module.exports = {
  health: () => ({
    status: 'OK',
    timestamp: new Date(),
    services: {
      graphql: 'running',
      database: 'connected',
      redis: 'connected',
      videoGeneration: 'available',
      streaming: 'ready'
    },
    uptime: Math.floor(process.uptime())
  }),

  version: () => '2.0.0',

  videos: async (_, { filter, limit = 20, offset = 0 }) => {
    const query = {};
    if (filter?.status) query.status = filter.status;
    if (filter?.visibility) query.visibility = filter.visibility;
    if (filter?.userId) query.userId = filter.userId;
    if (filter?.search) {
      query.$or = [
        { title: { $regex: filter.search, $options: 'i' } },
        { description: { $regex: filter.search, $options: 'i' } }
      ];
    }

    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('userId');

    const totalCount = await Video.countDocuments(query);

    return {
      edges: videos.map(v => ({ node: v, cursor: v._id.toString() })),
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
        startCursor: videos[0]?._id.toString(),
        endCursor: videos[videos.length - 1]?._id.toString()
      },
      totalCount
    };
  },

  video: async (_, { id }) => {
    const video = await Video.findById(id).populate('userId');
    if (video) {
      video.views += 1;
      await video.save();
    }
    return video;
  },

  myVideos: async (_, __, { user }) => {
    if (!user) throw new Error('Not authenticated');
    return Video.find({ userId: user.id }).sort({ createdAt: -1 }).populate('userId');
  },

  trendingVideos: async (_, { limit = 10 }) => {
    return Video.find({ visibility: 'PUBLIC', status: 'READY' })
      .sort({ views: -1, likes: -1 })
      .limit(limit)
      .populate('userId');
  },

  users: async (_, { limit = 20, offset = 0 }) => {
    return User.find().skip(offset).limit(limit);
  },

  user: async (_, { id }) => {
    return User.findById(id);
  },

  me: async (_, __, { user }) => {
    if (!user) return null;
    return User.findById(user.id);
  }
};
