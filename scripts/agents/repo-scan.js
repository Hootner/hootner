#!/usr/bin/env node

import RepoScanAgent from '../../frameworks/ai/agents/repo-scan-agent.js';

function parseArgs(argv) {
  const args = new Map();
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const [key, rawValue] = token.slice(2).split('=');
    args.set(key, rawValue ?? true);
  }
  return args;
}

const args = parseArgs(process.argv);
const rootDir = args.get('path') === true ? process.cwd() : (args.get('path') || process.cwd());

const agent = new RepoScanAgent({ rootDir });
await agent.start();

const report = await agent.scan({
  maxFiles: args.get('maxFiles') ? Number(args.get('maxFiles')) : undefined,
  maxFileSizeBytesToRead: args.get('maxReadBytes') ? Number(args.get('maxReadBytes')) : undefined,
  maxFileSizeBytesToScan: args.get('maxScanBytes') ? Number(args.get('maxScanBytes')) : undefined,
});

await agent.stop();

console.log('✅ Repo scan complete');
console.log('JSON:', report.output.json);
console.log('MD:  ', report.output.markdown);
