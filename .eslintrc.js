export default {
  root: true,
  env: {
    browser: true,
    node: true,
    es2024: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    semi: ['error', 'never'],
    'comma-dangle': ['error', 'only-multiline']
  }
}
