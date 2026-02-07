// System Limits & Constraints
export const LIMITS = {
  // File Sizes (in bytes)
  MAX_VIDEO_SIZE: 500 * 1024 * 1024,      // 500MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,       // 10MB
  MAX_DOCUMENT_SIZE: 20 * 1024 * 1024,    // 20MB

  // Request Limits
  MAX_REQUEST_SIZE: 10 * 1024 * 1024,     // 10MB
  MAX_JSON_SIZE: 1 * 1024 * 1024,         // 1MB

  // Text Lengths
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_COMMENT_LENGTH: 1000,
  MAX_USERNAME_LENGTH: 30,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Rate Limits (per time window)
  API_RATE_LIMIT: 100,            // 100 requests per 15 min
  AUTH_RATE_LIMIT: 5,             // 5 login attempts per 15 min
  UPLOAD_RATE_LIMIT: 10,          // 10 uploads per hour

  // Business Logic
  MAX_TAGS_PER_VIDEO: 10,
  MAX_PLAYLISTS_PER_USER: 50,
  MAX_VIDEOS_PER_PLAYLIST: 1000,
  MAX_WATCH_PARTY_SIZE: 100,

  // Time Limits (in seconds)
  VIDEO_PROCESSING_TIMEOUT: 600,  // 10 minutes
  SESSION_TIMEOUT: 604800,        // 7 days
  JWT_EXPIRY: 604800,             // 7 days
  PASSWORD_RESET_EXPIRY: 3600     // 1 hour
};

export default LIMITS;
