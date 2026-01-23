// Lambda handler for GraphQL API
import { handler as graphqlHandler } from './server.js';

export const handler = async (event, context) => {
  // API Gateway proxy integration
  const { body, headers, httpMethod, path } = event;

  try {
    const response = await graphqlHandler({
      body: body ? JSON.parse(body) : null,
      headers,
      method: httpMethod,
      path
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Lambda error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
