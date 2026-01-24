// Request ID Generation Middleware
import { v4 as uuidv4 } from 'uuid';

export const requestId = (req, res, next) => {
  // Use existing request ID or generate new one
  const id = req.headers['x-request-id'] || uuidv4();
  
  req.id = id;
  res.setHeader('X-Request-ID', id);
  
  next();
};

export default requestId;
