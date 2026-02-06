// GraphQL User Type Resolver
export const UserTypeResolver = {
  // Resolve user's videos
  videos: async (parent, args, context) => {
    const { VideoService } = context.services;
    return await VideoService.getUserVideos(parent.id, args.limit || 10);
  },

  // Resolve user's playlists
  playlists: async (parent, args, context) => {
    const { PlaylistService } = context.services;
    return await PlaylistService.getUserPlaylists(parent.id);
  },

  // Resolve user's subscriptions
  subscription: async (parent, args, context) => {
    const { SubscriptionService } = context.services;
    return await SubscriptionService.getUserSubscription(parent.id);
  },

  // Resolve user's followers
  followers: async (parent, args, context) => {
    const { UserService } = context.services;
    return await UserService.getFollowers(parent.id, args.limit || 20);
  },

  // Resolve user's following
  following: async (parent, args, context) => {
    const { UserService } = context.services;
    return await UserService.getFollowing(parent.id, args.limit || 20);
  },

  // Resolve follower count
  followerCount: async (parent, args, context) => {
    const { UserService } = context.services;
    return await UserService.getFollowerCount(parent.id);
  },

  // Resolve following count
  followingCount: async (parent, args, context) => {
    const { UserService } = context.services;
    return await UserService.getFollowingCount(parent.id);
  },

  // Check if current user follows this user
  isFollowing: async (parent, args, context) => {
    if (!context.user) return false;
    const { UserService } = context.services;
    return await UserService.isFollowing(context.user.id, parent.id);
  },

  // Get full profile (includes private fields if owner)
  fullProfile: async (parent, args, context) => {
    if (!context.user || context.user.id !== parent.id) {
      return null;
    }
    return parent;
  }
};

export default UserTypeResolver;
