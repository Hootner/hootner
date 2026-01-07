#!/usr/bin/env node
/**
 * Minimal TODO tree manager for HOOTNER project
 */
const fs = require('fs');

function parse(lines) { const tree = [], stack = [tree];
  for (const line of lines) { const s = line.trimEnd();
    if (!s) continue;
    const indent = line.length - line.trimStart().length;
    const task = { text: s.trimStart(), sub: [], lvl: Math.floor(indent / 4) };
    while (stack.length > task.lvl + 1) stack.pop();
    stack[stack.length - 1].push(task);
    stack.push(task.sub); }
  return tree; }

function show(tasks, pre = '') { tasks.forEach((t, i) => { const conn = i === tasks.length - 1 ? '└─ ' : '├─ ';
        show(t.sub, pre + (i === tasks.length - 1 ? '    ' : '│   ')); }); }

function toggle(tasks, kw) { let found = false;
  for (const t of tasks) { if (t.text.toLowerCase().includes(kw.toLowerCase())) { if (t.text.includes('[x]')) t.text = t.text.replace('[x]', '[ ]');
      else if (t.text.includes('[ ]')) t.text = t.text.replace('[ ]', '[x]');
      else t.text += ' [x]';
      found = true; }
    found |= toggle(t.sub, kw); }
  return found; }

function search(tasks, kw, res = []) { for (const t of tasks) { if (t.text.toLowerCase().includes(kw.toLowerCase())) res.push(t.text);
    search(t.sub, kw, res); }
  return res; }

function toLines(tasks, lvl = 0) { const lines = [];
  for (const t of tasks) { lines.push('    '.repeat(lvl) + t.text);
    lines.push(...toLines(t.sub, lvl + 1)); }
  return lines; }

const [,, file, cmd, ...args] = process.argv;
if (!file || !cmd) { process.exit(1); }

const tree = fs.existsSync(file) ? parse(fs.readFileSync(file, 'utf8').split('\n')) : [];

if (cmd === 'show') { show(tree); } else if (cmd === 'done' && args[0]) { if (toggle(tree, args[0])) { fs.writeFileSync(file, toLines(tree).join('\n') + '\n'); } else { } } else if (cmd === 'search' && args[0]) { const res = search(tree, args[0]);
   : '✗ No match'); } else { process.exit(1); }
