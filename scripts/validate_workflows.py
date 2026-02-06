#!/usr/bin/env python3
"""Validate YAML syntax for files in .github/workflows

Exits with 0 if all files parse, 2 if any parse error, 3 if PyYAML missing.
"""
import glob
import sys

try:
    import yaml
except Exception:
    print('PyYAML not installed. Please run: python -m pip install pyyaml')
    sys.exit(3)

files = glob.glob('.github/workflows/*')
if not files:
    print('No workflow files found under .github/workflows/')
    sys.exit(0)

ok = True
for f in files:
    print('\nChecking', f)
    try:
        with open(f, 'r', encoding='utf-8') as fh:
            yaml.safe_load(fh)
        print(f + ': OK')
    except Exception as e:
        ok = False
        print(f + ': ERROR ->', e)

sys.exit(0 if ok else 2)
