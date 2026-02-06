// Feature Flags Configuration
export const features = {
  // AI Features
  aiVideoGeneration: process.env.FEATURE_AI_VIDEO === 'true',
  aiRecommendations: process.env.FEATURE_AI_RECOMMENDATIONS === 'true',

  // Real-time Features
  watchParties: process.env.FEATURE_WATCH_PARTIES !== 'false', // Enabled by default
  liveStreaming: process.env.FEATURE_LIVE_STREAMING === 'true',
  realtimeComments: process.env.FEATURE_REALTIME_COMMENTS !== 'false',

  // Payment Features
  subscriptions: process.env.FEATURE_SUBSCRIPTIONS === 'true',
  tipping: process.env.FEATURE_TIPPING === 'true',

  // Social Features
  socialFeed: process.env.FEATURE_SOCIAL_FEED !== 'false',
  messaging: process.env.FEATURE_MESSAGING === 'true',

  // Admin Features
  analytics: process.env.FEATURE_ANALYTICS !== 'false',
  adminPanel: process.env.FEATURE_ADMIN_PANEL !== 'false',

  // Performance
  caching: process.env.FEATURE_CACHING !== 'false',
  cdn: process.env.FEATURE_CDN !== 'false',
  compression: process.env.FEATURE_COMPRESSION !== 'false'
};

export const isFeatureEnabled = (featureName) => {
  return features[featureName] === true;
};

export const getEnabledFeatures = () => {
  return Object.entries(features)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);
};

export default { features, isFeatureEnabled, getEnabledFeatures };
