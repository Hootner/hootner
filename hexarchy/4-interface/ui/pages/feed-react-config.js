/**
 * Feed React Page Configuration
 * Backend API Configuration
 */

// Backend API Configuration
const API_CONFIG = {
  VIDEO_API: (window.HOOTNER_CONFIG?.API_BASE_URL || 'http://localhost:5003'),
  GRAPHQL_API: (window.HOOTNER_CONFIG?.GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'),
  ANALYTICS_API: ((window.HOOTNER_CONFIG?.API_BASE_URL || 'http://localhost:5003') + '/api/analytics'),
  WATCH_PARTY_WS: ((window.HOOTNER_CONFIG?.API_BASE_URL || 'ws://localhost:5004').replace('http','ws'))
};

// Make API_CONFIG available globally
window.API_CONFIG = API_CONFIG;
