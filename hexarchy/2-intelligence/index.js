// Layer 2 Intelligence - Central Export
// AI, analytics, and machine learning components

// AI Services
export { default as RecommendationEngine } from './ai/RecommendationEngine.js';
export { default as ContentModerationService } from './ai/ContentModerationService.js';
export { default as SearchEngine } from './ai/SearchEngine.js';

// Analytics Services
export { default as VideoAnalyticsService } from './analytics/VideoAnalyticsService.js';
export { default as UserBehaviorAnalytics } from './analytics/UserBehaviorAnalytics.js';
export { default as ABTestingService } from './analytics/ABTestingService.js';

// Machine Learning
export { default as MLModelService } from './ml/MLModelService.js';

/**
 * Layer 2 - Intelligence
 *
 * Purpose: AI, analytics, and machine learning capabilities
 *
 * Components:
 * - AI Services: Recommendations, content moderation, intelligent search
 * - Analytics: Video analytics, user behavior analysis, A/B testing
 * - Machine Learning: Performance prediction, content classification, sentiment analysis
 *
 * Layer Dependencies:
 * - Depends on: Layer 1 (Foundation) for domain services and repositories
 * - Depends on: Layer 0 (Infrastructure) for logging and data access
 * - Provides: Intelligence capabilities for Layer 3 (Communication) and Layer 4 (Interface)
 */
