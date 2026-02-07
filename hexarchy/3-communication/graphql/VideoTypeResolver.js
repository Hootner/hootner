// GraphQL Video Type Resolver
export const VideoTypeResolver = {
  // Resolve video author
  author: async (parent, args, context) => {
    const { UserService } = context.services;
    return await UserService.getUserById(parent.userId);
  },

  // Resolve video comments
  comments: async (parent, args, context) => {
    const { CommentService } = context.services;
    return await CommentService.getVideoComments(parent.id, args.limit || 10);
  },

  // Resolve comment count
  commentCount: async (parent, args, context) => {
    const { CommentService } = context.services;
    return await CommentService.getCommentCount(parent.id);
  },

  // Check if user liked video
  isLiked: async (parent, args, context) => {
    if (!context.user) return false;
    const { VideoService } = context.services;
    return await VideoService.hasUserLiked(parent.id, context.user.id);
  },

  // Get related videos
  relatedVideos: async (parent, args, context) => {
    const { VideoService } = context.services;
    return await VideoService.getRelatedVideos(parent.id, args.limit || 5);
  },

  // Get video URL (CDN or S3)
  url: async (parent, args, context) => {
    const { CDNClient } = context.clients;
    return CDNClient.getCDNUrl(parent.path);
  },

  // Get thumbnail URL
  thumbnailUrl: async (parent, args, context) => {
    const { CDNClient } = context.clients;
    return parent.thumbnail ? CDNClient.getCDNUrl(parent.thumbnail) : null;
  },

  // Check if user can edit
  canEdit: async (parent, args, context) => {
    if (!context.user) return false;
    return context.user.id === parent.userId || context.user.role === 'admin';
  },

  // Get analytics
  analytics: async (parent, args, context) => {
    if (!context.user || (context.user.id !== parent.userId && context.user.role !== 'admin')) {
      return null;
    }
    const { AnalyticsService } = context.services;
    return await AnalyticsService.getVideoAnalytics(parent.id);
  }
};

export default VideoTypeResolver;
