import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const servers = [
  'servers/collab-server.js',
  'servers/electron-code-editor-server.js',
  'servers/hootner-mcp-server.js',
  'servers/html-pages-server.js',
  'servers/hub-app.js',
  'servers/mcp-server.js',
  'servers/secure-server.js',
  'servers/video-player-server.js'
];

console.log('🚀 Starting all servers...\n');

servers.forEach((server) => {
  const serverName = server.split('/')[1];
  const child = spawn('node', [join(__dirname, server)], {
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (err) => {
    console.error(`❌ ${serverName} error:`, err.message);
  });

  console.log(`✅ Started: ${serverName}`);
});

console.log('\n✨ All servers launched!');
console.log('Press Ctrl+C to stop all servers\n');
