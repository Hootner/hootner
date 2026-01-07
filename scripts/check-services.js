#!/usr/bin/env node
import http from 'http';

const services = [
  { name: 'Analytics', port: 3001 },
  { name: 'Audit', port: 3002 },
  { name: 'Auth', port: 3003 },
  { name: 'Moderation', port: 3004 },
  { name: 'Event', port: 3005 },
  { name: 'Marketplace', port: 3006 },
  { name: 'Police Bot', port: 3007 },
  { name: 'Profile', port: 3008 },
  { name: 'Search', port: 3009 },
  { name: 'Security', port: 3010 },
  { name: 'Subscription', port: 3011 },
  { name: 'Video', port: 3012 }
];

const checkPort = (port) => {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, { timeout: 1000 }, () => {
      resolve('🟢 UP');
    });
    req.on('error', () => resolve('🔴 DOWN'));
    req.on('timeout', () => {
      req.destroy();
      resolve('🔴 DOWN');
    });
  });
};

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║           SERVICE STATUS CHECK                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const checkAll = async () => {
  for (const service of services) {
    const status = await checkPort(service.port);
    console.log(`  ${status} ${service.name.padEnd(20)} Port ${service.port}`);
  }
  console.log('\n');
};

checkAll();
