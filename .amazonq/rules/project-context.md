# HOOTNER Project Context (Auto-Updated)

## Amazon Q Rules
- **NEVER create .md files unless explicitly requested**
- **NEVER create documentation files automatically**
- Only create code files (.js, .json, .html, .css, etc.)
- Ask before creating any markdown documentation

## Project Info
- **Name:** hootner-mcp-integration
- **Version:** 1.0.0
- **Description:** Amazon Q Developer MCP integration for HOOTNER deployment and monitoring
- **Type:** module
- **License:** MIT

## Running Services
- No services running

## Available Servers (9 total)
1. collab-server.js
2. electron-code-editor-server.js
3. hootner-mcp-server.js
4. html-pages-server.cjs
5. html-pages-server.js
6. hub-app.js
7. mcp-server.js
8. secure-server.js
9. video-player-server.js

## MCP Tools Available
- getProjectInfo - Project structure & config
- listServices - List all services
- getServiceStatus - Check service status
- readLogs - Read application logs

## Quick Commands
```bash
npm run mcp:start              # Start MCP server
npm run deploy:dev             # Deploy development
npm run deploy:prod            # Deploy production
npm run security:audit         # Security scan
npm run chaos:test             # Chaos engineering
npm run backup:full            # Full backup
node servers/collab-server.js  # Start collaboration
```

## Available Scripts (50 total)
start, dev, lint, lint:fix, lint:report, mcp:start, mcp:setup, mcp:ide-setup, mcp:test, mcp:test-tools...

## Project Structure
- apps/frontend/ - React + Vite frontend
- servers/ - 9 server files
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
- Last activity: 2025-12-17T20:31:53.017Z
- Log file: docs/reports/combined.log

## Key Features
- 50 npm scripts available
- Docker support (multi-stage builds)
- Kubernetes orchestration
- Blue-green deployments
- Chaos engineering tests
- Automated backups with PITR
- Multi-region sync

---
*Last updated: 2026-01-07T15:38:13.111Z*
*Auto-updated by: scripts/update-context.js*
