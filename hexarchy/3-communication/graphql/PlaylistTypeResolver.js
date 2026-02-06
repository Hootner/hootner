// GraphQL Playlist Type Resolver
export const PlaylistTypeResolver = {
  // Resolve playlist creator
  creator: async (parent, args, context) => {
    const { UserService } = context.services;
    return await UserService.getUserById(parent.userId);
  },

  // Resolve playlist videos
  videos: async (parent, args, context) => {
    const { PlaylistService, VideoService } = context.services;
    const videoIds = parent.videoIds || [];

    // Get videos in order
    const videos = [];
    for (const videoId of videoIds) {
      const video = await VideoService.getVideoById(videoId);
      if (video) videos.push(video);
    }

    return videos;
  },

  // Get video count
  videoCount: async (parent, args, context) => {
    return (parent.videoIds || []).length;
  },

  // Get total duration
  totalDuration: async (parent, args, context) => {
    const { VideoService } = context.services;
    const videoIds = parent.videoIds || [];

    let total = 0;
    for (const videoId of videoIds) {
      const video = await VideoService.getVideoById(videoId);
      if (video && video.duration) {
        total += video.duration;
      }
    }

    return total;
  },

  // Check if user can edit
  canEdit: async (parent, args, context) => {
    if (!context.user) return false;
    return context.user.id === parent.userId || context.user.role === 'admin';
  },

  // Get thumbnail (first video's thumbnail)
  thumbnail: async (parent, args, context) => {
    if (parent.thumbnail) return parent.thumbnail;

    const { VideoService } = context.services;
    const videoIds = parent.videoIds || [];

    if (videoIds.length > 0) {
      const firstVideo = await VideoService.getVideoById(videoIds[0]);
      return firstVideo?.thumbnail || null;
    }

    return null;
  }
};

export default PlaylistTypeResolver;
