// Mock Services for Testing
export const mockDynamoDB = {
  send: jest.fn().mockResolvedValue({ Item: {} }),
  get: jest.fn().mockResolvedValue({ Item: {} }),
  put: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({})
};

export const mockRedis = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  setEx: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  exists: jest.fn().mockResolvedValue(0)
};

export const mockS3 = {
  send: jest.fn().mockResolvedValue({ ETag: '"mock-etag"' }),
  upload: jest.fn().mockResolvedValue({ Location: 'https://mock-url.com' })
};

export const mockStripe = {
  paymentIntents: {
    create: jest.fn().mockResolvedValue({ id: 'pi_mock', client_secret: 'mock_secret' })
  },
  customers: {
    create: jest.fn().mockResolvedValue({ id: 'cus_mock' })
  }
};

export const mockFirebase = {
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({ user: { uid: 'mock-uid' } }),
  createUserWithEmailAndPassword: jest.fn().mockResolvedValue({ user: { uid: 'mock-uid' } })
};

export default {
  mockDynamoDB,
  mockRedis,
  mockS3,
  mockStripe,
  mockFirebase
};
