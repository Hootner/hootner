# Layer 2 - Intelligence

AI, analytics, and machine learning capabilities for the Hootner video platform.

## 📁 Structure

```
2-intelligence/
├── ai/                       # AI Services
│   ├── RecommendationEngine.js       # Personalized video recommendations
│   ├── ContentModerationService.js   # Content moderation & filtering
│   └── SearchEngine.js               # Intelligent search with ranking
├── analytics/                # Analytics Services
│   ├── VideoAnalyticsService.js      # Video performance analytics
│   ├── UserBehaviorAnalytics.js      # User behavior patterns
│   └── ABTestingService.js           # A/B testing framework
├── ml/                       # Machine Learning
│   └── MLModelService.js             # ML model service & predictions
├── index.js                  # Central export
└── README.md                 # This file
```

## 🎯 Purpose

Layer 2 provides intelligence and analytics:
- **AI Services**: Recommendations, content moderation, intelligent search
- **Analytics**: Video performance, user behavior, A/B testing
- **Machine Learning**: Performance prediction, content classification, sentiment analysis

## 🤖 AI Services

### RecommendationEngine
Personalized video recommendations:
- `getPersonalizedRecommendations(userId, limit)` - Personalized video feed based on watch history and preferences
- `getSimilarVideos(videoId, limit)` - Find similar videos by category, author, duration
- `getTrendingVideos(limit)` - Trending videos with engagement-weighted scoring
- `extractUserPreferences(watchHistory, likedVideos)` - Extract user preferences from behavior
- `scoreVideos(videos, preferences, watchHistory)` - Score and rank videos by relevance
- `calculateScore(video, preferences)` - Calculate recommendation score (category match, popularity, engagement, recency)

**Scoring Algorithm:**
- Category match: +10 points
- Popularity: log(views + 1) * 2
- Engagement ratio: (likes/views) * 5
- Recency boost: +5 (< 7 days), +2 (< 30 days)

### ContentModerationService
Content moderation and filtering:
- `moderateVideo(video)` - Moderate video title and description
- `moderateComment(comment)` - Moderate comment text for toxicity and spam
- `checkText(text)` - Check for profanity, hate speech, explicit content
- `checkProfanity(text)` - Profanity filter
- `checkHateSpeech(text)` - Hate speech detection
- `checkExplicitContent(text)` - Explicit content detection
- `checkSpam(text)` - Spam detection (links, caps, repeated chars, emojis, spam phrases)
- `batchModerate(items, type)` - Batch moderate multiple items

**Spam Detection Criteria:**
- Excessive links (>2): +0.3 score
- Excessive caps (>50%): +0.2 score
- Repeated characters (4+): +0.2 score
- Excessive emojis (>10): +0.2 score
- Spam phrases: +0.3 score
- Threshold: 0.8

### SearchEngine
Intelligent search with ranking:
- `searchVideos(query, filters, userId)` - Search with intelligent ranking
- `rankResults(videos, query, userId)` - Rank search results by relevance
- `calculateRelevance(video, queryTerms, userId)` - Calculate relevance score
- `getSuggestions(prefix, limit)` - Autocomplete suggestions
- `advancedSearch(query, filters)` - Advanced search with filters (duration, date, views, sort)
- `filterByDuration(videos, duration)` - Filter by short/medium/long
- `filterByDate(videos, period)` - Filter by today/week/month/year
- `sortResults(videos, sortBy)` - Sort by date, views, rating

**Relevance Scoring:**
- Title match: exact (*10), starts with (*3), contains (*1)
- Description match: same multipliers * 5
- Category match: +5 points
- Popularity: log(views + 1)
- Engagement: (likes + comments) / views * 3
- Recency boost: +2 (< 7 days)

## 📊 Analytics Services

### VideoAnalyticsService
Video performance analytics:
- `trackView(videoId, userId, metadata)` - Track video view with IP, user-agent, referrer
- `trackEngagement(videoId, userId, data)` - Track watch time, completion, percent watched
- `getVideoAnalytics(videoId, period)` - Comprehensive video analytics
  - Total views, unique views
  - Average watch time, completion rate
  - Engagement metrics (views, likes, comments, shares, engagement rate)
  - Demographics (countries, age groups, devices)
  - Timeline data (daily views, likes, comments)
- `getUserWatchHistory(userId, limit)` - User's watch history
- `getTrendingVideos(limit, period)` - Trending videos by trend score
- `trackActivity(userId, activityType, metadata)` - Track user activity

**Trend Score Calculation:**
```
trendScore = views + (likes * 10) + (comments * 5) + (shares * 15)
```

### UserBehaviorAnalytics
User behavior pattern analysis:
- `analyzeUserBehavior(userId, period)` - Comprehensive behavior analysis
  - Activity summary (views, likes, comments, shares, uploads)
  - Watch patterns (hourly/daily distribution, peak hours/days, session length)
  - Engagement level (Low/Medium/High based on interaction rate)
  - Preferences (top categories, top authors)
  - Session metrics (total sessions, avg length, activities per session)
- `getActivitySummary(activities)` - Activity counts by type
- `analyzeWatchPatterns(activities)` - Time-based viewing patterns
- `calculateEngagementLevel(activities)` - Engagement tier and rate
- `extractPreferences(activities)` - User preferences from behavior
- `analyzeSessionMetrics(activities)` - Session-based metrics (30-min gap threshold)
- `getCohortAnalysis(cohortStartDate, cohortEndDate)` - Cohort retention analysis (12-week tracking)

**Engagement Levels:**
- High: >20% interaction rate
- Medium: 10-20% interaction rate
- Low: <10% interaction rate

### ABTestingService
A/B testing framework:
- `createTest(testConfig)` - Create A/B test with variants, weights, metrics
- `assignVariant(userId, testId)` - Deterministic variant assignment (hash-based)
- `trackConversion(testId, userId, variantId, value)` - Track conversion events
- `getTestResults(testId)` - Get test results with conversion rates, winner, improvement
- `endTest(testId)` - End test and finalize results
- `getActiveTests()` - List active tests

**Test Configuration:**
```javascript
{
  name: 'Homepage Layout Test',
  variants: [
    { id: 'control', name: 'Original', weight: 50 },
    { id: 'variant-a', name: 'New Design', weight: 50 }
  ],
  targetMetric: 'ctr', // or 'engagement', 'conversion'
  startDate: '2026-01-23',
  endDate: '2026-02-23'
}
```

## 🧠 Machine Learning

### MLModelService
Machine learning model service:
- `loadModel(modelName, modelPath)` - Load ML model
- `predictVideoPerformance(videoMetadata)` - Predict video performance score (0-100)
  - Returns: performance score, expected views, confidence, recommendations
  - Factors: title length, description quality, category popularity, duration, thumbnail
- `estimateViews(performanceScore)` - Estimate expected view count
- `generateRecommendations(videoMetadata, score)` - Generate improvement suggestions
- `classifyContent(videoMetadata)` - Classify video content by category
- `extractTags(videoMetadata)` - Extract relevant tags/keywords
- `analyzeSentiment(text)` - Sentiment analysis (positive/negative/neutral)

**Performance Prediction Factors:**
- Title: 40-70 chars (+10), punctuation (+5)
- Description: >100 chars (+10)
- Category: Popular categories (+15)
- Duration: 8-12 min sweet spot (+10)
- Thumbnail: Present (+10)
- Base score: 50, max: 100

**Content Classification Categories:**
- Education, Gaming, Music, Entertainment, Technology, Sports

**Sentiment Scoring:**
- Positive words: +1 each
- Negative words: -1 each
- Positive: score > 2
- Negative: score < -2
- Neutral: -2 ≤ score ≤ 2

## 🏗️ Layer Dependencies

**Depends on:**
- Layer 1 (Foundation) - Domain services and repositories
- Layer 0 (Infrastructure) - Logging, data access

**Provides:**
- Intelligence capabilities for Layer 3 (Communication)
- Analytics insights for Layer 4 (Interface)
- ML predictions for content optimization

## 📚 Usage Examples

### Recommendations
```javascript
import { RecommendationEngine } from './hexarchy/2-intelligence/index.js';

const recommender = new RecommendationEngine(videoService, analyticsService);

// Personalized recommendations
const recommendations = await recommender.getPersonalizedRecommendations(userId, 10);

// Similar videos
const similar = await recommender.getSimilarVideos(videoId, 5);

// Trending
const trending = await recommender.getTrendingVideos(10);
```

### Content Moderation
```javascript
import { ContentModerationService } from './hexarchy/2-intelligence/index.js';

const moderator = new ContentModerationService();

// Moderate video
const videoResult = await moderator.moderateVideo(video);
if (!videoResult.approved) {
  console.log('Video flagged:', videoResult.flags);
}

// Moderate comment
const commentResult = await moderator.moderateComment(comment);
if (!commentResult.approved) {
  console.log('Comment blocked:', commentResult.flags);
}
```

### Search
```javascript
import { SearchEngine } from './hexarchy/2-intelligence/index.js';

const search = new SearchEngine(videoService, userService);

// Basic search
const results = await search.searchVideos('gaming tutorial', {}, userId);

// Advanced search
const filtered = await search.advancedSearch('coding', {
  category: 'Education',
  duration: 'medium', // 4-20 minutes
  uploadDate: 'week',
  sortBy: 'views'
});

// Autocomplete
const suggestions = await search.getSuggestions('gam', 5);
```

### Analytics
```javascript
import { VideoAnalyticsService, UserBehaviorAnalytics } from './hexarchy/2-intelligence/index.js';

const analytics = new VideoAnalyticsService(analyticsRepository);
const behavior = new UserBehaviorAnalytics(analyticsRepository);

// Track view
await analytics.trackView(videoId, userId, { ip, userAgent, referrer });

// Get video analytics
const stats = await analytics.getVideoAnalytics(videoId, '30d');
console.log('Views:', stats.totalViews);
console.log('Completion rate:', stats.completionRate);

// Analyze user behavior
const userStats = await behavior.analyzeUserBehavior(userId, '30d');
console.log('Engagement level:', userStats.engagementLevel.level);
console.log('Peak viewing hour:', userStats.watchPatterns.peakHour);
```

### A/B Testing
```javascript
import { ABTestingService } from './hexarchy/2-intelligence/index.js';

const abTest = new ABTestingService(analyticsRepository);

// Create test
const test = await abTest.createTest({
  name: 'Thumbnail Test',
  variants: [
    { id: 'control', name: 'Original', weight: 50 },
    { id: 'variant', name: 'New Design', weight: 50 }
  ],
  targetMetric: 'ctr',
  startDate: '2026-01-23',
  endDate: '2026-02-23'
});

// Assign variant
const variant = abTest.assignVariant(userId, test.id);

// Track conversion
await abTest.trackConversion(test.id, userId, variant.id);

// Get results
const results = await abTest.getTestResults(test.id);
console.log('Winner:', results.winner.name);
console.log('Improvement:', results.improvement + '%');
```

### Machine Learning
```javascript
import { MLModelService } from './hexarchy/2-intelligence/index.js';

const mlService = new MLModelService();

// Predict performance
const prediction = await mlService.predictVideoPerformance({
  title: 'How to Build a React App in 2026',
  description: 'Complete tutorial covering React 18 features...',
  category: 'Education',
  duration: 600,
  thumbnailUrl: 'https://cdn.example.com/thumb.jpg'
});

console.log('Performance score:', prediction.performanceScore);
console.log('Expected views:', prediction.expectedViews);
console.log('Recommendations:', prediction.recommendations);

// Classify content
const classification = await mlService.classifyContent(videoMetadata);
console.log('Category:', classification.category);

// Extract tags
const tags = await mlService.extractTags(videoMetadata);
console.log('Tags:', tags);

// Sentiment analysis
const sentiment = await mlService.analyzeSentiment(commentText);
console.log('Sentiment:', sentiment.sentiment);
```

## ✅ Complete

Layer 2 (Intelligence) is **100% complete** with:
- ✅ 3 AI services (recommendations, moderation, search)
- ✅ 3 analytics services (video analytics, user behavior, A/B testing)
- ✅ 1 ML service (predictions, classification, sentiment)
- ✅ Central export file

**Total: 8 files** providing comprehensive intelligence capabilities for the Hootner video platform.
