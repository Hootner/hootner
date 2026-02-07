// Express Routes Configuration
import express from 'express';
import UserController from './controllers/UserController.js';
import VideoController from './controllers/VideoController.js';
import CommentController from './controllers/CommentController.js';
import PaymentController from './controllers/PaymentController.js';
import PlaylistController from './controllers/PlaylistController.js';
import SubscriptionController from './controllers/SubscriptionController.js';

const router = express.Router();

// User routes
router.post('/users/register', UserController.register);
router.post('/users/login', UserController.login);
router.post('/users/logout', UserController.logout);
router.get('/users/me', UserController.getMe);
router.get('/users/:id', UserController.getUserById);
router.put('/users/me', UserController.updateProfile);
router.post('/users/password', UserController.changePassword);
router.post('/users/verify', UserController.verifyUser);
router.delete('/users/:id', UserController.deleteUser);

// Video routes
router.post('/videos', VideoController.uploadVideo);
router.get('/videos', VideoController.getVideos);
router.get('/videos/trending', VideoController.getTrendingVideos);
router.get('/videos/:id', VideoController.getVideoById);
router.get('/videos/user/:userId', VideoController.getUserVideos);
router.put('/videos/:id', VideoController.updateVideo);
router.delete('/videos/:id', VideoController.deleteVideo);
router.post('/videos/:id/like', VideoController.likeVideo);
router.post('/videos/:id/publish', VideoController.publishVideo);

// Comment routes
router.post('/comments', CommentController.createComment);
router.get('/comments/video/:videoId', CommentController.getVideoComments);
router.get('/comments/:id/replies', CommentController.getCommentReplies);
router.put('/comments/:id', CommentController.updateComment);
router.delete('/comments/:id', CommentController.deleteComment);
router.post('/comments/:id/like', CommentController.likeComment);
router.post('/comments/:id/pin', CommentController.pinComment);

// Payment routes
router.post('/payments', PaymentController.createPayment);
router.get('/payments', PaymentController.getPayments);
router.get('/payments/:id', PaymentController.getPaymentById);
router.post('/payments/:id/refund', PaymentController.refundPayment);
router.post('/payments/webhook', PaymentController.handleWebhook);

// Playlist routes
router.post('/playlists', PlaylistController.createPlaylist);
router.get('/playlists', PlaylistController.getPlaylists);
router.get('/playlists/:id', PlaylistController.getPlaylistById);
router.get('/playlists/user/:userId', PlaylistController.getUserPlaylists);
router.put('/playlists/:id', PlaylistController.updatePlaylist);
router.delete('/playlists/:id', PlaylistController.deletePlaylist);
router.post('/playlists/:id/videos', PlaylistController.addVideoToPlaylist);
router.delete('/playlists/:id/videos/:videoId', PlaylistController.removeVideoFromPlaylist);
router.put('/playlists/:id/reorder', PlaylistController.reorderPlaylist);

// Subscription routes
router.post('/subscriptions', SubscriptionController.createSubscription);
router.get('/subscriptions/me', SubscriptionController.getMySubscription);
router.post('/subscriptions/cancel', SubscriptionController.cancelSubscription);
router.post('/subscriptions/reactivate', SubscriptionController.reactivateSubscription);
router.get('/subscriptions/status', SubscriptionController.getSubscriptionStatus);

export default router;
