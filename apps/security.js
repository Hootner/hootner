// Security hardening for streaming server
const rateLimit = require('express-rate-limit');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Input validation
function validateInput(input, type) {
  switch(type) {
    case 'streamKey':
      return /^[a-zA-Z0-9_-]{8,64}$/.test(input);
    case 'message':
      return input.length <= 200 && !/[<>"'&]/.test(input);
    case 'username':
      return /^[a-zA-Z0-9_]{3,20}$/.test(input);
    default:
      return false;
  }
}

// XSS protection
function sanitizeHtml(str) {
  return str.replace(/[<>"'&]/g, (match) => {
    switch (match) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case '\'':
        return '&#x27;';
      case '&':
        return '&amp;';
      default:
        return match;
    }
  });
}

// CSRF token generation
function generateCSRFToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

module.exports = { limiter, validateInput, sanitizeHtml, generateCSRFToken };
