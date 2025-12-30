const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

const securityConfig = {
  jwt: {
    expiresIn: '1h',
    algorithm: 'HS256' as const,
    issuer: 'hootner',
    secret: jwtSecret,
  },
  session: {
    maxAge: 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
  },
  rateLimit: {
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
};

export default securityConfig;
