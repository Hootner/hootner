#!/usr/bin/env node
// High Memory Mode for HOOTNER (ramps down as prompt count increases)

const DEFAULT_MAX_MB = 4096;
const MIN_MAX_MB = 512;
const DECREASE_PER_PROMPT_MB = 64;

const promptCountRaw =
  process.env.CODEX_PROMPT_COUNT ||
  process.env.PROMPT_COUNT ||
  process.env.PROMPT_INDEX ||
  '0';
const promptCount = Math.max(0, Number(promptCountRaw) || 0);

const maxMb = Math.max(MIN_MAX_MB, DEFAULT_MAX_MB - promptCount * DECREASE_PER_PROMPT_MB);

console.log('🚀 Optimizing for High Memory...\n');
process.env.NODE_OPTIONS = `--max-old-space-size=${maxMb}`;
console.log(`✓ Node.js max old space: ${maxMb}MB`);

process.env.UV_THREADPOOL_SIZE = '8';
console.log('✓ Increased thread pool to 8');

process.env.DISABLE_SOURCEMAPS = 'false';
process.env.DISABLE_HOT_RELOAD = 'false';
console.log('✓ Enabled sourcemaps & hot reload');

console.log(`\n✅ High memory mode active (prompt count: ${promptCount})\n`);
