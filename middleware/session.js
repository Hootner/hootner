import session from 'express-session';

/**
 * SESSION_SECRET
 */
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || 'fallback-secret-change-in-production';

/**
 * sessionConfig
 */
export const _sessionConfig = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'strict',
  },
});

if (!process.env.SESSION_SECRET && !process.env.JWT_SECRET) {
  console.warn('⚠️  Using fallback session secret. Set SESSION_SECRET in production!');
}
