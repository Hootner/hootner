import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/unit/**/*.test.js'],
    exclude: ['tests/e2e/**', 'tests/security/**', 'tests/electron-code-editor/**', 'tests/advanced-agents.test.js', 'tests/service-integration-hub.test.js']
  }
});