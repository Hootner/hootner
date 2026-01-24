// API Configuration for CloudFront Apps
const API_CONFIG = {
  apiKey: 'REPLACE_WITH_API_GATEWAY_KEY',
  endpoints: {
    graphql: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/graphql',
    videos: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/videos',
    aiVideo: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/ai-video',
    liveStream: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/live-stream',
    editor: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/editor',
    collaboration: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/collaboration',
    messages: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/messages',
    analytics: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/analytics',
    marketplace: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/marketplace',
    agents: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/agents',
    devops: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/devops'
  },
  headers: {
    'x-api-key': 'REPLACE_WITH_API_GATEWAY_KEY',
    'Content-Type': 'application/json'
  }
};

// Fetch helper with API key
async function apiRequest(endpoint, options = {}) {
  return fetch(endpoint, {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers
    }
  });
}

// GraphQL helper
async function graphqlRequest(query, variables = {}) {
  return apiRequest(API_CONFIG.endpoints.graphql, {
    method: 'POST',
    body: JSON.stringify({ query, variables })
  });
}

export { API_CONFIG, apiRequest, graphqlRequest };
