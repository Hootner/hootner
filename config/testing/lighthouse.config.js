const { LIMITS } = require('./constants');
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: LIMITS.LIGHTHOUSE_MAX_SIZE,
      cpuSlowdownMultiplier: 1,
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: LIMITS.LIGHTHOUSE_WIDTH,
      deviceScaleFactor: 1,
      disabled: false,
    },
  },
  audits: [
    'metrics/first-contentful-paint',
    'metrics/largest-contentful-paint',
    'metrics/cumulative-layout-shift',
    'metrics/total-blocking-time',
  ],
};
