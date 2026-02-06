# HTML Page Archives

This folder holds rotated copies of the static HTML pages from `apps/frontend/html-pages/`.

## Why this exists

We previously used `*.backup.html` files in the main deploy directory.
That made deploys/rollbacks noisy and hard to manage.

Now, older copies are stored under `_archive/` in timestamped folders.

## Layout

- `_archive/legacy-backups/<timestamp>/`  
  Legacy `*.backup.html` files migrated here and renamed back to their original `*.html` names.

- `_archive/<timestamp>/`  
  New rotations created by `scripts/consolidate-html-files.js` when it needs to replace an existing page with a different one.

## Rotation workflow

- **During consolidation**: `scripts/consolidate-html-files.js` automatically archives the previous version before replacing it.
- **Manual cleanup**: `scripts/cleanup-html-backups.js` migrates any remaining legacy `*.backup.html` files into `_archive/legacy-backups/`.
