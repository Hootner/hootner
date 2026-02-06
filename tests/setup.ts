process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.TEST_JWT_SECRET || `test-${Math.random().toString(36).substring(2)}-${Date.now()}`;
process.env.SESSION_SECRET = process.env.TEST_SESSION_SECRET || `test-${Math.random().toString(36).substring(2)}-${Date.now()}`;