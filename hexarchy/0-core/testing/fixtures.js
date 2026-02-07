// Test Fixtures
export const fixtures = {
  user: {
    id: 'test-user-123',
    email: 'test@hootner.com',
    username: 'testuser',
    role: 'user',
    createdAt: '2026-01-01T00:00:00Z'
  },

  video: {
    id: 'test-video-123',
    title: 'Test Video',
    description: 'Test video description',
    url: 'https://example.com/video.mp4',
    userId: 'test-user-123',
    views: 100,
    likes: 10,
    createdAt: '2026-01-01T00:00:00Z'
  },

  comment: {
    id: 'test-comment-123',
    videoId: 'test-video-123',
    userId: 'test-user-123',
    text: 'Great video!',
    createdAt: '2026-01-01T00:00:00Z'
  },

  payment: {
    id: 'test-payment-123',
    userId: 'test-user-123',
    amount: 9.99,
    currency: 'usd',
    status: 'succeeded',
    createdAt: '2026-01-01T00:00:00Z'
  }
};

export const createFixture = (type, overrides = {}) => {
  return { ...fixtures[type], ...overrides };
};

export default fixtures;
