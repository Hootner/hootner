# Layer 3 - Communication

External interface layer connecting the internal domain to the outside world.

## 📁 Structure

```
3-communication/
├── controllers/              # REST API Controllers
│   ├── UserController.js     # User management (9 endpoints)
│   ├── VideoController.js    # Video management (9 endpoints)
│   ├── CommentController.js  # Comment management (6 endpoints)
│   ├── PaymentController.js  # Payment processing (4 endpoints + webhook)
│   ├── PlaylistController.js # Playlist management (9 endpoints)
│   └── SubscriptionController.js # Subscription management (5 endpoints)
├── graphql/                  # GraphQL Resolvers
│   ├── QueryResolvers.js     # 15+ queries
│   ├── MutationResolvers.js  # 20+ mutations
│   ├── SubscriptionResolvers.js # 6 real-time subscriptions
│   ├── UserTypeResolver.js   # User field resolvers
│   ├── VideoTypeResolver.js  # Video field resolvers
│   └── PlaylistTypeResolver.js # Playlist field resolvers
├── websocket/                # WebSocket Handlers
│   ├── ChatHandler.js        # Real-time chat
│   ├── VideoSyncHandler.js   # Watch party synchronization
│   ├── NotificationHandler.js # Push notification delivery
│   └── PresenceHandler.js    # Online/offline status
├── clients/                  # External Service Clients
│   ├── S3Client.js           # AWS S3 operations
│   ├── StripeClient.js       # Payment processing
│   ├── FirebaseClient.js     # Push notifications
│   ├── EmailClient.js        # SES email service
│   └── CDNClient.js          # CloudFront operations
├── queue/                    # Message Queue Integration
│   ├── SQSConsumer.js        # Background job processor
│   ├── SQSProducer.js        # Job queue
│   ├── EventPublisher.js     # Domain event broadcasting
│   └── EventSubscriber.js    # External event handling
├── integrations/             # Third-Party APIs
│   ├── GoogleAnalyticsAPI.js # Analytics tracking
│   └── SocialMediaAPI.js     # Social sharing
├── routes.js                 # Express route configuration
├── schema.js                 # GraphQL schema definition
├── index.js                  # Central export
└── README.md                 # This file
```

## 🎯 Purpose

Layer 3 provides all external interfaces for the platform:
- **REST API**: HTTP endpoints for mobile/web applications
- **GraphQL**: Flexible data fetching with real-time subscriptions
- **WebSocket**: Real-time features (chat, watch parties, notifications, presence)
- **External Clients**: AWS services, payment processing, email, CDN
- **Message Queues**: Background job processing and event handling
- **Third-Party APIs**: Analytics, social media integrations

## 🔌 REST API Controllers

### UserController (9 endpoints)
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `GET /api/users/me` - Get authenticated user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/me` - Update profile
- `POST /api/users/password` - Change password
- `POST /api/users/verify` - Verify user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### VideoController (9 endpoints)
- `POST /api/videos` - Upload video
- `GET /api/videos` - List videos
- `GET /api/videos/trending` - Get trending videos
- `GET /api/videos/:id` - Get video by ID
- `GET /api/videos/user/:userId` - Get user's videos
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video
- `POST /api/videos/:id/like` - Like video
- `POST /api/videos/:id/publish` - Publish video

### CommentController (6 endpoints)
- `POST /api/comments` - Create comment
- `GET /api/comments/video/:videoId` - Get video comments
- `GET /api/comments/:id/replies` - Get threaded replies
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like comment

### PaymentController (4 endpoints + webhook)
- `POST /api/payments` - Create payment
- `GET /api/payments` - List payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments/:id/refund` - Refund payment
- `POST /api/payments/webhook` - Stripe webhook

### PlaylistController (9 endpoints)
- `POST /api/playlists` - Create playlist
- `GET /api/playlists` - List playlists
- `GET /api/playlists/:id` - Get playlist by ID
- `GET /api/playlists/user/:userId` - Get user playlists
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/videos` - Add video to playlist
- `DELETE /api/playlists/:id/videos/:videoId` - Remove video
- `PUT /api/playlists/:id/reorder` - Reorder playlist

### SubscriptionController (5 endpoints)
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/me` - Get subscription
- `POST /api/subscriptions/cancel` - Cancel subscription
- `POST /api/subscriptions/reactivate` - Reactivate subscription
- `GET /api/subscriptions/status` - Check subscription status

## 📊 GraphQL API

### Queries (15+)
- User: `me`, `user(id)`
- Video: `video(id)`, `videos(limit, category)`, `trendingVideos`, `userVideos`
- Comment: `comment(id)`, `videoComments`, `commentReplies`
- Playlist: `playlist(id)`, `playlists`, `userPlaylists`
- Notification: `notifications`, `unreadNotifications`, `unreadCount`

### Mutations (20+)
- Auth: `register`, `login`, `logout`
- Video: `uploadVideo`, `updateVideo`, `deleteVideo`, `likeVideo`, `publishVideo`
- Comment: `createComment`, `updateComment`, `deleteComment`, `likeComment`
- Playlist: `createPlaylist`, `updatePlaylist`, `deletePlaylist`, `addVideoToPlaylist`, `removeVideoFromPlaylist`
- Payment: `createPayment`
- Subscription: `createSubscription`, `cancelSubscription`
- Notification: `markNotificationRead`, `markAllNotificationsRead`

### Subscriptions (6 real-time)
- `videoUploaded` - New video uploads
- `videoProcessed(videoId)` - Video processing updates
- `commentAdded(videoId)` - New comments
- `notificationReceived` - User notifications
- `userActivity(userId)` - User activity feed
- `likeReceived` - Likes on user's content

## 🔌 WebSocket Handlers

### ChatHandler
- Real-time messaging
- Room management (join/leave)
- Typing indicators
- User presence in chat rooms

### VideoSyncHandler
- Watch party creation/joining
- Play/pause synchronization
- Seek synchronization
- Playback rate sync
- Watch party chat

### NotificationHandler
- Push notification delivery
- User registration for notifications
- Real-time notification updates

### PresenceHandler
- Online/offline status
- User status updates (online, away, busy)
- Heartbeat tracking
- Online user list

## 🌐 External Service Clients

### S3Client
- Video upload/download
- Thumbnail upload
- File deletion
- Presigned URL generation

### StripeClient
- Customer creation
- Payment intent creation
- Subscription management
- Refund processing
- Webhook verification

### FirebaseClient
- Push notification sending
- Topic subscription
- Multicast messaging
- ID token verification

### EmailClient
- Email sending via SES
- Templated emails
- Welcome emails
- Password reset emails
- Video processed notifications

### CDNClient
- Cache invalidation
- CDN URL generation
- Signed URL generation

## 📬 Message Queue

### SQSConsumer
- Video processing queue
- Email queue
- Notification queue
- Background job processing

### SQSProducer
- Queue video processing jobs
- Queue emails
- Queue notifications

### EventPublisher
- User events (registered, deleted)
- Video events (uploaded, processed)
- Payment events (received, refunded)

### EventSubscriber
- Handle domain events
- Trigger side effects (emails, notifications)

## 🔗 Third-Party Integrations

### GoogleAnalyticsAPI
- Page view tracking
- Event tracking
- Analytics reports
- Real-time data

### SocialMediaAPI
- Twitter sharing
- Facebook sharing
- LinkedIn sharing
- Social metrics

## 🏗️ Layer Dependencies

**Depends on:**
- Layer 1 (Foundation) - Business logic, domain models, services
- Layer 0 (Infrastructure) - Auth, logging, AWS, database

**Provides:**
- External interfaces for UI applications
- Integration points for external systems
- Real-time communication channels
- Background job processing
- Third-party service integrations

## 📚 Usage Examples

### REST API
```javascript
import { UserController, VideoController } from './hexarchy/3-communication/index.js';

app.post('/api/users/register', UserController.register);
app.get('/api/videos', VideoController.getVideos);
```

### GraphQL
```javascript
import { QueryResolvers, MutationResolvers, typeDefs } from './hexarchy/3-communication/index.js';

const resolvers = {
  Query: QueryResolvers,
  Mutation: MutationResolvers
};
```

### WebSocket
```javascript
import { ChatHandler, VideoSyncHandler } from './hexarchy/3-communication/index.js';

ChatHandler.initialize(io);
VideoSyncHandler.initialize(io);
```

### External Clients
```javascript
import { S3Client, StripeClient, EmailClient } from './hexarchy/3-communication/index.js';

await S3Client.uploadVideo(file);
await StripeClient.createPaymentIntent(amount, currency, customerId);
await EmailClient.sendWelcomeEmail(email, username);
```

### Message Queue
```javascript
import { SQSProducer, videoProcessingConsumer } from './hexarchy/3-communication/index.js';

await SQSProducer.queueVideoProcessing(videoId, userId, inputPath, outputPath);
videoProcessingConsumer.start();
```

## ✅ Complete

Layer 3 (Communication) is **100% complete** with:
- ✅ 6 REST API controllers (35+ endpoints)
- ✅ 6 GraphQL resolvers (15+ queries, 20+ mutations, 6 subscriptions)
- ✅ 4 WebSocket handlers (chat, video sync, notifications, presence)
- ✅ 5 external service clients (S3, Stripe, Firebase, Email, CDN)
- ✅ 4 message queue components (SQS consumer/producer, event pub/sub)
- ✅ 2 third-party API integrations (Google Analytics, social media)
- ✅ Route configuration (Express routes)
- ✅ GraphQL schema definition
- ✅ Central export file

**Total: 30+ files** providing comprehensive external interfaces for the Hootner video platform.
