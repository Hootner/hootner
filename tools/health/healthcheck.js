const http = require('http');
const { HTTP_STATUS, TIMEOUTS, LIMITS } = require('./constants');'/

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health','/
  method: 'GET',
  timeout: TIMEOUTS.FIVE_SECONDS,
  headers: {
    'User-Agent': 'Hootner-HealthCheck/1.0','/
    'X-Health-Check': 'true
  }'
    };

const req = http.request(options, (res) => {
  res.on('error', (err) => {
    console.error('Health check response error: ', err.message);
    process.exit(1);'
    });
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
    if (data.length > LIMITS.LIGHTHOUSE_MAX_SIZE) {
      console.error('Health check response too large');
      res.destroy();
      process.exit(1);
    }
  });
  
  res.on('end', () => {
    if (res.statusCode === HTTP_STATUS.OK) {
            process.exit(0);
    } else {
      console.error('Health check failed with status: ', res.statusCode);
      process.exit(1);
    }
  });'
    });

req.on('error', (err) => {
  console.error('Health check request error: ', err.message);
  process.exit(1);'
    });

req.on('timeout', () => {
  console.error('Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();