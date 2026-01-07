const { URL } = require('node:url');
const { HTTP_STATUS, LIMITS } = require('../constants');

/**
 * Blocked hosts for SSRF protection
 */
const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'metadata.goog',
  '169.254.169.254', // AWS metadata
  'metadata.azure.com', // Azure metadata
  'metadata', // Generic metadata
  '100.100.100.200', // Alibaba Cloud metadata
];

/**
 * Allowed protocols
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * Check if IP is private
 * @param {string} hostname - Hostname to check
 * @returns {boolean} True if private IP
 */
const isPrivateIP = (hostname) => {
  const ip = hostname.toLowerCase();

  // IPv4 private ranges
  if (/^127\./.test(ip)) return true; // 127.0.0.0/8
  if (/^10\./.test(ip)) return true; // 10.0.0.0/8
  if (/^192\.168\./.test(ip)) return true; // 192.168.0.0/16
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true; // 172.16.0.0/12
  if (/^169\.254\./.test(ip)) return true; // 169.254.0.0/16

  // IPv6 private ranges
  if (ip.startsWith('::1')) return true;
  if (ip.startsWith('fc') || ip.startsWith('fd')) return true;
  if (ip.startsWith('fe80:')) return true;

  return false;
};

/**
 * Validate URL for SSRF protection
 * @param {string} urlString - URL to validate
 * @returns {URL} Validated URL object
 * @throws {Error} If URL is invalid or blocked
 */
const validateURL = (urlString) => {
  if (!urlString || typeof urlString !== 'string' || urlString.length > LIMITS.MAX_BUFFER_SIZE) {
    throw new Error('Invalid URL');
  }

  try {
    const url = new URL(urlString);

    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      throw new Error('Protocol not allowed');
    }

    // Check for blocked hosts (case-insensitive)
    const hostname = url.hostname.toLowerCase();
    if (BLOCKED_HOSTS.some((blocked) => hostname.includes(blocked))) {
      throw new Error('Host not allowed');
    }

    if (isPrivateIP(url.hostname)) {
      throw new Error('Private IP not allowed');
    }

    // Prevent DNS rebinding attacks
    if (url.username || url.password) {
      throw new Error('Credentials in URL not allowed');
    }

    return url;
  } catch (error) {
    throw new Error('Invalid URL');
  }
};

/**
 * SSRF protection middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
const ssrfProtection = (req, res, next) => {
  const url = req.body?.url || req.query?.url || req.params?.url;

  if (url) {
    try {
      validateURL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request' });
    }
  }

  next();
};

module.exports = { ssrfProtection, validateURL };
