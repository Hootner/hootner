const Video = require('../models/Video');
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

module.exports = {
  // Get all videos
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

  // Get single video
  video: async (_, { id }) => {
    const video = await Video.findById(id).populate('userId');
    if (video) {
      video.views += 1;
      await video.save();
    }
    return video;
  },

  // Get user's videos
  myVideos: async (_, __, { user }) => {
    if (!user) throw new Error('Not authenticated');
    return Video.find({ userId: user.id }).sort({ createdAt: -1 });
  },

  // Add like
  likeVideo: async (_, { videoId }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    
    const video = await Video.findById(videoId);
    if (!video) throw new Error('Video not found');

    const likeIndex = video.likes.indexOf(user.id);
    if (likeIndex > -1) {
      video.likes.splice(likeIndex, 1);
    } else {
      video.likes.push(user.id);
    }

    await video.save();
    pubsub.publish('VIDEO_LIKED', { videoLiked: video });

    return {
      success: true,
      message: likeIndex > -1 ? 'Like removed' : 'Video liked',
      video
    };
  },

  // Add comment
  addComment: async (_, { videoId, text }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    
    const video = await Video.findById(videoId);
    if (!video) throw new Error('Video not found');

    video.comments.push({
      userId: user.id,
      text,
      createdAt: new Date()
    });

    await video.save();
    pubsub.publish('COMMENT_ADDED', { commentAdded: { video, comment: video.comments[video.comments.length - 1] } });

    return {
      success: true,
      message: 'Comment added',
      video
    };
  },

  // Delete comment
  deleteComment: async (_, { videoId, commentId }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    
    const video = await Video.findById(videoId);
    if (!video) throw new Error('Video not found');

    const comment = video.comments.id(commentId);
    if (!comment) throw new Error('Comment not found');
    if (comment.userId.toString() !== user.id) throw new Error('Not authorized');

    comment.remove();
    await video.save();

    return {
      success: true,
      message: 'Comment deleted',
      video
    };
  }
};
