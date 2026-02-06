#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_EXCLUDED_DIRS = new Set([
  '.git',
  'node_modules',
  '.aws-sam',
  'dist',
  'build',
  'coverage',
  '.nyc_output',
  '.venv',
  'venv',
  '__pycache__',
  '.idea',
  '.vscode',
  'logs',
  'dynamodb-local',
])

function parseArgs(argv) {
  const args = {
    root: null,
    out: null,
    excludeDefaults: false,
    exclude: [],
    maxEntries: 250_000,
  }

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]

    if (token === '--root') {
      args.root = argv[++i] ?? null
      continue
    }

    if (token === '--out') {
      args.out = argv[++i] ?? null
      continue
    }

    if (token === '--exclude-defaults') {
      args.excludeDefaults = true
      continue
    }

    if (token === '--exclude') {
      const value = argv[++i]
      if (value) args.exclude.push(value)
      continue
    }

    if (token === '--max-entries') {
      const value = Number(argv[++i])
      if (Number.isFinite(value) && value > 0) args.maxEntries = Math.floor(value)
      continue
    }
  }

  return args
}

function normalizeToBackslashes(p) {
  return p.replaceAll('/', '\\')
}

function addParentDirs(dirs, filePathPosix) {
  const parts = filePathPosix.split('/')
  // Skip the filename itself
  for (let i = 1; i < parts.length; i++) {
    const dir = parts.slice(0, i).join('/')
    if (dir) dirs.add(dir)
  }
}

function toPosixRelativePath(rootDir, absolutePath) {
  const rel = path.relative(rootDir, absolutePath)
  // Normalize to posix so sorting & parent-dir derivation is consistent.
  return rel.split(path.sep).join('/')
}

async function walk(rootDir, options) {
  const { excludedDirs, maxEntries } = options

  const files = []
  const dirs = new Set()

  /** @type {string[]} */
  const queue = [rootDir]

  while (queue.length > 0) {
    const currentDir = queue.pop()
    if (!currentDir) continue

    let entries
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true })
    } catch {
      continue
    }

    for (const entry of entries) {
      const absPath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        if (excludedDirs.has(entry.name)) {
          continue
        }

        const relPosix = toPosixRelativePath(rootDir, absPath)
        if (relPosix && relPosix !== '.') {
          dirs.add(relPosix)
        }

        queue.push(absPath)
        continue
      }

      if (entry.isSymbolicLink()) {
        // Avoid surprising traversal / cycles.
        continue
      }

      if (entry.isFile()) {
        const relPosix = toPosixRelativePath(rootDir, absPath)
        if (relPosix && relPosix !== '.') {
          files.push(relPosix)
          addParentDirs(dirs, relPosix)

          if (dirs.size + files.length > maxEntries) {
            throw new Error(
              `Tree exceeded --max-entries=${maxEntries}. ` +
                `Use --exclude-defaults and/or repeated --exclude <dirName> to shrink the scan.`
            )
          }
        }
      }
    }
  }

  return { dirs: [...dirs], files }
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url))

  const args = parseArgs(process.argv.slice(2))
  const repoRoot = args.root ? path.resolve(args.root) : path.resolve(scriptDir, '..')

  // Always skip .git for sanity/perf.
  const excludedDirs = new Set(['.git'])
  if (args.excludeDefaults) {
    for (const dirName of DEFAULT_EXCLUDED_DIRS) excludedDirs.add(dirName)
  }
  for (const dirName of args.exclude) excludedDirs.add(dirName)

  const { dirs, files } = await walk(repoRoot, { excludedDirs, maxEntries: args.maxEntries })

  const entries = [...dirs, ...files]
    .map(normalizeToBackslashes)
    .sort((a, b) => a.localeCompare(b, 'en'))

  const outFile = args.out
    ? path.resolve(args.out)
    : path.join(repoRoot, 'Projects', 'PROJECT_TREE_STRUCTURE.txt')
  await fs.mkdir(path.dirname(outFile), { recursive: true })
  await fs.writeFile(outFile, entries.join('\r\n') + '\r\n', 'utf8')

  process.stdout.write(
    `Wrote ${entries.length} entries to ${outFile} ` +
      `(excludedDirs=${excludedDirs.size}, maxEntries=${args.maxEntries})\n`
  )
}

main().catch(err => {
  console.error(err?.stack || String(err))
  process.exitCode = 1
})
