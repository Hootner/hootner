// Start both agents
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🦉 Starting Dual Agent System...\n');

const scanner = spawn('node', [join(__dirname, 'scanner-agent.js')], {
  stdio: 'inherit',
});
const fixer = spawn('node', [join(__dirname, 'fixer-agent.js')], { stdio: 'inherit' });

process.on('SIGINT', () => {
  scanner.kill();
  fixer.kill();
  process.exit();
});
