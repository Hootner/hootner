/**
 * Advanced Content Moderation Service
 * AI-powered content filtering with real-time analysis
 */

const crypto = require('crypto');

class AdvancedContentModeration {
  constructor() {
    this.policies = new Map();
    this.moderationQueue = new Map();
    this.mlModels = new Map();
    this.reviewers = new Map();
    
    this.initializePolicies();
    this.initializeMLModels();
  }

  initializePolicies() {
    const policies = [
      { name: 'violence', threshold: 0.8, action: 'block', severity: 'high' },
      { name: 'nudity', threshold: 0.7, action: 'flag', severity: 'medium' },
      { name: 'hate_speech', threshold: 0.9, action: 'block', severity: 'critical' },
      { name: 'spam', threshold: 0.6, action: 'flag', severity: 'low' },
      { name: 'copyright', threshold: 0.85, action: 'block', severity: 'high' },
      { name: 'misinformation', threshold: 0.75, action: 'review', severity: 'medium' }
    ];

    policies.forEach(policy => {
      this.policies.set(policy.name, policy);
    });
  }

  initializeMLModels() {
    const models = [
      { name: 'video_classifier', type: 'cnn', accuracy: 0.94, latency: 2000 },
      { name: 'audio_analyzer', type: 'rnn', accuracy: 0.89, latency: 1500 },
      { name: 'text_sentiment', type: 'transformer', accuracy: 0.92, latency: 500 },
      { name: 'image_detector', type: 'yolo', accuracy: 0.96, latency: 800 },
      { name: 'deepfake_detector', type: 'gan', accuracy: 0.87, latency: 3000 }
    ];

    models.forEach(model => {
      this.mlModels.set(model.name, model);
    });
  }

  async analyzeContent({ contentId, type, url, priority = 'normal', policies = [] }) {
    // Sanitize inputs to prevent XSS
    contentId = String(contentId).replace(/[<>"'&]/g, '');
    type = String(type).replace(/[<>"'&]/g, '');
    priority = String(priority).replace(/[<>"'&]/g, '');
    
    // Validate URL to prevent SSRF
    if (url && !url.match(/^https?:\/\/(content\.hootner\.com|localhost)/)) {
      throw new Error('Invalid content URL');
    }
    
    console.log(`🔍 Analyzing content: ${contentId} (${type}) - Priority: ${priority}`);
    
    const analysisId = `analysis_${crypto.randomUUID()}`;
    
    const analysis = {
      id: analysisId,
      contentId,
      type,
      url,
      priority,
      policies: policies.length > 0 ? policies : Array.from(this.policies.keys()),
      status: 'analyzing',
      startTime: new Date().toISOString(),
      results: new Map(),
      overallScore: 0,
      recommendation: 'pending'
    };

    this.moderationQueue.set(analysisId, analysis);
    
    try {
      // Run ML analysis
      const mlResults = await this.runMLAnalysis(type, url, analysis.policies);
      analysis.results = mlResults;
      
      // Calculate overall risk score
      analysis.overallScore = this.calculateOverallScore(mlResults);
      
      // Determine action
      analysis.recommendation = this.determineAction(mlResults, analysis.overallScore);
      
      analysis.status = 'completed';
      analysis.endTime = new Date().toISOString();
      analysis.processingTime = Date.now() - new Date(analysis.startTime).getTime();
      
      // Auto-escalate if needed
      if (analysis.recommendation === 'human_review') {
        await this.escalateToHumanReview(analysis);
      }
      
    } catch (error) {
      analysis.status = 'failed';
      analysis.error = error.message;
    }
    
    return analysis;
  }

  async runMLAnalysis(contentType, url, policies) {
    const results = new Map();
    
    for (const policyName of policies) {
      const policy = this.policies.get(policyName);
      if (!policy) continue;
      
      const modelResult = await this.runModelAnalysis(contentType, url, policyName);
      
      results.set(policyName, {
        confidence: modelResult.confidence,
        detected: modelResult.confidence > policy.threshold,
        threshold: policy.threshold,
        action: policy.action,
        severity: policy.severity,
        details: modelResult.details
      });
    }
    
    return results;
  }

  async runModelAnalysis(contentType, url, policyName) {
    // Select appropriate model
    const modelName = this.selectModel(contentType, policyName);
    const model = this.mlModels.get(modelName);
    
    if (!model) {
      throw new Error(`No model available for ${contentType}/${policyName}`);
    }

    // Simulate ML processing
    await new Promise(resolve => setTimeout(resolve, Math.min(model.latency, 1000)));
    
    // Mock ML results
    const confidence = this.generateMockConfidence(policyName);
    
    return {
      model: modelName,
      confidence,
      processingTime: model.latency,
      details: this.generateAnalysisDetails(policyName, confidence)
    };
  }

  selectModel(contentType, policyName) {
    const modelMapping = {
      video: {
        violence: 'video_classifier',
        nudity: 'video_classifier',
        copyright: 'video_classifier',
        deepfake: 'deepfake_detector'
      },
      audio: {
        hate_speech: 'audio_analyzer',
        spam: 'audio_analyzer'
      },
      text: {
        hate_speech: 'text_sentiment',
        spam: 'text_sentiment',
        misinformation: 'text_sentiment'
      },
      image: {
        nudity: 'image_detector',
        violence: 'image_detector'
      }
    };
    
    return modelMapping[contentType]?.[policyName] || 'video_classifier';
  }

  generateMockConfidence(policyName) {
    // Generate realistic confidence scores
    const baseProbabilities = {
      violence: 0.05,
      nudity: 0.03,
      hate_speech: 0.02,
      spam: 0.08,
      copyright: 0.01,
      misinformation: 0.04
    };
    
    const baseProb = baseProbabilities[policyName] || 0.05;
    
    // Most content is clean, but some will trigger
    if (Math.random() < baseProb) {
      return 0.7 + Math.random() * 0.3; // High confidence violation
    } else {
      return Math.random() * 0.4; // Low confidence, likely clean
    }
  }

  generateAnalysisDetails(policyName, confidence) {
    const details = {
      violence: {
        detected_objects: confidence > 0.7 ? ['weapon', 'fighting'] : [],
        scene_analysis: `Violence probability: ${(confidence * 100).toFixed(1)}%`
      },
      nudity: {
        body_parts_detected: confidence > 0.7 ? ['exposed_content'] : [],
        skin_percentage: Math.round(confidence * 30)
      },
      hate_speech: {
        toxic_words: confidence > 0.7 ? ['offensive_term_1', 'slur_detected'] : [],
        sentiment_score: -confidence
      },
      spam: {
        spam_indicators: confidence > 0.6 ? ['repetitive_text', 'promotional_content'] : [],
        quality_score: 1 - confidence
      }
    };
    
    return details[policyName] || { confidence_score: confidence };
  }

  calculateOverallScore(results) {
    if (results.size === 0) return 0;
    
    let totalScore = 0;
    let weightedSum = 0;
    
    for (const [policyName, result] of results.entries()) {
      const policy = this.policies.get(policyName);
      const weight = policy.severity === 'critical' ? 3 : policy.severity === 'high' ? 2 : 1;
      
      totalScore += result.confidence * weight;
      weightedSum += weight;
    }
    
    return totalScore / weightedSum;
  }

  determineAction(results, overallScore) {
    let maxSeverityAction = 'approve';
    let hasViolations = false;
    
    for (const [policyName, result] of results.entries()) {
      if (result.detected) {
        hasViolations = true;
        const policy = this.policies.get(policyName);
        
        if (policy.action === 'block') {
          return 'block';
        } else if (policy.action === 'review' && maxSeverityAction !== 'block') {
          maxSeverityAction = 'human_review';
        } else if (policy.action === 'flag' && maxSeverityAction === 'approve') {
          maxSeverityAction = 'flag';
        }
      }
    }
    
    // High overall score triggers review even if individual policies don't
    if (overallScore > 0.6 && !hasViolations) {
      return 'human_review';
    }
    
    return maxSeverityAction;
  }

  async escalateToHumanReview(analysis) {
    const reviewId = `review_${crypto.randomUUID()}`;
    
    const review = {
      id: reviewId,
      analysisId: analysis.id,
      contentId: analysis.contentId,
      priority: analysis.priority,
      assignedAt: new Date().toISOString(),
      reviewer: null,
      status: 'pending',
      estimatedTime: this.getEstimatedReviewTime(analysis.priority)
    };
    
    this.reviewers.set(reviewId, review);
    
    console.log(`👤 Escalated to human review: ${analysis.contentId} (Priority: ${analysis.priority})`);
    
    return review;
  }

  getEstimatedReviewTime(priority) {
    const times = {
      critical: 15, // 15 minutes
      high: 60,     // 1 hour
      normal: 240,  // 4 hours
      low: 1440     // 24 hours
    };
    
    return times[priority] || times.normal;
  }

  async moderate({ contentId, type, priority = 'normal', policies = [] }) {
    console.log(`🛡️ Moderating content: ${contentId}`);
    
    const url = `https://content.hootner.com/${contentId}`;
    return await this.analyzeContent({ contentId, type, url, priority, policies });
  }

  async getAnalysisResult(analysisId) {
    return this.moderationQueue.get(analysisId) || null;
  }

  async getModerationStats(timeRange = '24h') {
    const stats = {
      timeRange,
      generatedAt: new Date().toISOString(),
      totalAnalyses: Math.floor(Math.random() * 10000) + 5000,
      blocked: Math.floor(Math.random() * 500) + 100,
      flagged: Math.floor(Math.random() * 1000) + 300,
      approved: Math.floor(Math.random() * 8000) + 4000,
      humanReviews: Math.floor(Math.random() * 200) + 50,
      avgProcessingTime: Math.floor(Math.random() * 2000) + 1000, // ms
      policyBreakdown: {
        violence: Math.floor(Math.random() * 100) + 20,
        nudity: Math.floor(Math.random() * 80) + 15,
        hate_speech: Math.floor(Math.random() * 60) + 10,
        spam: Math.floor(Math.random() * 200) + 50,
        copyright: Math.floor(Math.random() * 40) + 5
      },
      accuracy: {
        falsePositives: (Math.random() * 0.05).toFixed(3), // 0-5%
        falseNegatives: (Math.random() * 0.02).toFixed(3), // 0-2%
        overallAccuracy: (0.92 + Math.random() * 0.06).toFixed(3) // 92-98%
      }
    };
    
    return stats;
  }

  async updatePolicy({ policyName, threshold, action, severity }) {
    if (!this.policies.has(policyName)) {
      throw new Error(`Policy ${policyName} not found`);
    }
    
    const policy = this.policies.get(policyName);
    
    if (threshold !== undefined) policy.threshold = threshold;
    if (action !== undefined) policy.action = action;
    if (severity !== undefined) policy.severity = severity;
    
    console.log(`⚙️ Updated policy: ${policyName}`);
    
    return policy;
  }

  async listPolicies() {
    return Array.from(this.policies.entries()).map(([name, policy]) => ({
      name,
      ...policy
    }));
  }

  async getReviewQueue() {
    return Array.from(this.reviewers.values())
      .filter(review => review.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }
}

module.exports = new AdvancedContentModeration();