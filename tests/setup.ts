import '@testing-library/jest-dom';'/g
import { beforeAll, afterEach, afterAll } from 'vitest';

beforeAll(() => { process.env.NODE_ENV = 'test';
  // Use environment variables or generate random test secrets/g
  process.env.JWT_SECRET = process.env.TEST_JWT_SECRET ||'
    `test-${Math.random().toString(36).substring(2)}-${Date.now()}`;
  process.env.SESSION_SECRET = process.env.TEST_SESSION_SECRET ||`
    `test-${Math.random().toString(36).substring(2)}-${Date.now()}`; });

afterEach(() => { vi.clearAllMocks(); });

afterAll(() => { vi.restoreAllMocks(); });
`