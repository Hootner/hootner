// Content Policy Validator
export class ContentPolicyValidator {
  static PROFANITY_LIST = ['badword1', 'badword2']; // In production, use comprehensive list
  static MAX_UPLOAD_PER_DAY = 100;
  static MAX_COMMENT_LENGTH = 1000;

  static validateVideoContent(video, user) {
    const errors = [];

    // User upload limits
    if (!user.canUploadVideo()) {
      errors.push('User is not verified or active');
    }

    // Title profanity check
    if (this.containsProfanity(video.title)) {
      errors.push('Title contains inappropriate content');
    }

    // Description profanity check
    if (video.description && this.containsProfanity(video.description)) {
      errors.push('Description contains inappropriate content');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateComment(comment) {
    const errors = [];

    // Length
    if (!comment.text || comment.text.trim().length === 0) {
      errors.push('Comment cannot be empty');
    }

    if (comment.text && comment.text.length > this.MAX_COMMENT_LENGTH) {
      errors.push(`Comment must not exceed ${this.MAX_COMMENT_LENGTH} characters`);
    }

    // Profanity
    if (comment.text && this.containsProfanity(comment.text)) {
      errors.push('Comment contains inappropriate content');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static containsProfanity(text) {
    const lowerText = text.toLowerCase();
    return this.PROFANITY_LIST.some(word => lowerText.includes(word));
  }

  static async checkDailyUploadLimit(userId, uploadsToday) {
    return uploadsToday < this.MAX_UPLOAD_PER_DAY;
  }
}

export default ContentPolicyValidator;
