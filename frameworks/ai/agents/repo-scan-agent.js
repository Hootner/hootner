import fs from 'node:fs/promises'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const DEFAULT_IGNORED_DIR_NAMES = new Set([
  '.git',
  'node_modules',
  '.next',
  '.turbo',
  '.cache',
  'dist',
  'build',
  'coverage',
  '.venv',
  'venv',
  '__pycache__',
])

const DEFAULT_IGNORED_FILE_NAMES = new Set(['package-lock.json'])

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.svg',
  '.pdf',
  '.zip',
  '.gz',
  '.7z',
  '.tar',
  '.mp4',
  '.mov',
  '.webm',
  '.mp3',
  '.wav',
  '.ttf',
  '.otf',
  '.woff',
  '.woff2',
  '.exe',
  '.dll',
  '.pdb',
  '.class',
  '.jar',
])

function safeNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback
}

function coerceBool(value, defaultValue) {
  if (typeof value === 'boolean') return value
  return defaultValue
}

function toPosix(p) {
  return p.split(path.sep).join('/')
}

function nowIso() {
  return new Date().toISOString()
}

function tryGit(cwd, args) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return null
  }
}

function getTopLevelDir(relPath) {
  const parts = relPath.split('/')
  return parts.length ? parts[0] : '.'
}

function addCount(map, key, inc = 1) {
  map.set(key, (map.get(key) ?? 0) + inc)
}

function sortEntriesDesc(map) {
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}

function isProbablyText(buffer) {
  const max = Math.min(buffer.length, 4096)
  for (let i = 0; i < max; i++) {
    if (buffer[i] === 0) return false
  }
  return true
}

function countNewlines(str, endIndexExclusive) {
  let count = 0
  for (let i = 0; i < endIndexExclusive; i++) {
    if (str.charCodeAt(i) === 10) count++
  }
  return count
}

function recordFinding(findings, category, item, maxExamples) {
  const bucket = (findings[category] ??= { count: 0, examples: [] })
  bucket.count++
  if (bucket.examples.length < maxExamples) bucket.examples.push(item)
}

function makeMarkdownSummary(report) {
  const lines = []
  lines.push(`# Repo Scan Report`)
  lines.push('')
  lines.push(`- Scanned at: ${report.metadata.scannedAt}`)
  lines.push(`- Root: ${report.metadata.rootDir}`)
  if (report.metadata.git?.branch) lines.push(`- Git branch: ${report.metadata.git.branch}`)
  if (report.metadata.git?.commit) lines.push(`- Git commit: ${report.metadata.git.commit}`)
  lines.push(`- Files: ${report.counts.totalFiles}`)
  lines.push(`- Text scanned: ${report.counts.textFilesScanned}`)
  lines.push(`- Skipped (binary/too large): ${report.counts.filesSkipped}`)
  lines.push('')

  lines.push(`## Findings`)
  lines.push('')
  const f = report.findings
  const categories = [
    ['conflictMarkers', 'Conflict markers'],
    ['secrets', 'Secrets-like tokens'],
    ['riskyApis', 'Risky APIs'],
    ['todos', 'TODO/FIXME'],
  ]

  for (const [key, label] of categories) {
    const entry = f[key]
    const count = entry?.count ?? 0
    lines.push(`- ${label}: ${count}`)
  }

  lines.push('')
  lines.push('## Largest files')
  lines.push('')
  for (const item of report.largestFiles.slice(0, 20)) {
    lines.push(`- ${item.path} (${item.sizeBytes} bytes)`)
  }

  lines.push('')
  lines.push('## Top extensions')
  lines.push('')
  for (const item of report.topExtensions.slice(0, 20)) {
    lines.push(`- ${item.ext}: ${item.count}`)
  }

  lines.push('')
  lines.push('## Top directories')
  lines.push('')
  for (const item of report.topDirectories.slice(0, 20)) {
    lines.push(`- ${item.dir}: ${item.count}`)
  }

  lines.push('')
  return lines.join('\n')
}

export default class RepoScanAgent {
  constructor(options = {}) {
    this.capabilities = ['repo-scan', 'inventory', 'pattern-detection', 'secrets-heuristics']

    this.rootDir = options.rootDir ? path.resolve(options.rootDir) : process.cwd()

    this.options = {
      maxFiles: safeNumber(options.maxFiles, 25000),
      maxFileSizeBytesToRead: safeNumber(options.maxFileSizeBytesToRead, 256 * 1024),
      maxFileSizeBytesToScan: safeNumber(options.maxFileSizeBytesToScan, 2 * 1024 * 1024),
      maxLargestFiles: safeNumber(options.maxLargestFiles, 50),
      maxExamplesPerFinding: safeNumber(options.maxExamplesPerFinding, 50),
      includeBinaryHeuristics: coerceBool(options.includeBinaryHeuristics, false),
      outputDir: options.outputDir ? path.resolve(this.rootDir, options.outputDir) : path.resolve(this.rootDir, 'data', 'reports'),
      ignoredDirNames: new Set([...(options.ignoredDirNames ?? []), ...DEFAULT_IGNORED_DIR_NAMES]),
      ignoredFileNames: new Set([...(options.ignoredFileNames ?? []), ...DEFAULT_IGNORED_FILE_NAMES]),
    }

    this.status = 'stopped'
    this.lastRun = null
    this.lastReportPaths = null
  }

  async start() {
    this.status = 'active'
  }

  async stop() {
    this.status = 'stopped'
  }

  getStatus() {
    return {
      status: this.status,
      lastRun: this.lastRun,
      lastReportPaths: this.lastReportPaths,
      rootDir: this.rootDir,
    }
  }

  async executeCommand(command) {
    if (!command || typeof command !== 'object') {
      return { success: false, reason: 'Invalid command payload' }
    }

    if (command.action === 'scan') {
      const report = await this.scan(command.options ?? {})
      return { success: true, report }
    }

    return { success: false, reason: `Unsupported action: ${command.action}` }
  }

  async receiveMessage(fromAgent, message) {
    return {
      success: true,
      fromAgent,
      receivedAt: nowIso(),
      message,
    }
  }

  async processRequest(request) {
    const options = request?.context?.options ?? {}
    const report = await this.scan(options)
    return {
      agent: 'repo-scan-agent',
      response: 'Repo scan completed',
      report,
      timestamp: nowIso(),
    }
  }

  async scan(overrides = {}) {
    const startedAt = Date.now()
    const scannedAt = nowIso()

    const opts = {
      ...this.options,
      ...overrides,
      ignoredDirNames: this.options.ignoredDirNames,
      ignoredFileNames: this.options.ignoredFileNames,
    }

    await fs.mkdir(opts.outputDir, { recursive: true })

    const git = {
      branch: tryGit(this.rootDir, ['branch', '--show-current']),
      commit: tryGit(this.rootDir, ['rev-parse', 'HEAD']),
      isDirty: (tryGit(this.rootDir, ['status', '--porcelain']) ?? '').length > 0,
    }

    let packageJson = null
    try {
      const pkgPath = path.join(this.rootDir, 'package.json')
      packageJson = JSON.parse(await fs.readFile(pkgPath, 'utf8'))
    } catch {
      // ignore
    }

    const counts = {
      totalFiles: 0,
      totalDirs: 0,
      totalBytes: 0,
      textFilesScanned: 0,
      filesSkipped: 0,
      skippedBinary: 0,
      skippedTooLarge: 0,
      skippedUnreadable: 0,
      maxFilesHit: false,
    }

    const extensionCounts = new Map()
    const directoryCounts = new Map()

    const largestFiles = []

    const findings = {
      conflictMarkers: { count: 0, examples: [] },
      secrets: { count: 0, examples: [] },
      riskyApis: { count: 0, examples: [] },
      todos: { count: 0, examples: [] },
    }

    const patterns = {
      conflictMarkers: /^(<<<<<<<|=======|>>>>>>>)\s/m,
      todos: /\b(TODO|FIXME|HACK)\b/i,

      // Secrets-like patterns (heuristics; can false-positive)
      secretAwsAccessKeyId: /\bAKIA[0-9A-Z]{16}\b/g,
      secretGitHubToken: /\b(ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,})\b/g,
      secretStripeKey: /\bsk_(live|test)_[0-9a-zA-Z]{16,}\b/g,
      secretSlackToken: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
      secretPrivateKeyBlock: /BEGIN (RSA|OPENSSH|EC) PRIVATE KEY/g,

      riskyApis: /\b(eval\(|new Function\(|child_process\.(exec|execSync|spawn|spawnSync)\(|vm\.run(InNewContext|InContext)\()\b/g,
    }

    const scanFile = async (absPath) => {
      const relPath = toPosix(path.relative(this.rootDir, absPath))
      let stat
      try {
        stat = await fs.stat(absPath)
      } catch {
        counts.filesSkipped++
        counts.skippedUnreadable++
        return
      }

      counts.totalFiles++
      counts.totalBytes += stat.size

      const ext = path.extname(absPath).toLowerCase() || '(none)'
      addCount(extensionCounts, ext)
      addCount(directoryCounts, getTopLevelDir(relPath))

      // Track largest files
      if (largestFiles.length < opts.maxLargestFiles || stat.size > largestFiles[largestFiles.length - 1]?.sizeBytes) {
        largestFiles.push({ path: relPath, sizeBytes: stat.size })
        largestFiles.sort((a, b) => b.sizeBytes - a.sizeBytes)
        if (largestFiles.length > opts.maxLargestFiles) largestFiles.length = opts.maxLargestFiles
      }

      const looksBinaryByExt = BINARY_EXTENSIONS.has(ext)
      if (looksBinaryByExt) {
        counts.filesSkipped++
        counts.skippedBinary++
        return
      }

      if (stat.size > opts.maxFileSizeBytesToScan) {
        counts.filesSkipped++
        counts.skippedTooLarge++
        return
      }

      let raw
      try {
        raw = await fs.readFile(absPath)
      } catch {
        counts.filesSkipped++
        counts.skippedUnreadable++
        return
      }

      if (!opts.includeBinaryHeuristics && !isProbablyText(raw)) {
        counts.filesSkipped++
        counts.skippedBinary++
        return
      }

      const text = raw.subarray(0, opts.maxFileSizeBytesToRead).toString('utf8')
      counts.textFilesScanned++

      // Conflict markers
      if (patterns.conflictMarkers.test(text)) {
        recordFinding(findings, 'conflictMarkers', { path: relPath }, opts.maxExamplesPerFinding)
      }

      // TODO/FIXME
      if (patterns.todos.test(text)) {
        const m = patterns.todos.exec(text)
        const line = m ? countNewlines(text, m.index) + 1 : undefined
        recordFinding(findings, 'todos', { path: relPath, line }, opts.maxExamplesPerFinding)
      }

      // Risky APIs
      patterns.riskyApis.lastIndex = 0
      let riskyMatch
      while ((riskyMatch = patterns.riskyApis.exec(text))) {
        const line = countNewlines(text, riskyMatch.index) + 1
        recordFinding(
          findings,
          'riskyApis',
          { path: relPath, line, match: riskyMatch[0].trim() },
          opts.maxExamplesPerFinding
        )
        if (findings.riskyApis.examples.length >= opts.maxExamplesPerFinding) break
      }

      // Secrets-like heuristics
      const secretRegexes = [
        ['AWS_ACCESS_KEY_ID', patterns.secretAwsAccessKeyId],
        ['GITHUB_TOKEN', patterns.secretGitHubToken],
        ['STRIPE_KEY', patterns.secretStripeKey],
        ['SLACK_TOKEN', patterns.secretSlackToken],
        ['PRIVATE_KEY_BLOCK', patterns.secretPrivateKeyBlock],
      ]

      for (const [kind, re] of secretRegexes) {
        re.lastIndex = 0
        const m = re.exec(text)
        if (m) {
          const line = countNewlines(text, m.index) + 1
          recordFinding(findings, 'secrets', { path: relPath, line, kind }, opts.maxExamplesPerFinding)
        }
      }
    }

    const walk = async (dirAbs) => {
      if (counts.totalFiles >= opts.maxFiles) {
        counts.maxFilesHit = true
        return
      }

      let entries
      try {
        entries = await fs.readdir(dirAbs, { withFileTypes: true })
      } catch {
        return
      }

      counts.totalDirs++

      for (const entry of entries) {
        if (counts.totalFiles >= opts.maxFiles) {
          counts.maxFilesHit = true
          return
        }

        if (entry.isDirectory()) {
          if (opts.ignoredDirNames.has(entry.name)) continue
          await walk(path.join(dirAbs, entry.name))
          continue
        }

        if (entry.isFile()) {
          if (opts.ignoredFileNames.has(entry.name)) continue
          await scanFile(path.join(dirAbs, entry.name))
        }
      }
    }

    await walk(this.rootDir)

    const report = {
      metadata: {
        scannedAt,
        rootDir: this.rootDir,
        node: process.version,
        platform: process.platform,
        git,
        packageJson: packageJson
          ? {
              name: packageJson.name,
              version: packageJson.version,
              dependencies: Object.keys(packageJson.dependencies ?? {}).length,
              devDependencies: Object.keys(packageJson.devDependencies ?? {}).length,
            }
          : null,
      },
      counts,
      findings: {
        conflictMarkers: { count: findings.conflictMarkers.count, examples: findings.conflictMarkers.examples },
        secrets: { count: findings.secrets.count, examples: findings.secrets.examples },
        riskyApis: { count: findings.riskyApis.count, examples: findings.riskyApis.examples },
        todos: { count: findings.todos.count, examples: findings.todos.examples },
      },
      largestFiles,
      topExtensions: sortEntriesDesc(extensionCounts).map(([ext, count]) => ({ ext, count })),
      topDirectories: sortEntriesDesc(directoryCounts).map(([dir, count]) => ({ dir, count })),
      timings: {
        elapsedMs: Date.now() - startedAt,
      },
    }

    const stamp = scannedAt.replace(/[:.]/g, '-').replace('T', '_').replace('Z', 'Z')
    const jsonPath = path.join(opts.outputDir, `repo-scan_${stamp}.json`)
    const mdPath = path.join(opts.outputDir, `repo-scan_${stamp}.md`)

    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf8')
    await fs.writeFile(mdPath, makeMarkdownSummary(report), 'utf8')

    this.lastRun = scannedAt
    this.lastReportPaths = {
      json: toPosix(path.relative(this.rootDir, jsonPath)),
      markdown: toPosix(path.relative(this.rootDir, mdPath)),
    }

    return {
      ...report,
      output: this.lastReportPaths,
    }
  }
}
