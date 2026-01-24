// Video Validator
export class VideoValidator {
  static MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
  static MAX_TITLE_LENGTH = 200;
  static MAX_DESCRIPTION_LENGTH = 5000;
  static MAX_TAGS = 10;
  static ALLOWED_FORMATS = ['mp4', 'mov', 'avi', 'mkv', 'webm'];

  static validateUpload(videoData) {
    const errors = [];

    // Title
    if (!videoData.title || videoData.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (videoData.title && videoData.title.length > this.MAX_TITLE_LENGTH) {
      errors.push(`Title must not exceed ${this.MAX_TITLE_LENGTH} characters`);
    }

    // Description
    if (videoData.description && videoData.description.length > this.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description must not exceed ${this.MAX_DESCRIPTION_LENGTH} characters`);
    }

    // Tags
    if (videoData.tags && videoData.tags.length > this.MAX_TAGS) {
      errors.push(`Maximum ${this.MAX_TAGS} tags allowed`);
    }

    // Visibility
    const validVisibility = ['public', 'private', 'unlisted'];
    if (videoData.visibility && !validVisibility.includes(videoData.visibility)) {
      errors.push('Invalid visibility setting');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateFile(file) {
    const errors = [];

    // Size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`File size must not exceed ${this.MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB`);
    }

    // Format
    const extension = file.name.split('.').pop().toLowerCase();
    if (!this.ALLOWED_FORMATS.includes(extension)) {
      errors.push(`Invalid format. Allowed: ${this.ALLOWED_FORMATS.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUpdate(videoData) {
    const errors = [];

    if (videoData.title && videoData.title.length > this.MAX_TITLE_LENGTH) {
      errors.push(`Title must not exceed ${this.MAX_TITLE_LENGTH} characters`);
    }

    if (videoData.description && videoData.description.length > this.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description must not exceed ${this.MAX_DESCRIPTION_LENGTH} characters`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default VideoValidator;
