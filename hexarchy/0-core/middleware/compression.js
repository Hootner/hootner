// Response Compression Middleware
import compression from 'compression';

export const compressionMiddleware = compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression's default filter
    return compression.filter(req, res);
  }
});

export default compressionMiddleware;
