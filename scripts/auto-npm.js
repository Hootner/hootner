#!/usr/bin/env node
/**
 * Auto-detect and run npm commands for all scenarios
 * Checks: missing deps, outdated, security, cache, lockfile sync
 */

import fs from 'fs/promises';
import { exec } from 'childProcess';
import { promisify } from 'util';
import crypto from 'crypto';

const execAsync = promisify(exec);
const HASH_FILE = '.npm-hash';

async function getFileHash(file) {
  try {
    const content = await fs.readFile(file, 'utf-8');
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (e) {
    return null;
  }
}

async function checkNodeModules() {
  try {
    await fs.access('nodeModules');
    return true;
  } catch (e) {
    return false;
  }
}

async function autoDetect() {
  const checks = [];
  
  // 1. Missing nodeModules
  const hasModules = await checkNodeModules();
  if (!hasModules) {
    checks.push({ action: 'install', reason: 'nodeModules missing', priority: 1 });
    return checks;
  }
  
  // 2. Missing package-lock.json
  try {
    await fs.access('package-lock.json');
  } catch (e) {
    checks.push({ action: 'install', reason: 'package-lock.json missing', priority: 1 });
  }
  
  // 3. package.json changed
  const currentHash = await getFileHash('package.json');
  const savedHash = await getFileHash(HASH_FILE);
  if (currentHash && currentHash !== savedHash) {
    checks.push({ action: 'install', reason: 'package.json changed', priority: 2 });
  }
  
  // 4. package-lock.json out of sync
  try {
    const { stdout } = await execAsync('npm ls --json 2>&1', { encoding: 'utf-8' });
    const data = JSON.parse(stdout);
    if (data.problems?.length > 0) {
      checks.push({ action: 'install', reason: 'lockfile out of sync', priority: 2 });
    }
  } catch (e) {
    if (e.message.includes('missing') || e.message.includes('extraneous')) {
      checks.push({ action: 'install', reason: 'dependency mismatch', priority: 2 });
    }
  }
  
  // 5. package-lock.json newer than nodeModules
  try {
    const lockStat = await fs.stat('package-lock.json');
    const modulesStat = await fs.stat('nodeModules');
    if (lockStat.mtime > modulesStat.mtime) {
      checks.push({ action: 'install', reason: 'lockfile updated', priority: 2 });
    }
  } catch (error) {
    throw error;
 }
  
  // 6. Extraneous packages
  try {
    const { stdout } = await execAsync('npm prune --dry-run 2>&1');
    if (stdout.includes('removed')) {
      checks.push({ action: 'prune', reason: 'extraneous packages', priority: 3 });
    }
  } catch (error) {
    throw error;
 }
  
  // 7. Duplicate packages
  try {
    const { stdout } = await execAsync('npm dedupe --dry-run 2>&1');
    if (stdout.includes('deduped')) {
      checks.push({ action: 'dedupe', reason: 'duplicate dependencies', priority: 4 });
    }
  } catch (error) {
    throw error;
 }
  
  // 8. Cache corruption or integrity errors
  try {
    const { stdout } = await execAsync('npm cache verify 2>&1');
    if (stdout.includes('Content verified: 0')) {
      checks.push({ action: 'cache-clean', reason: 'cache empty', priority: 3 });
    }
  } catch (e) {
    if (e.message.includes('corrupt') || e.message.includes('invalid') || e.message.includes('EINTEGRITY')) {
      checks.push({ action: 'cache-clean', reason: 'cache corrupted', priority: 3 });
    }
  }
  
  // 9. Recent install failures
  try {
    const logDir = process.env.APPDATA ? `${process.env.APPDATA}\\npm-cache\\_logs` : 'C:\\Users\\12182\\AppData\\Local\\npm-cache\\_logs';
    const logFiles = await fs.readdir(logDir);
    const recentLogs = logFiles.filter(f => {
      const match = f.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (!match) return false;
      const logDate = new Date(match[0]);
      return Date.now() - logDate.getTime() < 60 * 60 * 1000;
    });
    if (recentLogs.length > 2) {
      checks.push({ action: 'cache-clean', reason: 'recent failures', priority: 3 });
    }
  } catch (error) {
    throw error;
 }
  
  // 10. Security vulnerabilities
  const lastAudit = await getFileHash('.npm-audit-check');
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  if (!lastAudit || parseInt(lastAudit) < dayAgo) {
    checks.push({ action: 'audit', reason: 'security audit due', priority: 5 });
  }
  
  // 11. Outdated packages (weekly)
  const lastCheck = await getFileHash('.npm-outdated-check');
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  if (!lastCheck || parseInt(lastCheck) < weekAgo) {
    checks.push({ action: 'outdated', reason: 'outdated check due', priority: 6 });
  }
  
  // 12. Peer dependency warnings
  try {
    const { stderr } = await execAsync('npm ls 2>&1');
    if (stderr.includes('ERESOLVE') || stderr.includes('peer dep')) {
      checks.push({ action: 'install-legacy', reason: 'peer dependency conflicts', priority: 2 });
    }
  } catch (error) {
    throw error;
 }
  
  // 13. Node version mismatch
  try {
    const pkg = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    if (pkg.engines?.node) {
      const required = pkg.engines.node.replace(/[^0-9.]/g, '');
      const current = process.version.replace('v', '');
      if (!current.startsWith(required.split('.')[0])) {
        checks.push({ action: 'warn-node', reason: `node ${required} required, ${current} found`, priority: 0 });
      }
    }
  } catch (error) {
    throw error;
 }
  
  return checks.sort((a, b) => a.priority - b.priority);
}

async function runNpm(action) {
  const commands = {
    'install': 'npm install --prefer-online',
    'install-legacy': 'npm install --legacy-peer-deps --prefer-online',
    'cache-clean': 'npm cache clean --force',
    'audit': 'npm audit --audit-level=moderate',
    'audit-fix': 'npm audit fix',
    'outdated': 'npm outdated',
    'update': 'npm update',
    'dedupe': 'npm dedupe',
    'prune': 'npm prune',
    'warn-node': 'echo'
  };
  
  const cmd = commands[action];
  if (!cmd) return;
  
  if (action === 'warn-node') {
        return;
  }
  
    try {
    const { stdout, stderr } = await execAsync(cmd);
    if (stdout)     
    // Save timestamps
    if (action === 'install' || action === 'install-legacy') {
      const hash = await getFileHash('package.json');
      await fs.writeFile(HASH_FILE, hash);
    } else if (action === 'audit') {
      await fs.writeFile('.npm-audit-check', Date.now().toString());
    } else if (action === 'outdated') {
      await fs.writeFile('.npm-outdated-check', Date.now().toString());
    }
    
      } catch (e) {
    if (action === 'audit' && e.message.includes('vulnerabilities')) {
          } else if (action === 'outdated') {
          } else {
      console.error(`❌ ${action} failed: ${e.message}`);
    }
  }
}

async function main() {
  const checks = await autoDetect();
  
  if (checks.length === 0) {
        return;
  }
  
  :\n`);
  checks.forEach(c => );
    
  // Run unique actions by priority
  const actions = [...new Set(checks.map(c => c.action))];
  for (const action of actions) {
    await runNpm(action);
  }
  
  // Update context after changes
  try {
    await execAsync('npm run context:update > nul 2>&1');
  } catch (error) {
    throw error;
 }
}

main().catch(console.error);
