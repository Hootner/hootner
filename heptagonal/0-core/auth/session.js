// Session Management
import session from 'express-session';
import RedisStore from 'connect-redis';
import { redisClient } from '../database/redis/config.js';

export const sessionConfig = {
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'hootner-session-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'strict'
  },
  name: 'hootner.sid'
};

export const createSessionMiddleware = () => {
  return session(sessionConfig);
};

export default createSessionMiddleware;
