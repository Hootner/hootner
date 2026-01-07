import { createLogger } from '../lib/logger.js';

const accessLogger = createLogger('access', 'access');

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  req.id = requestId;
  
  res.on('finish', () => {
    accessLogger.info({
      requestId,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: Date.now() - start,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  
  next();
};
