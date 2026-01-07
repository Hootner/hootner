// Test LLM API endpoints
const http = require('http');

function testAPI(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3100,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve(JSON.parse(body)));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('Testing LLM API on port 3100...\n');

  // Test 1: Generate text
  console.log('1. Generate text from "hootner":');
  const gen1 = await testAPI('/api/llm/generate', { prompt: 'hootner', length: 20 });
  console.log(`   ${gen1.generated}\n`);

  // Test 2: Generate from "video"
  console.log('2. Generate text from "video":');
  const gen2 = await testAPI('/api/llm/generate', { prompt: 'video', length: 15 });
  console.log(`   ${gen2.generated}\n`);

  // Test 3: Predict next word
  console.log('3. Predict next word after "platform":');
  const pred = await testAPI('/api/llm/predict', { word: 'platform' });
  console.log(`   Next word: ${pred.prediction}\n`);

  console.log('✅ All tests completed!');
}

runTests().catch(console.error);
