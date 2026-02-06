// Layer 3 Communication - Central Export
// External interfaces: REST API, GraphQL, WebSocket, External Services

// REST API Controllers
export { default as UserController } from './controllers/UserController.js';
export { default as VideoController } from './controllers/VideoController.js';
export { default as CommentController } from './controllers/CommentController.js';
export { default as PaymentController } from './controllers/PaymentController.js';
export { default as PlaylistController } from './controllers/PlaylistController.js';
export { default as SubscriptionController } from './controllers/SubscriptionController.js';

// GraphQL Resolvers
export { default as QueryResolvers } from './graphql/QueryResolvers.js';
export { default as MutationResolvers } from './graphql/MutationResolvers.js';
export { default as SubscriptionResolvers } from './graphql/SubscriptionResolvers.js';
export { default as UserTypeResolver } from './graphql/UserTypeResolver.js';
export { default as VideoTypeResolver } from './graphql/VideoTypeResolver.js';
export { default as PlaylistTypeResolver } from './graphql/PlaylistTypeResolver.js';

// GraphQL Schema
export { default as typeDefs } from './schema.js';

// WebSocket Handlers
export { default as ChatHandler } from './websocket/ChatHandler.js';
export { default as VideoSyncHandler } from './websocket/VideoSyncHandler.js';
export { default as NotificationHandler } from './websocket/NotificationHandler.js';
export { default as PresenceHandler } from './websocket/PresenceHandler.js';

// External Service Clients
export { default as S3Client } from './clients/S3Client.js';
export { default as StripeClient } from './clients/StripeClient.js';
export { default as FirebaseClient } from './clients/FirebaseClient.js';
export { default as EmailClient } from './clients/EmailClient.js';
export { default as CDNClient } from './clients/CDNClient.js';

// Message Queue
export { SQSConsumer, videoProcessingConsumer, emailConsumer, notificationConsumer } from './queue/SQSConsumer.js';
export { default as SQSProducer } from './queue/SQSProducer.js';
export { default as EventPublisher } from './queue/EventPublisher.js';
export { default as EventSubscriber } from './queue/EventSubscriber.js';

// Third-Party Integrations
export { default as GoogleAnalyticsAPI } from './integrations/GoogleAnalyticsAPI.js';
export { default as SocialMediaAPI } from './integrations/SocialMediaAPI.js';

// Routes
export { default as routes } from './routes.js';

/**
 * Layer 3 - Communication
 *
 * Purpose: External interfaces connecting the domain to the outside world
 *
 * Components:
 * - REST API Controllers: HTTP endpoints for mobile/web apps
 * - GraphQL Resolvers: Flexible data fetching with real-time subscriptions
 * - WebSocket Handlers: Real-time features (chat, watch parties, notifications, presence)
 * - External Clients: AWS S3, Stripe, Firebase, Email, CDN
 * - Message Queues: Background job processing (SQS, EventBridge)
 * - Third-Party APIs: Google Analytics, social media integrations
 *
 * Layer Dependencies:
 * - Depends on: Layer 1 (Foundation) for business logic
 * - Uses: Layer 0 (Infrastructure) for auth, logging, AWS, etc.
 * - Provides: External interfaces for UI and external systems
 */
