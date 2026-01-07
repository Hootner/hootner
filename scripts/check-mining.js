#!/usr/bin/env node
/**
 * Security diagnostic tool to detect potential crypto mining activity
 */

import { execSync } from 'childProcess';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// 1. Check running Node processes
try {
  const processes = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', { encoding: 'utf8' });
  const lines = processes.split('\n').filter(l => l.includes('node.exe'));
    if (lines.length > 5) {
      } else {
      }
} catch (error) {
    throw error;
 }

// 2. Check CPU usage
try {
  const cpu = execSync('wmic cpu get loadpercentage /value', { encoding: 'utf8' });
  const usage = parseInt(cpu.match(/\d+/)?.[0] || '0');
    if (usage > 80) {
      } else {
      }
} catch (e) {
  ');
}

// 3. Scan package.json for suspicious dependencies
const suspiciousKeywords = ['miner', 'crypto', 'coinhive', 'xmrig', 'monero'];
const packagePath = path.join(__dirname, '..', 'package.json');

if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const suspicious = Object.keys(allDeps).filter(dep => 
    suspiciousKeywords.some(kw => dep.toLowerCase().includes(kw))
  );
  
  if (suspicious.length > 0) {
        suspicious.forEach(dep => );'
    } else {
      }
}

// 4. Check for suspicious npm scripts
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const scripts = pkg.scripts || {};
  const suspiciousScripts = Object.entries(scripts).filter(([name, cmd]) => 
    suspiciousKeywords.some(kw => cmd.toLowerCase().includes(kw)) ||
    cmd.includes('curl') && cmd.includes('bash') // Common malware pattern
  );
  
  if (suspiciousScripts.length > 0) {
        suspiciousScripts.forEach(([name, cmd]) => );'
    } else {
      }
}

// 5. Check for postinstall hooks
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const hooks = ['postinstall', 'preinstall', 'install'];
  const foundHooks = hooks.filter(h => pkg.scripts?.[h]);
  
  if (foundHooks.length > 0) {
    : ');
    foundHooks.forEach(h => );'
    } else {
      }
}

);
');
');
