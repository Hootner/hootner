import { spawn } from 'child_process';

console.log('🦉 Starting HOOTNER Transformer System...\n');

// Start API server in background
const api = spawn('node', ['services/llm-api-server.js'], { shell: true, detached: true });
api.stdout.on('data', (data) => console.log(data.toString()));
api.stderr.on('data', (data) => console.error(data.toString()));
api.unref();

console.log('✅ API server started in background\n');

// Train model in foreground
const train = spawn('python', ['services/transformer-llm-service.py'], { stdio: 'inherit', shell: true });

train.on('close', (code) => {
  console.log(`\n✨ Training complete (exit code ${code})`);
});
