// Search Engine with ranking
import { logger } from '../../0-core/logging/logger.js';

export class SearchEngine {
  constructor(videoService, userService) {
    this.videoService = videoService;
    this.userService = userService;
  }

  // Search videos with intelligent ranking
  async searchVideos(query, filters = {}, userId = null) {
    try {
      // Get all videos matching query
      const results = await this.videoService.searchVideos(query, filters);

      // Rank results
      const ranked = this.rankResults(results, query, userId);

      logger.info('Video search completed', { query, resultCount: ranked.length });
      return ranked;
    } catch (error) {
      logger.error('Video search failed:', error);
      return [];
    }
  }

  // Rank search results
  rankResults(videos, query, userId) {
    const queryTerms = this.tokenize(query);

    return videos.map(video => ({
      ...video,
      relevanceScore: this.calculateRelevance(video, queryTerms, userId)
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // Calculate relevance score
  calculateRelevance(video, queryTerms, userId) {
    let score = 0;

    // Title match (highest weight)
    score += this.calculateTermMatch(video.title, queryTerms) * 10;

    // Description match
    if (video.description) {
      score += this.calculateTermMatch(video.description, queryTerms) * 5;
    }

    // Category match
    if (queryTerms.includes(video.category?.toLowerCase())) {
      score += 5;
    }

    // Popularity factor
    score += Math.log(video.views + 1);

    // Engagement factor
    const engagementRatio = video.views > 0 ? (video.likes + video.commentCount) / video.views : 0;
    score += engagementRatio * 3;

    // Recency boost
    const ageInDays = (Date.now() - new Date(video.createdAt)) / (1000 * 60 * 60 * 24);
    if (ageInDays < 7) score += 2;

    return score;
  }

  // Calculate term matching score
  calculateTermMatch(text, terms) {
    if (!text) return 0;

    const lowerText = text.toLowerCase();
    let matches = 0;

    for (const term of terms) {
      // Exact match
      if (lowerText === term) matches += 5;
      // Starts with
      else if (lowerText.startsWith(term)) matches += 3;
      // Contains
      else if (lowerText.includes(term)) matches += 1;
    }

    return matches;
  }

  // Tokenize query
  tokenize(query) {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(term => term.length > 0);
  }

  // Search suggestions (autocomplete)
  async getSuggestions(prefix, limit = 5) {
    // Get recent popular searches
    const popularSearches = await this.getPopularSearches(limit * 2);

    // Filter by prefix
    const matching = popularSearches
      .filter(search => search.toLowerCase().startsWith(prefix.toLowerCase()))
      .slice(0, limit);

    // Add video titles matching prefix
    const videos = await this.videoService.searchVideos(prefix, { limit: limit * 2 });
    const titleSuggestions = videos
      .map(v => v.title)
      .filter(title => title.toLowerCase().includes(prefix.toLowerCase()))
      .slice(0, limit);

    // Combine and dedupe
    return [...new Set([...matching, ...titleSuggestions])].slice(0, limit);
  }

  // Get popular searches
  async getPopularSearches(limit = 10) {
    // This would typically come from analytics
    return [
      'tutorial',
      'music',
      'gaming',
      'vlog',
      'cooking',
      'fitness',
      'tech review',
      'movie trailer',
      'comedy',
      'documentary'
    ].slice(0, limit);
  }

  // Advanced search with filters
  async advancedSearch(query, filters = {}) {
    const {
      category,
      duration, // 'short' (<4min), 'medium' (4-20min), 'long' (>20min)
      uploadDate, // 'today', 'week', 'month', 'year'
      sortBy, // 'relevance', 'date', 'views', 'rating'
      minViews,
      maxViews
    } = filters;

    // Get base results
    let results = await this.searchVideos(query, { category });

    // Apply duration filter
    if (duration) {
      results = this.filterByDuration(results, duration);
    }

    // Apply date filter
    if (uploadDate) {
      results = this.filterByDate(results, uploadDate);
    }

    // Apply view count filter
    if (minViews || maxViews) {
      results = results.filter(v => {
        const views = v.views || 0;
        return (!minViews || views >= minViews) && (!maxViews || views <= maxViews);
      });
    }

    // Apply sorting
    if (sortBy && sortBy !== 'relevance') {
      results = this.sortResults(results, sortBy);
    }

    return results;
  }

  // Filter by duration
  filterByDuration(videos, duration) {
    switch (duration) {
      case 'short':
        return videos.filter(v => v.duration < 240);
      case 'medium':
        return videos.filter(v => v.duration >= 240 && v.duration < 1200);
      case 'long':
        return videos.filter(v => v.duration >= 1200);
      default:
        return videos;
    }
  }

  // Filter by upload date
  filterByDate(videos, period) {
    const now = Date.now();
    const periods = {
      today: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000
    };

    const cutoff = now - (periods[period] || periods.year);
    return videos.filter(v => new Date(v.createdAt).getTime() >= cutoff);
  }

  // Sort results
  sortResults(videos, sortBy) {
    switch (sortBy) {
      case 'date':
        return videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'views':
        return videos.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'rating':
        return videos.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      default:
        return videos;
    }
  }
}

export default SearchEngine;
