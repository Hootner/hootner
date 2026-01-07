#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const chatLog = {
  timestamp: new Date().toISOString(),
  date: new Date().toISOString().split('T')[0],
  session: {
    topic: 'Project Visibility & Logging Infrastructure',
    duration: 'Active session',
    outcome: 'Successfully implemented comprehensive logging and visibility tools'
  },
  
  achievements: [
    'Created logs/ directory structure (services, servers, access, errors)',
    'Implemented Winston logging with daily rotation',
    'Added 12 service loggers + 9 server loggers',
    'Created request logging middleware',
    'Built project dashboard (npm run dashboard)',
    'Built service status checker (npm run status)',
    'Built dependency map visualizer (npm run map)',
    'Created PROJECT_SCOPE_MAP.md documentation',
    'Identified 98 TODOs and 12 inactive microservices'
  ],
  
  filesCreated: [
    'lib/logger.js (enhanced)',
    'lib/service-loggers.js',
    'lib/server-loggers.js',
    'middleware/request-logger.js',
    'scripts/clear-logs.js',
    'scripts/dashboard.js',
    'scripts/check-services.js',
    'scripts/dependency-map.js',
    'docs/PROJECT_SCOPE_MAP.md',
    'logs/.gitignore',
    'logs/*/.gitkeep'
  ],
  
  keyInsights: [
    'Project has 8 servers, 7 services, 11 AI agent layers, 25 middleware',
    'All 12 microservices are configured but not running',
    '98 TODOs identified across codebase',
    'Clean architecture: Frontend → Servers → Services → Middleware → Lib',
    'AI agents are independent layer',
    'Logging was minimal (only 2 entries from Dec 17)',
    'No log rotation or per-service logging existed'
  ],
  
  recommendations: [
    'Build service orchestration system (PM2 or custom)',
    'Start core services: MCP, hub-app, collab-server',
    'Tackle security TODOs first, then performance, then code quality',
    'Add health monitoring with auto-restart',
    'Document running system and startup sequence'
  ],
  
  technicalDetails: {
    loggingStack: 'Winston + winston-daily-rotate-file',
    logRetention: '14 days (30 days for errors)',
    maxLogSize: '20MB per file',
    logFormat: 'JSON structured logging',
    features: ['Request IDs', 'Daily rotation', 'Separate error logs', 'Per-service logs']
  },
  
  commands: [
    'npm run dashboard - View project stats',
    'npm run status - Check service health',
    'npm run map - View dependency tree',
    'npm run visibility - Run all visibility tools',
    'npm run logs:view - Tail combined logs',
    'npm run logs:clear - Clear all logs'
  ]
};

// Save to training data
const trainingFile = path.join(root, 'services', 'training-data-q-conversations.txt');
const trainingEntry = `
=== CHAT SESSION: ${chatLog.timestamp} ===
TOPIC: ${chatLog.session.topic}

USER GOAL: Understand project scope and improve visibility

CONTEXT:
- User wanted to see entire project scope to better direct development
- Project had minimal logging (only 2 log entries from 2 weeks ago)
- No visibility tools existed
- 98 TODOs and 12 inactive microservices discovered

SOLUTION PROVIDED:
1. Created comprehensive logging infrastructure with Winston
   - Per-service logging (12 services)
   - Per-server logging (9 servers)
   - Access logs with request IDs
   - Error-only logs with 30-day retention
   - Daily log rotation (20MB max size)

2. Built visibility tools:
   - Dashboard showing stats (servers, services, agents, TODOs, logs)
   - Service status checker (health check all 12 microservices)
   - Dependency map visualizer (shows architecture flow)
   - Combined visibility command

3. Created documentation:
   - PROJECT_SCOPE_MAP.md explaining 5-layer architecture
   - Dependency map JSON output
   - Dashboard JSON output

KEY LEARNINGS:
- User values visibility and control over the project
- "The more I can see the better I can direct us" - visibility is critical
- Project has clean architecture but needs orchestration
- Logging infrastructure was missing despite being production-ready in other areas

RECOMMENDATIONS GIVEN:
1. Build service orchestration (highest priority)
2. Start core services first (MCP, hub, collab)
3. Tackle TODOs by priority (security > performance > quality)
4. Add health monitoring with auto-restart
5. Document running system

FILES CREATED: ${chatLog.filesCreated.length} files
COMMANDS ADDED: ${chatLog.commands.length} npm scripts

OUTCOME: User now has complete visibility and can direct development effectively

===END SESSION===

`;

// Append to training data
await fs.appendFile(trainingFile, trainingEntry);

// Save to journal
const journalFile = path.join(root, 'docs', 'journal', `${chatLog.date}.md`);
await fs.mkdir(path.dirname(journalFile), { recursive: true });

let journalContent = '';
try {
  journalContent = await fs.readFile(journalFile, 'utf-8');
} catch (e) {
  journalContent = `# Dev Journal - ${chatLog.date}\n\n`;
}

journalContent += `
## ${new Date().toLocaleTimeString()} - 💬 Chat Session: ${chatLog.session.topic}

### Achievements:
${chatLog.achievements.map(a => `- ✅ ${a}`).join('\n')}

### Files Created:
${chatLog.filesCreated.map(f => `- \`${f}\``).join('\n')}

### Key Insights:
${chatLog.keyInsights.map(i => `- 💡 ${i}`).join('\n')}

### Next Steps:
${chatLog.recommendations.map(r => `- 🎯 ${r}`).join('\n')}

---

`;

await fs.writeFile(journalFile, journalContent);

// Save detailed JSON
const reportFile = path.join(root, 'docs', 'reports', `chat-${Date.now()}.json`);
await fs.writeFile(reportFile, JSON.stringify(chatLog, null, 2));

console.log('\n✅ Chat logged for training!');
console.log(`📝 Training data: services/training-data-q-conversations.txt`);
console.log(`📔 Journal: docs/journal/${chatLog.date}.md`);
console.log(`📊 Report: ${path.basename(reportFile)}\n`);
