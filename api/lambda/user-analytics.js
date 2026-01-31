import userDetection from '../../hexarchy/7-data/analytics/user-detection.js';

export const handler = async (event) => {
  try {
    const { action } = JSON.parse(event.body || '{}');
    
    let result;
    switch (action) {
      case 'detect':
        result = await userDetection.detectActiveUsers();
        break;
      case 'realtime':
        result = await userDetection.getRealTimeStats();
        break;
      default:
        result = await userDetection.detectActiveUsers();
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: result,
        timestamp: Date.now()
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};