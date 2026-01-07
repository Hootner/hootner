#!/usr/bin/env node
/**
 * Layer 11: Recommendation System - Collaborative and content-based filtering
 * Dependencies: Layer 6 (Database), Layer 11 (Neural Network)
 */

class RecommendationSystem {
  constructor() {
    this.users = new Map();
    this.items = new Map();
    this.ratings = new Map();
  }

  // Add user
  addUser(userId, profile = {}) {
    this.users.set(userId, { id: userId, profile, ratings: new Map() });
  }

  // Add item
  addItem(itemId, features = {}) {
    this.items.set(itemId, { id: itemId, features, ratings: [] });
  }

  // Rate item
  rate(userId, itemId, rating) {
    const user = this.users.get(userId);
    const item = this.items.get(itemId);
    
    if (!user || !item) return;
    
    user.ratings.set(itemId, rating);
    item.ratings.push({ userId, rating });
    
    const key = `${userId}:${itemId}`;
    this.ratings.set(key, rating);
    
    console.log(`[RATE] User ${userId} rated item ${itemId}: ${rating}`);
  }

  // Collaborative filtering (user-based)
  collaborativeFiltering(userId, k = 5) {
    const user = this.users.get(userId);
    if (!user) return [];
    
    // Find similar users
    const similarities = [];
    
    for (const [otherId, otherUser] of this.users) {
      if (otherId === userId) continue;
      
      const similarity = this.cosineSimilarity(
        Array.from(user.ratings.values()),
        Array.from(otherUser.ratings.values())
      );
      
      similarities.push({ userId: otherId, similarity });
    }
    
    // Sort by similarity
    similarities.sort((a, b) => b.similarity - a.similarity);
    const topK = similarities.slice(0, k);
    
    // Get recommendations from similar users
    const recommendations = new Map();
    
    for (const { userId: similarUserId, similarity } of topK) {
      const similarUser = this.users.get(similarUserId);
      
      for (const [itemId, rating] of similarUser.ratings) {
        if (!user.ratings.has(itemId)) {
          const current = recommendations.get(itemId) || 0;
          recommendations.set(itemId, current + rating * similarity);
        }
      }
    }
    
    // Sort recommendations
    return Array.from(recommendations.entries())
      .map(([itemId, score]) => ({ itemId, score }))
      .sort((a, b) => b.score - a.score);
  }

  // Content-based filtering
  contentBasedFiltering(userId, k = 5) {
    const user = this.users.get(userId);
    if (!user) return [];
    
    // Build user profile from rated items
    const userProfile = this.buildUserProfile(userId);
    
    // Score all unrated items
    const scores = [];
    
    for (const [itemId, item] of this.items) {
      if (user.ratings.has(itemId)) continue;
      
      const similarity = this.cosineSimilarity(
        Object.values(userProfile),
        Object.values(item.features)
      );
      
      scores.push({ itemId, score: similarity });
    }
    
    // Sort and return top k
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, k);
  }

  // Build user profile from ratings
  buildUserProfile(userId) {
    const user = this.users.get(userId);
    const profile = {};
    let count = 0;
    
    for (const [itemId, rating] of user.ratings) {
      const item = this.items.get(itemId);
      
      for (const [feature, value] of Object.entries(item.features)) {
        profile[feature] = (profile[feature] || 0) + value * rating;
      }
      count++;
    }
    
    // Normalize
    for (const feature in profile) {
      profile[feature] /= count;
    }
    
    return profile;
  }

  // Cosine similarity
  cosineSimilarity(a, b) {
    if (a.length === 0 || b.length === 0) return 0;
    
    const minLen = Math.min(a.length, b.length);
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < minLen; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Hybrid recommendation
  hybrid(userId, k = 5, alpha = 0.5) {
    const collaborative = this.collaborativeFiltering(userId, k * 2);
    const contentBased = this.contentBasedFiltering(userId, k * 2);
    
    // Combine scores
    const combined = new Map();
    
    for (const { itemId, score } of collaborative) {
      combined.set(itemId, score * alpha);
    }
    
    for (const { itemId, score } of contentBased) {
      const current = combined.get(itemId) || 0;
      combined.set(itemId, current + score * (1 - alpha));
    }
    
    return Array.from(combined.entries())
      .map(([itemId, score]) => ({ itemId, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }
}

// Demo
if (require.main === module) {
  const recommender = new RecommendationSystem();
  
  console.log('=== Recommendation System Demo ===\n');
  
  // Add users
  recommender.addUser('user1');
  recommender.addUser('user2');
  recommender.addUser('user3');
  
  // Add items with features
  recommender.addItem('movie1', { action: 0.8, comedy: 0.2, drama: 0.1 });
  recommender.addItem('movie2', { action: 0.2, comedy: 0.9, drama: 0.1 });
  recommender.addItem('movie3', { action: 0.7, comedy: 0.1, drama: 0.8 });
  recommender.addItem('movie4', { action: 0.1, comedy: 0.3, drama: 0.9 });
  
  console.log();
  
  // Rate items
  recommender.rate('user1', 'movie1', 5);
  recommender.rate('user1', 'movie2', 2);
  recommender.rate('user2', 'movie1', 4);
  recommender.rate('user2', 'movie3', 5);
  recommender.rate('user3', 'movie2', 5);
  recommender.rate('user3', 'movie4', 4);
  
  console.log();
  
  // Get recommendations
  console.log('Collaborative filtering for user1:');
  const collab = recommender.collaborativeFiltering('user1', 2);
  collab.forEach(r => console.log(`  ${r.itemId}: ${r.score.toFixed(2)}`));
  
  console.log();
  
  console.log('Content-based filtering for user1:');
  const content = recommender.contentBasedFiltering('user1', 2);
  content.forEach(r => console.log(`  ${r.itemId}: ${r.score.toFixed(2)}`));
  
  console.log();
  
  console.log('Hybrid recommendations for user1:');
  const hybrid = recommender.hybrid('user1', 2);
  hybrid.forEach(r => console.log(`  ${r.itemId}: ${r.score.toFixed(2)}`));
}

module.exports = RecommendationSystem;
