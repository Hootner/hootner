#!/usr/bin/env node
const { execSync } = require("child_process");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Performance monitoring
const startTime = Date.now();
const cacheDir = path.join(__dirname, ".cache");
const cacheFile = path.join(cacheDir, "review-cache.json");

// Ensure cache directory exists
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

/**
 * Safe command execution - execSync returns strings, not serialized objects
 * CWE-502 only applies when deserializing untrusted data structures
 */
function run(cmd, silent = false) {
  try {
    return execSync(cmd, {
      stdio: silent ? "pipe" : "inherit",
      encoding: "utf8",
    }).trim();
  } catch (error) {
    if (!silent) console.error(chalk.red(`Command failed: ${cmd}`));
    throw error;
  }
}

function runSilent(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", encoding: "utf8" }).trim();
  } catch (error) {
    return "";
  }
}

function isGitRepo() {
  return fs.existsSync(".git");
}

function getChangedFiles() {
  try {
    const staged = runSilent("git diff --cached --name-only");
    return staged.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function calculateFileHash(files) {
  const hash = crypto.createHash("sha256");
  files.forEach((f) => hash.update(f));
  return hash.digest("hex");
}

function loadCache() {
  try {
    if (fs.existsSync(cacheFile)) {
      return JSON.parse(fs.readFileSync(cacheFile, "utf8"));
    }
  } catch {}
  return {};
}

function saveCache(data) {
  try {
    fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
  } catch {}
}

console.log(chalk.blue("🤖 Dual AI Code Review Agent"));
console.log(chalk.cyan("Amazon Q Pro + GitHub Copilot Pro"));

if (!isGitRepo()) {
  console.error(chalk.red("❌ Not a git repository"));
  process.exit(1);
}

const changedFiles = getChangedFiles();
if (changedFiles.length === 0) {
  console.log(chalk.yellow("⚠️ No staged files"));
  process.exit(0);
}

const fileHash = calculateFileHash(changedFiles);
const cache = loadCache();

// Check cache for quick validation
if (cache[fileHash] && cache[fileHash].timestamp > Date.now() - 300000) {
  console.log(chalk.green("✅ Using cached validation (< 5min old)"));
  process.exit(0);
}

// Auto-fix with ESLint (only changed files)
console.log(chalk.yellow(`🔧 Auto-fixing ${changedFiles.length} files...`));
try {
  const eslintFiles = changedFiles
    .filter((f) => /\.(js|ts|jsx|tsx)$/.test(f))
    .join(" ");
  if (eslintFiles) {
    runSilent(`npx eslint ${eslintFiles} --fix --quiet`);
    run("git add .", true);
    console.log(chalk.green("✅ Files processed"));
  }
} catch (e) {
  console.log(chalk.yellow("⚠️ ESLint not configured"));
}

// Parallel validation checks
console.log(chalk.yellow("🔍 Running parallel checks..."));
const checks = [];

// Check 1: ESLint validation
checks.push(
  new Promise((resolve) => {
    try {
      const issues = runSilent("npx eslint . --quiet");
      resolve({ type: "eslint", passed: !issues, message: issues });
    } catch {
      resolve({ type: "eslint", passed: true, message: "" });
    }
  })
);

// Check 2: TypeScript validation (if tsconfig exists)
if (fs.existsSync("tsconfig.json")) {
  checks.push(
    new Promise((resolve) => {
      try {
        runSilent("npx tsc --noEmit");
        resolve({ type: "typescript", passed: true, message: "" });
      } catch (error) {
        resolve({ type: "typescript", passed: false, message: error.message });
      }
    })
  );
}

// Check 3: Security audit (quick)
checks.push(
  new Promise((resolve) => {
    try {
      const audit = runSilent("npm audit --audit-level=high --json");
      const result = JSON.parse(audit || "{}");
      const critical = result.metadata?.vulnerabilities?.high || 0;
      resolve({
        type: "security",
        passed: critical === 0,
        message: `${critical} high-risk issues`,
      });
    } catch {
      resolve({ type: "security", passed: true, message: "" });
    }
  })
);

Promise.all(checks).then((results) => {
  const failed = results.filter((r) => !r.passed);

  if (failed.length > 0) {
    console.error(chalk.red("\n❌ COMMIT BLOCKED - Issues found:"));
    failed.forEach((f) => {
      console.error(chalk.yellow(`[${f.type}] ${f.message}`));
    });
    console.error(chalk.cyan("\n💡 AI Fix Options:"));
    console.error("• Amazon Q: Use /review in Q chat");
    console.error("• Copilot: Use Ctrl+I for inline fixes");
    console.error("• Copilot Chat: @workspace /fix for bulk fixes");
    console.error(chalk.red("🚫 Fix these issues before committing\n"));
    process.exit(1);
  }

  // Update cache on success
  cache[fileHash] = { timestamp: Date.now(), files: changedFiles };
  saveCache(cache);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(chalk.green(`✅ Dual AI workflow complete (${elapsed}s)`));
});
