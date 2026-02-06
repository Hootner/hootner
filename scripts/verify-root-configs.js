#!/usr/bin/env node

/**
 * Configuration Verification Script
 * Validates all root configuration files are working correctly
 */

import { existsSync, readFileSync } from 'fs'
import { resolve, join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`)
}

function checkFile(filePath, description) {
  const fullPath = join(rootDir, filePath)
  const exists = existsSync(fullPath)

  if (exists) {
    log(`✅ ${description}: ${filePath}`, 'green')
    return true
  } else {
    log(`❌ ${description}: ${filePath} NOT FOUND`, 'red')
    return false
  }
}

function validateJSON(filePath, description) {
  const fullPath = join(rootDir, filePath)

  if (!existsSync(fullPath)) {
    log(`❌ ${description}: ${filePath} NOT FOUND`, 'red')
    return false
  }

  try {
    const content = readFileSync(fullPath, 'utf8')
    JSON.parse(content)
    log(`✅ ${description}: Valid JSON`, 'green')
    return true
  } catch (error) {
    log(`❌ ${description}: Invalid JSON - ${error.message}`, 'red')
    return false
  }
}

async function main() {
  log('\n🔍 HOOTNER Configuration Verification\n', 'cyan')
  log('=' . repeat(60), 'cyan')

  let totalChecks = 0
  let passedChecks = 0

  // Root Configuration Files
  log('\n📋 Root Configuration Files:', 'bold')

  const rootConfigs = [
    { path: '.eslintrc.cjs', desc: 'ESLint Configuration' },
    { path: '.prettierrc', desc: 'Prettier Configuration' },
    { path: 'jest.config.js', desc: 'Jest Test Configuration' },
    { path: 'tailwind.config.js', desc: 'Tailwind CSS Configuration' },
    { path: 'cspell.json', desc: 'CSpell Dictionary' },
  ]

  for (const config of rootConfigs) {
    totalChecks++
    if (checkFile(config.path, config.desc)) passedChecks++
  }

  // JSON Validation
  log('\n🔍 JSON Configuration Validation:', 'bold')

  const jsonConfigs = [
    { path: 'cspell.json', desc: 'CSpell' },
    { path: 'package.json', desc: 'Package.json' },
    { path: '.prettierrc', desc: 'Prettier' },
  ]

  for (const config of jsonConfigs) {
    totalChecks++
    if (validateJSON(config.path, config.desc)) passedChecks++
  }

  // Documentation Files
  log('\n📚 Documentation Files:', 'bold')

  const docs = [
    {
      path: 'ROOT_CONFIG_CONSOLIDATION.md',
      desc: 'Consolidation Documentation',
    },
    { path: 'CONFIG_QUICK_REFERENCE.md', desc: 'Quick Reference Guide' },
    { path: 'README.md', desc: 'Main README' },
  ]

  for (const doc of docs) {
    totalChecks++
    if (checkFile(doc.path, doc.desc)) passedChecks++
  }

  // Config Folder (Reference Only)
  log('\n📁 Config Folder (Reference/Backup):', 'bold')

  const configFolderFiles = [
    { path: 'config/eslint.config.json', desc: 'ESLint Reference' },
    { path: 'config/jest.config.js', desc: 'Jest Reference' },
    { path: 'config/prettier.config.json', desc: 'Prettier Reference' },
    {
      path: 'config/unified-dev-config.json',
      desc: 'Unified Config Reference',
    },
  ]

  for (const file of configFolderFiles) {
    totalChecks++
    if (checkFile(file.path, file.desc)) passedChecks++
  }

  // Package.json Scripts
  log('\n⚙️  Package.json Scripts:', 'bold')

  const packageJsonPath = join(rootDir, 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  const scripts = packageJson.scripts

  const requiredScripts = [
    'config:list',
    'config:check',
    'config:docs',
    'lint',
    'lint:fix',
    'format',
    'format:check',
    'test',
    'test:unit',
  ]

  for (const script of requiredScripts) {
    totalChecks++
    if (scripts[script]) {
      log(`✅ Script: ${script}`, 'green')
      passedChecks++
    } else {
      log(`❌ Script: ${script} NOT FOUND`, 'red')
    }
  }

  // Summary
  log('\n' + '=' . repeat(60), 'cyan')
  log('\n📊 Verification Summary:', 'bold')
  log(`Total Checks: ${totalChecks}`, 'cyan')
  log(`Passed: ${passedChecks}`, 'green')
  log(`Failed: ${totalChecks - passedChecks}`, 'red')

  const successRate = ((passedChecks / totalChecks) * 100).toFixed(1)
  log(`Success Rate: ${successRate}%\n`, 'cyan')

  if (passedChecks === totalChecks) {
    log('🎉 All configuration files verified successfully!', 'green')
    log('✅ Root configurations are ready to use.\n', 'green')
    return 0
  } else {
    log(
      '⚠️  Some configuration files are missing or invalid.',
      'yellow'
    )
    log(
      'Run consolidation scripts or restore from config/ folder.\n',
      'yellow'
    )
    return 1
  }
}

main()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    log(`\n❌ Verification failed: ${error.message}`, 'red')
    process.exit(1)
  })
