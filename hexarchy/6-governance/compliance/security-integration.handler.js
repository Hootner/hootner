import securityIntegration from './security-integration.js'

export const handler = async (event) => {
  try {
    const { endpoint, request } = JSON.parse(event.body || '{}')
    
    const scanResult = await securityIntegration.scanAPIEndpoint(endpoint, request)
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        scanResult
      })
    }
  } catch (error) {
    console.error('Security scan error:', error)
    
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
    }
  }
}