// GraphQL Mutation Resolvers
import { AuthService } from '../../1-foundation/services/AuthService.js';
import { VideoService } from '../../1-foundation/services/VideoService.js';
import { CommentService } from '../../1-foundation/services/CommentService.js';
import { PlaylistService } from '../../1-foundation/services/PlaylistService.js';
import { PaymentService } from '../../1-foundation/services/PaymentService.js';
import { SubscriptionService } from '../../1-foundation/services/SubscriptionService.js';
import { NotificationService } from '../../1-foundation/services/NotificationService.js';

const authService = new AuthService();
const videoService = new VideoService();
const commentService = new CommentService();
const playlistService = new PlaylistService();
const paymentService = new PaymentService();
const subscriptionService = new SubscriptionService();
const notificationService = new NotificationService();

export const Mutation = {
  // Auth mutations
  register: async (_, { input }, { req }) => {
    const { user, token } = await authService.register(
      input,
      req.ip,
      req.get('user-agent')
    );
    return { user, token };
  },

  login: async (_, { email, password }, { req }) => {
    const { user, token } = await authService.login(
      email,
      password,
      req.ip,
      req.get('user-agent')
    );
    return { user, token };
  },

  logout: async (_, __, { user, req }) => {
    if (!user) throw new Error('Not authenticated');
    await authService.logout(user.id, req.ip, req.get('user-agent'));
    return { success: true };
  },

  // Video mutations
  uploadVideo: async (_, { input }, { user, req }) => {
    if (!user) throw new Error('Not authenticated');
    return await videoService.createVideo(input, user.id, req.ip, req.get('user-agent'));
  },

  updateVideo: async (_, { id, input }, { user, req }) => {
    if (!user) throw new Error('Not authenticated');
    return await videoService.updateVideo(id, input, user.id, req.ip, req.get('user-agent'));
  },

  deleteVideo: async (_, { id }, { user, req }) => {
    if (!user) throw new Error('Not authenticated');
    await videoService.deleteVideo(id, user.id, req.ip, req.get('user-agent'));
    return { success: true };
  },

  likeVideo: async (_, { id }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    await videoService.likeVideo(id, user.id);
    return { success: true };
  },

  publishVideo: async (_, { id }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    await videoService.publishVideo(id, user.id);
    return { success: true };
  },

  // Comment mutations
  createComment: async (_, { input }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    return await commentService.createComment(input, user.id);
  },

  updateComment: async (_, { id, text }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    return await commentService.updateComment(id, text, user.id);
  },

  deleteComment: async (_, { id }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    const isAdmin = ['admin', 'super_admin'].includes(user.role);
    await commentService.deleteComment(id, user.id, isAdmin);
    return { success: true };
  },

  likeComment: async (_, { id }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    await commentService.likeComment(id);
    return { success: true };
  },

  // Playlist mutations
  createPlaylist: async (_, { input }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    return await playlistService.createPlaylist(input, user.id);
  },

  updatePlaylist: async (_, { id, input }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    return await playlistService.updatePlaylist(id, input, user.id);
  },

  deletePlaylist: async (_, { id }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    await playlistService.deletePlaylist(id, user.id);
    return { success: true };
  },

  addVideoToPlaylist: async (_, { playlistId, videoId }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    await playlistService.addVideo(playlistId, videoId, user.id);
    return { success: true };
  },

  removeVideoFromPlaylist: async (_, { playlistId, videoId }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    await playlistService.removeVideo(playlistId, videoId, user.id);
    return { success: true };
  },

  // Payment mutations
  createPayment: async (_, { input }, { user, req }) => {
    if (!user) throw new Error('Not authenticated');
    return await paymentService.createPayment(
      user.id,
      input.amount,
      input.currency,
      input.paymentMethodId,
      input.description,
      input.metadata
    );
  },

  // Subscription mutations
  createSubscription: async (_, { plan, paymentMethodId, trialDays }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    return await subscriptionService.createSubscription(user.id, plan, paymentMethodId, trialDays);
  },

  cancelSubscription: async (_, __, { user }) => {
    if (!user) throw new Error('Not authenticated');
    const subscription = await subscriptionService.getSubscriptionByUser(user.id);
    await subscriptionService.cancelSubscription(subscription.id, user.id);
    return { success: true };
  },

  // Notification mutations
  markNotificationRead: async (_, { id }, { user }) => {
    if (!user) throw new Error('Not authenticated');
    await notificationService.markAsRead(id);
    return { success: true };
  },

  markAllNotificationsRead: async (_, __, { user }) => {
    if (!user) throw new Error('Not authenticated');
    await notificationService.markAllAsRead(user.id);
    return { success: true };
  }
};

export default Mutation;
