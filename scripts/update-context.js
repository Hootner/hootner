#!/usr/bin/env node
/**
 * Auto-update .amazonq/rules/project-context.md + journal
 * Runs automatically on npm install and every 3 minutes
 */

import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function updateContext() {
  try {
    // Read package.json
    const pkg = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    
    // Check running services
    let runningServices = [];
    try {
      const { stdout } = await execAsync('netstat -ano | findstr ":3000 :3001 :3002"');
      if (stdout.includes(':3000')) runningServices.push('Port 3000 (HTML/Video)');
      if (stdout.includes(':3001')) runningServices.push('Port 3001 (MCP)');
      if (stdout.includes(':3002')) runningServices.push('Port 3002 (Collab)');
    } catch (e) {
      runningServices = ['No services running'];
    }

    // Get latest log entry
    let lastActivity = 'No recent activity';
    try {
      const logs = await fs.readFile('docs/reports/combined.log', 'utf-8');
      const lines = logs.trim().split('\n');
      if (lines.length > 0) {
        const lastLog = JSON.parse(lines[lines.length - 1]);
        lastActivity = lastLog.timestamp;
      }
    } catch (e) {
      // No logs yet
    }

    // List servers
    const servers = await fs.readdir('servers');
    
    // Generate context
    const context = `# HOOTNER Project Context (Auto-Updated)

## Amazon Q Rules
- **NEVER create .md files unless explicitly requested**
- **NEVER create documentation files automatically**
- Only create code files (.js, .json, .html, .css, etc.)
- Ask before creating any markdown documentation

## Project Info
- **Name:** ${pkg.name}
- **Version:** ${pkg.version}
- **Description:** ${pkg.description}
- **Type:** ${pkg.type}
- **License:** ${pkg.license}

## Running Services
${runningServices.map(s => `- ${s}`).join('\n')}

## Available Servers (${servers.length} total)
${servers.map((s, i) => `${i + 1}. ${s}`).join('\n')}

## MCP Tools Available
- getProjectInfo - Project structure & config
- listServices - List all services
- getServiceStatus - Check service status
- readLogs - Read application logs

## Quick Commands
\`\`\`bash
npm run mcp:start              # Start MCP server
npm run deploy:dev             # Deploy development
npm run deploy:prod            # Deploy production
npm run security:audit         # Security scan
npm run chaos:test             # Chaos engineering
npm run backup:full            # Full backup
node servers/collab-server.js  # Start collaboration
\`\`\`

## Available Scripts (${Object.keys(pkg.scripts).length} total)
${Object.keys(pkg.scripts).slice(0, 10).join(', ')}...

## Project Structure
- apps/frontend/ - React + Vite frontend
- servers/ - ${servers.length} server files
- lib/ - Utility libraries
- middleware/ - Security/auth middleware
- services/video-generation/ - Python ML service
- scripts/ - Automation scripts
- docs/ - Documentation

## VS Code Settings
- Location: .vscode/settings.json
- Status: Active
- MCP servers configured: hootner-deployment, aws-cdk
- TODO tracking: 17 tag types with color coding
- Auto-format: Prettier + ESLint

## Recent Activity
- Last activity: ${lastActivity}
- Log file: docs/reports/combined.log

## Key Features
- ${Object.keys(pkg.scripts).length} npm scripts available
- Docker support (multi-stage builds)
- Kubernetes orchestration
- Blue-green deployments
- Chaos engineering tests
- Automated backups with PITR
- Multi-region sync

---
*Last updated: ${new Date().toISOString()}*
*Auto-updated by: scripts/update-context.js*
`;

    // Write to .amazonq/rules
    await fs.mkdir('.amazonq/rules', { recursive: true });
    await fs.writeFile('.amazonq/rules/project-context.md', context);
    
    console.log('✅ Context updated: .amazonq/rules/project-context.md');
    console.log(`📊 ${servers.length} servers, ${Object.keys(pkg.scripts).length} scripts`);
    console.log(`🔄 Running: ${runningServices.join(', ')}`);
    
    // Auto-update journal
    await updateJournal();
  } catch (error) {
    console.error('❌ Failed to update context:', error.message);
    process.exit(1);
  }
}

async function updateJournal() {
  const today = new Date().toISOString().split('T')[0];
  const journalFile = `docs/journal/${today}.md`;
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  
  try {
    await fs.mkdir('docs/journal', { recursive: true });
    
    let content = '';
    try {
      content = await fs.readFile(journalFile, 'utf-8');
    } catch (e) {
      content = `# Dev Journal - ${today}\n\n`;
    }
    
    const entry = `- **${timestamp}** 💬 Chat session active\n`;
    content += entry;
    
    await fs.writeFile(journalFile, content);
    console.log(`📝 Journal updated: ${timestamp}`);
  } catch (error) {
    // Silent fail for journal
  }
}

updateContext();
