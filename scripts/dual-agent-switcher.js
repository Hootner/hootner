#!/usr/bin/env node

/**
 * Dual-Agent Switcher CLI
 * Toggle between Copilot-only and dual-agent (Copilot + Amazon Q) modes
 */

import fs from 'fs'
import path from 'path'

const configPath = path.join(
  process.cwd(),
  '.vscode',
  'dual-agent-config.json'
)

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  } catch (err) {
    console.error('❌ Could not load config:', err.message)
    process.exit(1)
  }
}

function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}

function enableDualMode() {
  const config = loadConfig()
  config.dualAgent.enabled = true
  config.dualAgent.mode = 'cooperative'
  saveConfig(config)
  console.log('✅ Dual-agent mode ENABLED')
  console.log('   - Copilot: active')
  console.log('   - Amazon Q: active')
  console.log('   - Routing: context-aware')
}

function disableDualMode() {
  const config = loadConfig()
  config.dualAgent.enabled = false
  config.dualAgent.mode = 'copilot-only'
  saveConfig(config)
  console.log('✅ Dual-agent mode DISABLED')
  console.log('   - Copilot: active')
  console.log('   - Amazon Q: disabled')
}

function showStatus() {
  const config = loadConfig()
  console.log('\n📊 Dual-Agent Status:\n')
  console.log(`  Mode: ${config.dualAgent.mode}`)
  console.log(`  Enabled: ${config.dualAgent.enabled}`)
  console.log(`  Primary: ${config.dualAgent.primaryAgent}`)
  console.log(`  Fallback: ${config.dualAgent.fallbackAgent}`)
  console.log(`  Strategy: ${config.dualAgent.routingStrategy}`)
  console.log('')
}

const cmd = process.argv[2]

if (cmd === 'enable') {
  enableDualMode()
} else if (cmd === 'disable') {
  disableDualMode()
} else if (cmd === 'status') {
  showStatus()
} else {
  console.log(`
Usage: node dual-agent-switcher.js [command]

Commands:
  enable    - Enable dual-agent mode (Copilot + Amazon Q)
  disable   - Disable dual-agent mode (Copilot only)
  status    - Show current dual-agent status

Example:
  node dual-agent-switcher.js enable
  node dual-agent-switcher.js status
`)
}
