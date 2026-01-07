#!/usr/bin/env python3
"""Minimal TODO tree manager for HOOTNER project."""
import sys
import json
from pathlib import Path
from typing import List, Dict

def parse(lines: List[str]) -> List[Dict]:
    """Parse indented lines into tree."""
    tree, stack = [], [tree]
    for line in lines:
        s = line.rstrip()
        if not s: continue
        indent = len(line) - len(line.lstrip())
        task = {'text': s.lstrip(), 'sub': [], 'lvl': indent // 4}
        while len(stack) > task['lvl'] + 1: stack.pop()
        stack[-1].append(task)
        stack.append(task['sub'])
    return tree

def show(tasks: List[Dict], pre: str = "") -> None:
    """Display tree."""
    for i, t in enumerate(tasks):
        conn = "└─ " if i == len(tasks) - 1 else "├─ "
        print(f"{pre}{conn}{t['text']}")
        show(t['sub'], pre + ("    " if i == len(tasks) - 1 else "│   "))

def toggle(tasks: List[Dict], kw: str) -> bool:
    """Toggle [ ] <-> [x]."""
    found = False
    for t in tasks:
        if kw.lower() in t['text'].lower():
            if '[x]' in t['text']: t['text'] = t['text'].replace('[x]', '[ ]')
            elif '[ ]' in t['text']: t['text'] = t['text'].replace('[ ]', '[x]')
            else: t['text'] += ' [x]'
            found = True
        found |= toggle(t['sub'], kw)
    return found

def search(tasks: List[Dict], kw: str, res: List[str]) -> None:
    """Find matching tasks."""
    for t in tasks:
        if kw.lower() in t['text'].lower(): res.append(t['text'])
        search(t['sub'], kw, res)

def to_lines(tasks: List[Dict], lvl: int = 0) -> List[str]:
    """Convert tree to indented lines."""
    lines = []
    for t in tasks:
        lines.append('    ' * lvl + t['text'])
        lines.extend(to_lines(t['sub'], lvl + 1))
    return lines

def main():
    if len(sys.argv) < 3:
        print("Usage: python todo-tree.py <file> <show|done|search> [args]")
        sys.exit(1)
    
    file, cmd = Path(sys.argv[1]), sys.argv[2]
    tree = parse(file.read_text().splitlines()) if file.exists() else []
    
    if cmd == 'show':
        show(tree)
    elif cmd == 'done' and len(sys.argv) > 3:
        if toggle(tree, sys.argv[3]):
            file.write_text('\n'.join(to_lines(tree)) + '\n')
            print("✓ Saved")
        else:
            print("✗ No match")
    elif cmd == 'search' and len(sys.argv) > 3:
        res = []
        search(tree, sys.argv[3], res)
        print('\n'.join(res) if res else "✗ No match")
    else:
        print("Commands: show | done <keyword> | search <keyword>")
        sys.exit(1)

if __name__ == '__main__':
    main()
