module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    'security.spec.js', // Playwright tests
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!jest.config.cjs'
  ],
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  verbose: true,
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};
