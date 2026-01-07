import { spawn } from 'child_process';
import fs from 'fs';

console.log('🦉 HOOTNER Live Training System\n');

// Start MCP server in background
console.log('🚀 Starting MCP server...');
const mcp = spawn('node', ['servers/hootner-mcp-server.js'], { 
  detached: true,
  stdio: 'ignore'
});
mcp.unref();

// Start transformer training with live data updates
console.log('🧠 Starting transformer with PyTorch GPT...\n');

const datasets = [
  'training-mcp-session.txt',
  'training-fragment-1.txt',
  'training-fragment-2.txt',
  'training-fragment-3.txt',
  'training-fragment-4.txt',
  'training-fragment-5.txt'
];

for (const dataset of datasets) {
  console.log(`\n📊 Training on: ${dataset}`);
  
  // Update training file
  const content = fs.readFileSync(`services/${dataset}`, 'utf-8');
  fs.writeFileSync('services/current-training.txt', content);
  
  // Train
  const train = spawn('python', ['services/transformer-llm-service.py'], {
    stdio: 'inherit',
    shell: true
  });
  
  await new Promise(resolve => train.on('close', resolve));
}

console.log('\n✅ All training complete!');
