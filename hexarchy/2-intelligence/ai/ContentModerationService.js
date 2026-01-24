// Content Moderation Service
import { logger } from '../../0-core/logging/logger.js';

export class ContentModerationService {
  constructor() {
    this.toxicityThreshold = 0.7;
    this.spamThreshold = 0.8;
  }

  // Moderate video content
  async moderateVideo(video) {
    const results = {
      approved: true,
      flags: [],
      confidence: 1.0
    };

    // Check title for inappropriate content
    const titleCheck = await this.checkText(video.title);
    if (titleCheck.inappropriate) {
      results.approved = false;
      results.flags.push({ type: 'title', reason: titleCheck.reason, confidence: titleCheck.confidence });
    }

    // Check description
    if (video.description) {
      const descCheck = await this.checkText(video.description);
      if (descCheck.inappropriate) {
        results.approved = false;
        results.flags.push({ type: 'description', reason: descCheck.reason, confidence: descCheck.confidence });
      }
    }

    logger.info('Video moderation complete', { videoId: video.id, approved: results.approved });
    return results;
  }

  // Moderate comment content
  async moderateComment(comment) {
    const results = {
      approved: true,
      flags: [],
      confidence: 1.0
    };

    const textCheck = await this.checkText(comment.text);
    if (textCheck.inappropriate) {
      results.approved = false;
      results.flags.push({ type: 'toxicity', reason: textCheck.reason, confidence: textCheck.confidence });
    }

    // Check for spam patterns
    const spamCheck = this.checkSpam(comment.text);
    if (spamCheck.isSpam) {
      results.approved = false;
      results.flags.push({ type: 'spam', reason: 'Spam detected', confidence: spamCheck.confidence });
    }

    return results;
  }

  // Check text for inappropriate content
  async checkText(text) {
    // Profanity filter
    const profanity = this.checkProfanity(text);
    if (profanity.detected) {
      return { inappropriate: true, reason: 'Profanity detected', confidence: profanity.confidence };
    }

    // Hate speech detection
    const hateSpeech = this.checkHateSpeech(text);
    if (hateSpeech.detected) {
      return { inappropriate: true, reason: 'Hate speech detected', confidence: hateSpeech.confidence };
    }

    // Explicit content
    const explicit = this.checkExplicitContent(text);
    if (explicit.detected) {
      return { inappropriate: true, reason: 'Explicit content detected', confidence: explicit.confidence };
    }

    return { inappropriate: false };
  }

  // Check for profanity
  checkProfanity(text) {
    const profanityWords = ['badword1', 'badword2', 'badword3']; // Placeholder list
    const lowerText = text.toLowerCase();

    for (const word of profanityWords) {
      if (lowerText.includes(word)) {
        return { detected: true, confidence: 0.9 };
      }
    }

    return { detected: false };
  }

  // Check for hate speech
  checkHateSpeech(text) {
    const hateSpeechPatterns = [
      /\b(hate|kill|attack)\s+(all|every)\b/i,
      // Add more patterns
    ];

    for (const pattern of hateSpeechPatterns) {
      if (pattern.test(text)) {
        return { detected: true, confidence: 0.85 };
      }
    }

    return { detected: false };
  }

  // Check for explicit content
  checkExplicitContent(text) {
    const explicitPatterns = [
      // Add explicit content patterns
    ];

    for (const pattern of explicitPatterns) {
      if (pattern.test(text)) {
        return { detected: true, confidence: 0.8 };
      }
    }

    return { detected: false };
  }

  // Check for spam
  checkSpam(text) {
    let spamScore = 0;

    // Excessive links
    const linkCount = (text.match(/https?:\/\//g) || []).length;
    if (linkCount > 2) spamScore += 0.3;

    // Excessive caps
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.5) spamScore += 0.2;

    // Repeated characters
    if (/(.)\1{4,}/.test(text)) spamScore += 0.2;

    // Excessive emojis
    const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
    if (emojiCount > 10) spamScore += 0.2;

    // Common spam phrases
    const spamPhrases = ['click here', 'buy now', 'limited time', 'earn money'];
    for (const phrase of spamPhrases) {
      if (text.toLowerCase().includes(phrase)) {
        spamScore += 0.3;
        break;
      }
    }

    return {
      isSpam: spamScore >= this.spamThreshold,
      confidence: Math.min(spamScore, 1.0)
    };
  }

  // Batch moderate content
  async batchModerate(items, type = 'comment') {
    const results = [];

    for (const item of items) {
      const result = type === 'video'
        ? await this.moderateVideo(item)
        : await this.moderateComment(item);

      results.push({ item, moderation: result });
    }

    return results;
  }
}

export default ContentModerationService;
