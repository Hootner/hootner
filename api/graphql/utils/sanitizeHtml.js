/**
 * HTML Sanitization Utilities
 * Provides safe HTML rendering with DOMPurify integration
 */

// Server-side DOMPurify (using jsdom)
let DOMPurify = null;

// Detect environment
if (typeof window !== 'undefined') {
  // Browser environment
  try {
    DOMPurify = require('dompurify');
  } catch (e) {
    console.warn(
      'DOMPurify not available in browser, falling back to escaping'
    );
  }
} else {
  // Node.js environment
  try {
    const createDOMPurify = require('dompurify');
    const { JSDOM } = require('jsdom');
    const window = new JSDOM('').window;
    DOMPurify = createDOMPurify(window);
  } catch (e) {
    console.warn('DOMPurify/JSDOM not available, falling back to escaping');
  }
}

/**
 * Escape HTML special characters
 * Fallback when DOMPurify is not available
 * @param {string} unsafe - Unsafe HTML string
 * @returns {string} - Escaped string
 */
function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize HTML using DOMPurify or fallback to escaping
 * @param {string} dirty - Dirty HTML string
 * @param {Object} config - DOMPurify configuration
 * @returns {string} - Sanitized HTML
 */
function sanitizeHtml(dirty, config = {}) {
  if (typeof dirty !== 'string') return '';

  // Use DOMPurify if available
  if (DOMPurify) {
    const defaultConfig = {
      ALLOWED_TAGS: [
        'b',
        'i',
        'em',
        'strong',
        'a',
        'p',
        'br',
        'ul',
        'ol',
        'li',
        'span',
        'div',
      ],
      ALLOWED_ATTR: ['href', 'title', 'class', 'id', 'style'],
      ALLOW_DATA_ATTR: false,
      SAFE_FOR_TEMPLATES: true,
    };

    return DOMPurify.sanitize(dirty, { ...defaultConfig, ...config });
  }

  // Fallback to escaping
  return escapeHtml(dirty);
}

/**
 * Sanitize HTML for display (removes all HTML tags)
 * @param {string} dirty - Dirty HTML string
 * @returns {string} - Plain text
 */
function sanitizeText(dirty) {
  if (typeof dirty !== 'string') return '';

  if (DOMPurify) {
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
  }

  return escapeHtml(dirty);
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * @param {string} url - URL to sanitize
 * @returns {string} - Safe URL or empty string
 */
function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return '';
  }

  return url;
}

/**
 * Create safe HTML element with sanitized content
 * @param {string} tagName - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string} content - Element content
 * @returns {string} - Safe HTML string
 */
function createSafeElement(tagName, attributes = {}, content = '') {
  const allowedTags = [
    'div',
    'span',
    'p',
    'a',
    'button',
    'strong',
    'em',
    'i',
    'b',
    'ul',
    'ol',
    'li',
  ];

  if (!allowedTags.includes(tagName)) {
    tagName = 'div';
  }

  // Sanitize attributes
  const safeAttrs = Object.entries(attributes)
    .filter(([key]) =>
      ['class', 'id', 'href', 'title', 'aria-label', 'role'].includes(key)
    )
    .map(([key, value]) => {
      let sanitizedValue = value;
      if (key === 'href') {
        sanitizedValue = sanitizeUrl(value);
      } else {
        sanitizedValue = escapeHtml(String(value));
      }
      return `${key}="${sanitizedValue}"`;
    })
    .join(' ');

  const safeContent = sanitizeHtml(content);

  return `<${tagName}${safeAttrs ? ' ' + safeAttrs : ''}>${safeContent}</${tagName}>`;
}

/**
 * Sanitize object properties (for API responses)
 * @param {Object} obj - Object to sanitize
 * @param {Array<string>} fields - Fields to sanitize
 * @returns {Object} - Sanitized object
 */
function sanitizeObject(obj, fields = []) {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = { ...obj };

  fields.forEach((field) => {
    if (field in sanitized && typeof sanitized[field] === 'string') {
      const sanitizedValue = sanitizeText(sanitized[field]);
      sanitized[field] = sanitizedValue;
    }
  });

  return sanitized;
}

/**
 * Validate and sanitize user input
 * @param {string} input - User input
 * @param {Object} options - Validation options
 * @returns {string} - Sanitized input or throws error
 */
function validateInput(input, options = {}) {
  const {
    maxLength = 10000,
    minLength = 0,
    pattern = null,
    allowHtml = false,
  } = options;

  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  if (input.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength}`);
  }

  if (input.length < minLength) {
    throw new Error(`Input must be at least ${minLength} characters`);
  }

  if (pattern && !pattern.test(input)) {
    throw new Error('Input does not match required pattern');
  }

  return allowHtml ? sanitizeHtml(input) : sanitizeText(input);
}

module.exports = {
  escapeHtml,
  sanitizeHtml,
  sanitizeText,
  sanitizeUrl,
  createSafeElement,
  sanitizeObject,
  validateInput,
};
