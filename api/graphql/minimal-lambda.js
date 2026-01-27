// Minimal working Lambda handler
export const handler = async (event) => {
  console.log('Lambda invoked with event:', JSON.stringify(event, null, 2));

  try {
    const path = event.requestContext?.http?.path || event.path || '/';

    // If requesting frontend files, redirect to S3
    if (path.startsWith('/frontend/')) {
      return {
        statusCode: 302,
        headers: {
          'Location': `https://hootner-uploads-504165876439.s3.amazonaws.com${path}`,
          'Access-Control-Allow-Origin': '*'
        }
      };
    }

    // Handle different API paths
    if (path === '/pricing' || path.includes('pricing')) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          pricing: {
            starter: { price: 49.99, users: 100, videos: 50, storage: '10GB' },
            growth: { price: 149.99, users: 500, videos: 200, storage: '50GB' },
            enterprise: { price: 999.99, users: 10000, videos: 1000, storage: '500GB' }
          },
          lifecycle: {
            currentMonth: 1,
            totalMonths: 120,
            priceDecreaseRate: 0.83
          }
        })
      };
    }

    // Default GraphQL response
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        data: {
          platform: 'HOOTNER',
          status: 'running',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          message: '🎉 HOOTNER Platform is Live with CloudFront CDN!',
          endpoints: {
            graphql: '/graphql',
            videos: '/videos/',
            uploads: '/uploads/',
            frontend: '/frontend/',
            pricing: '/pricing'
          },
          urls: {
            frontend: 'https://hootner-uploads-504165876439.s3.amazonaws.com/frontend/index.html',
            pricing: 'https://hootner-uploads-504165876439.s3.amazonaws.com/frontend/pricing.html',
            dashboard: 'https://hootner-uploads-504165876439.s3.amazonaws.com/frontend/dashboard.html'
          }
        }
      })
    };
    console.log('Returning response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('Lambda error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
