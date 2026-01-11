const logger = require('../lib/logger');

class PersonalizationAgent {
  constructor() {
    this.userProfiles = new Map();
    this.recommendations = new Map();
    this.interactions = new Map();
    this.contentCatalog = new Map();
  }

  // Build user profile
  buildUserProfile(userId, interactions) {
    const profile = {
      id: userId,
      preferences: this.extractPreferences(interactions),
      behavior: this.analyzeBehavior(interactions),
      demographics: this.inferDemographics(interactions),
      lastUpdated: Date.now()
    };
    
    this.userProfiles.set(userId, profile);
    logger.personalization('User profile built', { userId, preferences: profile.preferences });
    
    return profile;
  }

  extractPreferences(interactions) {
    const preferences = { genres: [], topics: [], formats: [] };
    
    interactions.forEach(interaction => {
      if (interaction.content?.genre && !preferences.genres.includes(interaction.content.genre)) {
        preferences.genres.push(interaction.content.genre);
      }
      if (interaction.content?.topic && !preferences.topics.includes(interaction.content.topic)) {
        preferences.topics.push(interaction.content.topic);
      }
    });
    
    return preferences;
  }

  analyzeBehavior(interactions) {
    const totalTime = interactions.reduce((sum, i) => sum + (i.duration || 0), 0);
    const avgSessionTime = totalTime / interactions.length;
    
    return {
      avgSessionTime,
      totalInteractions: interactions.length,
      preferredTimeOfDay: this.getPreferredTime(interactions),
      engagementLevel: this.calculateEngagement(interactions)
    };
  }

  getPreferredTime(interactions) {
    const hours = interactions.map(i => new Date(i.timestamp).getHours());
    const hourCounts = hours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b);
  }

  calculateEngagement(interactions) {
    const completionRates = interactions
      .filter(i => i.type === 'watch')
      .map(i => (i.watchTime || 0) / (i.totalDuration || 1));
    
    return completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length || 0;
  }

  inferDemographics(interactions) {
    // Simplified demographic inference
    return {
      ageGroup: 'adult',
      interests: this.extractInterests(interactions),
      deviceType: this.getDeviceType(interactions)
    };
  }

  extractInterests(interactions) {
    return interactions
      .map(i => i.content?.category)
      .filter(Boolean)
      .slice(0, 5);
  }

  getDeviceType(interactions) {
    const devices = interactions.map(i => i.device).filter(Boolean);
    return devices.length > 0 ? devices[0] : 'desktop';
  }

  // Generate personalized recommendations
  generateRecommendations(userId, count = 10) {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return this.getPopularContent(count);
    }
    
    const candidates = this.getCandidateContent(profile);
    const scored = candidates.map(content => ({
      ...content,
      score: this.calculatePersonalizationScore(profile, content),
      reason: this.getRecommendationReason(profile, content)
    }));
    
    const recommendations = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, count);\n    \n    this.recommendations.set(userId, {\n      userId,\n      recommendations,\n      generated: Date.now(),\n      algorithm: 'collaborative_filtering'\n    });\n    \n    logger.personalization('Recommendations generated', { \n      userId, \n      count: recommendations.length,\n      avgScore: recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length\n    });\n    \n    return recommendations;\n  }\n\n  getCandidateContent(profile) {\n    // Simplified content retrieval based on preferences\n    const candidates = [];\n    \n    profile.preferences.genres.forEach(genre => {\n      candidates.push(\n        { id: `${genre}-1`, title: `${genre} Content 1`, genre, score: 0 },\n        { id: `${genre}-2`, title: `${genre} Content 2`, genre, score: 0 }\n      );\n    });\n    \n    return candidates;\n  }\n\n  calculatePersonalizationScore(profile, content) {\n    let score = 0.5; // Base score\n    \n    // Genre match\n    if (profile.preferences.genres.includes(content.genre)) {\n      score += 0.3;\n    }\n    \n    // Engagement level boost\n    score += profile.behavior.engagementLevel * 0.2;\n    \n    // Time-based relevance\n    const currentHour = new Date().getHours();\n    if (Math.abs(currentHour - profile.behavior.preferredTimeOfDay) < 2) {\n      score += 0.1;\n    }\n    \n    return Math.min(score, 1);\n  }\n\n  getRecommendationReason(profile, content) {\n    if (profile.preferences.genres.includes(content.genre)) {\n      return `Because you like ${content.genre}`;\n    }\n    return 'Popular in your area';\n  }\n\n  getPopularContent(count) {\n    // Fallback popular content\n    return Array.from({ length: count }, (_, i) => ({\n      id: `popular-${i + 1}`,\n      title: `Popular Content ${i + 1}`,\n      score: 0.8 - (i * 0.05),\n      reason: 'Trending now'\n    }));\n  }\n\n  // Track user interaction\n  trackInteraction(userId, interaction) {\n    if (!this.interactions.has(userId)) {\n      this.interactions.set(userId, []);\n    }\n    \n    this.interactions.get(userId).push({\n      ...interaction,\n      timestamp: Date.now()\n    });\n    \n    // Update profile if significant interaction\n    if (['watch', 'like', 'share'].includes(interaction.type)) {\n      const userInteractions = this.interactions.get(userId);\n      this.buildUserProfile(userId, userInteractions);\n    }\n    \n    logger.personalization('Interaction tracked', { userId, type: interaction.type });\n  }\n\n  // A/B test recommendations\n  runABTest(userId, variants) {\n    const profile = this.userProfiles.get(userId);\n    const variant = this.selectVariant(userId, variants);\n    \n    logger.personalization('A/B test variant selected', { userId, variant });\n    \n    return {\n      variant,\n      recommendations: this.generateRecommendations(userId),\n      testId: `AB-${Date.now()}`\n    };\n  }\n\n  selectVariant(userId, variants) {\n    // Simple hash-based variant selection\n    const hash = userId.split('').reduce((a, b) => {\n      a = ((a << 5) - a) + b.charCodeAt(0);\n      return a & a;\n    }, 0);\n    \n    return variants[Math.abs(hash) % variants.length];\n  }\n\n  // Get personalization metrics\n  getPersonalizationMetrics() {\n    return {\n      totalProfiles: this.userProfiles.size,\n      totalRecommendations: this.recommendations.size,\n      avgEngagement: this.calculateAvgEngagement(),\n      topGenres: this.getTopGenres()\n    };\n  }\n\n  calculateAvgEngagement() {\n    const profiles = Array.from(this.userProfiles.values());\n    const engagements = profiles.map(p => p.behavior.engagementLevel).filter(Boolean);\n    \n    return engagements.length > 0 ? \n      engagements.reduce((sum, e) => sum + e, 0) / engagements.length : 0;\n  }\n\n  getTopGenres() {\n    const genreCounts = {};\n    \n    for (const profile of this.userProfiles.values()) {\n      profile.preferences.genres.forEach(genre => {\n        genreCounts[genre] = (genreCounts[genre] || 0) + 1;\n      });\n    }\n    \n    return Object.entries(genreCounts)\n      .sort(([,a], [,b]) => b - a)\n      .slice(0, 5)\n      .map(([genre, count]) => ({ genre, count }));\n  }\n}\n\nmodule.exports = new PersonalizationAgent();