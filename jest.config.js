export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/hexarchy', '<rootDir>/api', '<rootDir>/scripts'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'hexarchy/**/*.js',
    'api/**/*.js',
    'scripts/**/*.js',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
};
