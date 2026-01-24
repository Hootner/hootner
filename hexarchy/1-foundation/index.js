// Layer 1 Foundation - Central Export

// Models
export { User } from './models/User.js';
export { Video } from './models/Video.js';
export { Comment } from './models/Comment.js';
export { Playlist } from './models/Playlist.js';
export { Subscription } from './models/Subscription.js';
export { Payment } from './models/Payment.js';
export { Notification } from './models/Notification.js';
export { Activity } from './models/Activity.js';
export { Analytics } from './models/Analytics.js';

// Repositories
export { BaseRepository } from './repositories/BaseRepository.js';
export { UserRepository } from './repositories/UserRepository.js';
export { VideoRepository } from './repositories/VideoRepository.js';
export { CommentRepository } from './repositories/CommentRepository.js';
export { PlaylistRepository } from './repositories/PlaylistRepository.js';
export { SubscriptionRepository } from './repositories/SubscriptionRepository.js';
export { PaymentRepository } from './repositories/PaymentRepository.js';
export { NotificationRepository } from './repositories/NotificationRepository.js';
export { ActivityRepository } from './repositories/ActivityRepository.js';

// Services
export { UserService } from './services/UserService.js';
export { VideoService } from './services/VideoService.js';
export { AuthService } from './services/AuthService.js';
export { PaymentService } from './services/PaymentService.js';
export { SubscriptionService } from './services/SubscriptionService.js';
export { CommentService } from './services/CommentService.js';
export { PlaylistService } from './services/PlaylistService.js';
export { NotificationService } from './services/NotificationService.js';
export { AnalyticsService } from './services/AnalyticsService.js';

// Value Objects
export { Email } from './value-objects/Email.js';
export { Username } from './value-objects/Username.js';
export { Money } from './value-objects/Money.js';
export { VideoMetadata } from './value-objects/VideoMetadata.js';
export { DateRange } from './value-objects/DateRange.js';
export { Address } from './value-objects/Address.js';

// Domain Events
export * from './events/UserEvents.js';
export * from './events/VideoEvents.js';
export * from './events/PaymentEvents.js';

// Validators
export { UserValidator } from './validators/UserValidator.js';
export { VideoValidator } from './validators/VideoValidator.js';
export { PaymentValidator } from './validators/PaymentValidator.js';
export { ContentPolicyValidator } from './validators/ContentPolicyValidator.js';
export { BusinessRulesValidator } from './validators/BusinessRulesValidator.js';

export default {
  // Models
  User,
  Video,
  Comment,
  Playlist,
  Subscription,
  Payment,
  Notification,
  Activity,
  Analytics,

  // Repositories
  BaseRepository,
  UserRepository,
  VideoRepository,
  CommentRepository,
  PlaylistRepository,
  SubscriptionRepository,
  PaymentRepository,
  NotificationRepository,
  ActivityRepository,

  // Services
  UserService,
  VideoService,
  AuthService,
  PaymentService,
  SubscriptionService,
  CommentService,
  PlaylistService,
  NotificationService,
  AnalyticsService,

  // Value Objects
  Email,
  Username,
  Money,
  VideoMetadata,
  DateRange,
  Address,

  // Validators
  UserValidator,
  VideoValidator,
  PaymentValidator,
  ContentPolicyValidator,
  BusinessRulesValidator
};
