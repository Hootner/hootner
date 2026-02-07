// Recommendation Engine
import { logger } from '../../0-core/logging/logger.js';

export class RecommendationEngine {
  constructor(videoService, analyticsService) {
    this.videoService = videoService;
    this.analyticsService = analyticsService;
  }

  // Get personalized video recommendations for user
  async getPersonalizedRecommendations(userId, limit = 10) {
    try {
      // Get user's watch history
      const watchHistory = await this.analyticsService.getUserWatchHistory(userId);

      // Get user's liked videos
      const likedVideos = await this.analyticsService.getUserLikedVideos(userId);

      // Extract categories and tags from history
      const preferences = this.extractUserPreferences(watchHistory, likedVideos);

      // Get candidate videos
      const candidates = await this.videoService.getVideosByCategories(preferences.categories);

      // Score and rank videos
      const scored = this.scoreVideos(candidates, preferences, watchHistory);

      // Return top recommendations
      return scored.slice(0, limit);
    } catch (error) {
      logger.error('Personalized recommendations failed:', error);
      return this.getFallbackRecommendations(limit);
    }
  }

  // Extract user preferences from history
  extractUserPreferences(watchHistory, likedVideos) {
    const categoryCount = {};
    const allVideos = [...watchHistory, ...likedVideos];

    allVideos.forEach(video => {
      if (video.category) {
        categoryCount[video.category] = (categoryCount[video.category] || 0) + 1;
      }
    });

    // Sort categories by frequency
    const categories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category)
      .slice(0, 5);

    return { categories };
  }

  // Score videos based on user preferences
  scoreVideos(videos, preferences, watchHistory) {
    const watchedIds = new Set(watchHistory.map(v => v.id));

    return videos
      .filter(video => !watchedIds.has(video.id))
      .map(video => ({
        ...video,
        score: this.calculateScore(video, preferences)
      }))
      .sort((a, b) => b.score - a.score);
  }

  // Calculate recommendation score
  calculateScore(video, preferences) {
    let score = 0;

    // Category match
    if (preferences.categories.includes(video.category)) {
      score += 10;
    }

    // Popularity factor
    score += Math.log(video.views + 1) * 2;

    // Engagement factor (likes ratio)
    const engagementRatio = video.views > 0 ? video.likes / video.views : 0;
    score += engagementRatio * 5;

    // Recency factor (newer videos get boost)
    const ageInDays = (Date.now() - new Date(video.createdAt)) / (1000 * 60 * 60 * 24);
    if (ageInDays < 7) score += 5;
    else if (ageInDays < 30) score += 2;

    return score;
  }

  // Get similar videos based on video ID
  async getSimilarVideos(videoId, limit = 5) {
    const video = await this.videoService.getVideoById(videoId);
    if (!video) return [];

    // Get videos in same category
    const candidates = await this.videoService.getVideosByCategories([video.category]);

    // Filter out current video and score by similarity
    return candidates
      .filter(v => v.id !== videoId)
      .map(v => ({
        ...v,
        similarity: this.calculateSimilarity(video, v)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Calculate video similarity
  calculateSimilarity(video1, video2) {
    let similarity = 0;

    // Same category
    if (video1.category === video2.category) similarity += 10;

    // Same author
    if (video1.userId === video2.userId) similarity += 5;

    // Similar duration
    const durationDiff = Math.abs(video1.duration - video2.duration);
    if (durationDiff < 60) similarity += 3;

    return similarity;
  }

  // Fallback recommendations (trending videos)
  async getFallbackRecommendations(limit) {
    return await this.videoService.getTrendingVideos(limit);
  }

  // Get trending videos
  async getTrendingVideos(limit = 10) {
    const videos = await this.videoService.getTrendingVideos(limit * 2);

    // Calculate trend score (views growth + engagement)
    return videos
      .map(video => ({
        ...video,
        trendScore: this.calculateTrendScore(video)
      }))
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, limit);
  }

  // Calculate trend score
  calculateTrendScore(video) {
    const views = video.views || 0;
    const likes = video.likes || 0;
    const comments = video.commentCount || 0;

    // Engagement-weighted score
    return views + (likes * 10) + (comments * 5);
  }
}

export default RecommendationEngine;
