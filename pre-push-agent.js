#!/usr/bin/env node
const { execSync } = require("child_process");
const chalk = require("chalk");
const fs = require("fs");

const startTime = Date.now();

/**
 * Safe command execution - execSync returns strings, not serialized objects
 * CWE-502 only applies when deserializing untrusted data structures
 */
function runSilent(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", encoding: "utf8" }).trim();
  } catch (error) {
    return null;
  }
}

console.log(chalk.blue("🚀 Pre-push validation..."));

const checks = [];

// Check 1: Tests
if (fs.existsSync("package.json")) {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  if (pkg.scripts && pkg.scripts.test) {
    checks.push(
      new Promise((resolve) => {
        const result = runSilent("npm test");
        resolve({
          name: "Tests",
          passed: result !== null,
          icon: "🧪",
        });
      })
    );
  }
}

// Check 2: Build (if script exists)
if (fs.existsSync("package.json")) {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  if (pkg.scripts && pkg.scripts.build) {
    checks.push(
      new Promise((resolve) => {
        const result = runSilent("npm run build");
        resolve({
          name: "Build",
          passed: result !== null,
          icon: "🔨",
        });
      })
    );
  }
}

// Check 3: Uncommitted changes
checks.push(
  new Promise((resolve) => {
    const status = runSilent("git status --porcelain");
    resolve({
      name: "Uncommitted changes",
      passed: !status || status.length === 0,
      icon: "📝",
    });
  })
);

// Check 4: Branch protection
checks.push(
  new Promise((resolve) => {
    const branch = runSilent("git rev-parse --abbrev-ref HEAD");
    const protectedBranches = ["main", "master", "production"];
    if (protectedBranches.includes(branch)) {
      console.log(chalk.yellow(`⚠️ Pushing to protected branch: ${branch}`));
    }
    resolve({ name: "Branch check", passed: true, icon: "🌿" });
  })
);

Promise.all(checks).then((results) => {
  console.log(chalk.yellow("\n📊 Validation Results:"));

  results.forEach((result) => {
    const status = result.passed ? chalk.green("✅") : chalk.red("❌");
    console.log(`${status} ${result.icon} ${result.name}`);
  });

  const failed = results.filter((r) => !r.passed);

  if (failed.length > 0) {
    console.error(chalk.red("\n❌ PUSH BLOCKED - Validation failed"));
    console.error(chalk.yellow("Fix the issues above before pushing\n"));
    process.exit(1);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(chalk.green(`\n✅ Push validation complete (${elapsed}s)`));
});
