import rootConfig from '../../eslint.config.js';
const { MISC } = require('../../constants');
export default [
  ...rootConfig,
  { files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: { parserOptions: { ecmaVersion: MISC.YEAR_2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true, }, }, }, },
];
