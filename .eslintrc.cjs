module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  extends: ['eslint:recommended', 'plugin:security/recommended'],
  plugins: ['security'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-pseudoRandomBytes': 'error'
  },
  overrides: [
    {
      files: ['scripts/mongo-init.js'],
      env: {
        mongo: true
      },
      globals: {
        db: 'readonly'
      }
    }
  ],
  ignorePatterns: ['*.ts', '*.tsx', 'node_modules/', 'dist/', 'build/', '.aws-sam/']
};