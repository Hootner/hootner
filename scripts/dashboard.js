#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const dashboard = {
  timestamp: new Date().toISOString(),
  
  // Quick Stats
  stats: {
    servers: fs.readdirSync(path.join(root, 'servers')).filter(f => f.endsWith('.js')).length,
    services: fs.readdirSync(path.join(root, 'services')).filter(f => f.endsWith('.js')).length,
    agents: fs.readdirSync(path.join(root, '.amazonq/agents')).filter(f => f.startsWith('layer')).length,
    middleware: fs.readdirSync(path.join(root, 'middleware')).filter(f => f.endsWith('.js')).length,
    scripts: fs.readdirSync(path.join(root, 'scripts')).filter(f => f.endsWith('.js')).length,
    logs: fs.existsSync(path.join(root, 'logs')) ? 
      fs.readdirSync(path.join(root, 'logs'), { recursive: true }).filter(f => f.endsWith('.log')).length : 0
  },
  
  // Active Logs (last 24h)
  recentLogs: [],
  
  // TODO Count
  todos: 0,
  
  // File Sizes
  sizes: {
    trainingData: '0 MB',
    logs: '0 MB',
    nodeModules: '0 MB'
  }
};

// Get recent logs
const logsDir = path.join(root, 'logs');
if (fs.existsSync(logsDir)) {
  const logFiles = fs.readdirSync(logsDir, { recursive: true })
    .filter(f => f.endsWith('.log'))
    .map(f => {
      const fullPath = path.join(logsDir, f);
      const stats = fs.statSync(fullPath);
      return {
        file: f,
        size: `${(stats.size / 1024).toFixed(2)} KB`,
        modified: stats.mtime.toISOString()
      };
    })
    .sort((a, b) => new Date(b.modified) - new Date(a.modified))
    .slice(0, 5);
  
  dashboard.recentLogs = logFiles;
}

// Count TODOs
const scanForTodos = (dir) => {
  let count = 0;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory() && !['node_modules', '.git', 'logs'].includes(file.name)) {
      count += scanForTodos(fullPath);
    } else if (file.isFile() && file.name.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      count += (content.match(/TODO|FIXME|HACK|XXX/g) || []).length;
    }
  }
  return count;
};

dashboard.todos = scanForTodos(root);

// Output
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║           HOOTNER PROJECT DASHBOARD                       ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📊 QUICK STATS');
console.log('─────────────────────────────────────────────────────────────');
console.log(`  Servers:      ${dashboard.stats.servers}`);
console.log(`  Services:     ${dashboard.stats.services}`);
console.log(`  AI Agents:    ${dashboard.stats.agents} layers`);
console.log(`  Middleware:   ${dashboard.stats.middleware}`);
console.log(`  Scripts:      ${dashboard.stats.scripts}`);
console.log(`  Active Logs:  ${dashboard.stats.logs}`);
console.log(`  TODOs:        ${dashboard.todos}\n`);

console.log('📝 RECENT LOGS (Last 5)');
console.log('─────────────────────────────────────────────────────────────');
if (dashboard.recentLogs.length > 0) {
  dashboard.recentLogs.forEach(log => {
    console.log(`  ${log.file.padEnd(40)} ${log.size.padStart(10)}`);
  });
} else {
  console.log('  No logs found');
}

console.log('\n⏰ Last Updated:', dashboard.timestamp);
console.log('\n💡 Run "npm run dashboard" to refresh\n');

// Save to file
fs.writeFileSync(
  path.join(root, 'docs/reports/dashboard.json'),
  JSON.stringify(dashboard, null, 2)
);
