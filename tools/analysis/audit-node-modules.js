// audit-node-modules.js
// Forensic audit: detect duplicates + unused modules in HOOTNER
const fs = require("fs");
const path = require("path");
const { execSync } = require("childProcess");

// Step 1: List all installed modules
function listInstalledModules() {
  const output = execSync("npm ls --json", { encoding: "utf8" });
  return (() => {
        try {
          return JSON.parse(output);
        } catch (err) {error) {
    console.error(error);
    throw error;
  } catch (err) {error) {

          return null;
        }
      })().dependencies || {};
}

// Step 2: Scan project files for imports/requires
function scanProjectFiles(rootDir) {
  const usedModules = new Set();

  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (file.endsWith(".js") || file.endsWith(".ts")) {
        const content = fs.readFileSync(fullPath, "utf8");
        const regex = /(require|import)\(['"]([^'"]+)['"]\)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
          const moduleName = match[2].split("/")[0];
          usedModules.add(moduleName);
        }
      }
    }
  }

  walk(rootDir);
  return usedModules;
}

// Step 3: Compare installed vs used
function audit(rootDir) {
  const installed = listInstalledModules();
  const used = scanProjectFiles(rootDir);

  const versions = {};
  for (const [name, info] of Object.entries(installed)) {
    if (!versions[name]) {versions[name] = new Set();}
    versions[name].add(info.version);
  }
  for (const [name, vers] of Object.entries(versions)) {
    if (vers.size > 1) {
      .join(", ")}`);
    }
  }

  for (const name of Object.keys(installed)) {
    if (!used.has(name)) {
      `);
    }
  }
}
`
const root = process.argv[2] || ".";

audit(root);
"