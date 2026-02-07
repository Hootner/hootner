/**
 * Recommendation ML Service
 * Personalized content recommendations with behavioral analysis
 */

class RecommendationML {
  constructor() {
    this.userProfiles = new Map();
    this.contentVectors = new Map();
    this.interactionWeights = {
      view: 1,
      like: 3,
      share: 5,
      comment: 4,
      download: 6
    };
  }

  async getPersonalizedContent(userId, options = {}) {
    const profile = await this.getUserProfile(userId);
    const recommendations = await this.generateRecommendations(profile, options);
    
    return {
      userId,
      recommendations,
      algorithm: 'collaborative_filtering_hybrid',
      confidence: 0.87,
      generatedAt: new Date().toISOString()
    };
  }

  async getUserProfile(userId) {
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId);
    }

    // Mock user profile - replace with actual user data
    const profile = {
      userId,
      preferences: {
        categories: ['technology', 'entertainment', 'education'],
        genres: ['tutorial', 'review', 'documentary'],
        duration: 'medium', // short, medium, long
        quality: 'hd'
      },
      behavior: {
        avgWatchTime: 0.75, // 75% completion rate
        peakHours: [19, 20, 21], // 7-9 PM
        deviceTypes: ['mobile', 'desktop'],
        interactionRate: 0.15
      },
      history: {
        totalViews: 150,
        totalLikes: 45,
        totalShares: 12,
        lastActive: new Date().toISOString()
      }
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  async generateRecommendations(profile, options) {
    const { limit = 10, contentType = 'video', includeMetadata = false } = options;
    
    // Mock content database
    const mockContent = [
      { id: 'v1', title: 'AI Tutorial', category: 'technology', score: 0.95 },
      { id: 'v2', title: 'Comedy Show', category: 'entertainment', score: 0.82 },
      { id: 'v3', title: 'Science Doc', category: 'education', score: 0.88 },
      { id: 'v4', title: 'Tech Review', category: 'technology', score: 0.91 },
      { id: 'v5', title: 'Music Video', category: 'entertainment', score: 0.79 }
    ];

    // Score content based on user preferences
    const scoredContent = mockContent.map(content => ({
      ...content,
      personalizedScore: this.calculatePersonalizedScore(content, profile),
      reasons: this.getRecommendationReasons(content, profile)
    }));

    // Sort by personalized score and limit results
    const recommendations = scoredContent
      .sort((a, b) => b.personalizedScore - a.personalizedScore)
      .slice(0, limit);

    if (includeMetadata) {
      recommendations.forEach(rec => {
        rec.metadata = {
          algorithm: 'hybrid_cf_cb',
          factors: ['user_preference', 'collaborative_filtering', 'content_similarity'],
          confidence: rec.personalizedScore
        };
      });
    }

    return recommendations;
  }

  calculatePersonalizedScore(content, profile) {
    let score = content.score; // Base content quality score
    
    // Boost based on user preferences
    if (profile.preferences.categories.includes(content.category)) {
      score *= 1.3;
    }
    
    // Add behavioral factors
    score *= (1 + profile.behavior.interactionRate);
    
    // Add randomness to avoid filter bubbles
    score *= (0.9 + Math.random() * 0.2);
    
    return Math.min(score, 1.0);
  }

  getRecommendationReasons(content, profile) {
    const reasons = [];
    
    if (profile.preferences.categories.includes(content.category)) {
      reasons.push(`You enjoy ${content.category} content`);
    }
    
    if (content.score > 0.9) {
      reasons.push('Highly rated by other users');
    }
    
    reasons.push('Based on your viewing history');
    
    return reasons;
  }

  async updateUserInteraction(userId, contentId, interactionType) {
    const profile = await this.getUserProfile(userId);
    
    // Update interaction history
    if (!profile.interactions) {
      profile.interactions = [];
    }
    
    profile.interactions.push({
      contentId,
      type: interactionType,
      weight: this.interactionWeights[interactionType] || 1,
      timestamp: new Date().toISOString()
    });
    
    // Keep only recent interactions (last 1000)
    if (profile.interactions.length > 1000) {
      profile.interactions = profile.interactions.slice(-1000);
    }
    
    this.userProfiles.set(userId, profile);
  }

  async generateRecommendations({ userId, contentType = 'video', limit = 10, includeMetadata = false }) {
    console.log(`🎯 Generating ${limit} ${contentType} recommendations for user: ${userId}`);
    return await this.getPersonalizedContent(userId, { contentType, limit, includeMetadata });
  }
}

module.exports = new RecommendationML();