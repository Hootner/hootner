## Quick orient for AI coding agents

Purpose: give an AI agent the exact, actionable signals it needs to be productive in this repository (architecture, key files, developer workflows, and conventions).

- **Big picture**: HOOTNER is a monorepo-style full-stack platform (video player, AI services, microservices) organized around a heptagonal architecture (see `heptagonal/`) with 9 layers (0-8). The runtime orchestration is handled through event-driven architecture; AI agents live under `heptagonal/2-intelligence/ai-services/agents/` and `scripts/agents/` with **dual-agent orchestration** coordinating GitHub Copilot + Amazon Q. The platform runs **75+ specialized agents** through the Enhanced Agent Hub.

- **Key files to read first**:
  - [scripts/agents/enhanced-agent-hub.js](../scripts/agents/enhanced-agent-hub.js) — **NEW**: Central hub orchestrating 75+ production agents across security, BI, infrastructure, and AI services.
  - [start-dual-agent.js](../start-dual-agent.js) — **NEW**: Dual AI agent system entry point with intelligent routing between Copilot and Amazon Q.
  - [heptagonal/2-intelligence/ai-services/agents/dual-agent-orchestrator.js](../heptagonal/2-intelligence/ai-services/agents/dual-agent-orchestrator.js) — Core routing logic and agent coordination.
  - [heptagonal/0-core/orchestration/event-bus.js](../heptagonal/0-core/orchestration/event-bus.js) — Event-driven communication between heptagonal layers.
  - [README.md](../README.md) — project quick-start, top-level commands, and environment notes.

- **Architecture summary (short)**:
  - **Dual-Agent System**: GitHub Copilot handles code completion/refactoring; Amazon Q handles AWS integration/security audits. Intelligent routing in `dual-agent-orchestrator.js` with fallback logic.
  - **Enhanced Agent Hub**: 75+ production agents categorized as Core AI (12), Business Intelligence (15), Security & Compliance (18), Infrastructure & Operations (20), and Specialized Services (10).
  - **Heptagonal Pattern**: 9-layer architecture from `0-core/` (infrastructure) to `8-operations/` (DevOps), with event-driven communication via `event-bus.js`.
  - **Agent Categories**: Core agents auto-start in production; infrastructure agents handle scaling/monitoring; security agents perform compliance checks.

- **Developer workflows & commands** (use these exact commands when scripting or running tasks):
  - **Dual Agent System**: `npm run dual-agent:start` (start dual AI coordination), `npm run dual-agent:status` (check routing status)
  - **First-time setup**: `npm run aws:onboard` — beginner-friendly wizard that configures local or AWS mode
  - Install dependencies: `npm install`
  - Start dev frontend: `npm run dev` 
  - Start all servers: `npm run start:all` (cross-platform launcher)
  - Check AWS status: `npm run aws:status` — shows current AWS account and connection status
  - Start orchestration locally: `node index.js` (main platform entry point)
  - Frontend development:
    - `cd apps/frontend/html-pages && node server.js` (serves player at http://localhost:3001)
  - Tests: `npm test`
  - Lint & auto-fix: `npm run lint:fix` (notice `:fix` instead of `-- --fix`)
  - Enhanced agents: `npm run agents:status` (check 75+ agent status)

- **Conventions and patterns to follow**:
  - **CRITICAL: File Organization** - Read `.amazonq/rules/file-organization.md` BEFORE creating any file. All HTML pages go in `apps/frontend/html-pages/` ONLY.
  - ES modules are the primary module system. Some legacy files use CommonJS (.cjs or `require()`); prefer ESM when adding new modules.
  - Agents live in `heptagonal/2-intelligence/ai-services/agents/` and expose start/monitor/process functions. `enhanced-agent-hub.js` shows the expected interface: `initialize()`, `processRequest(req,res)`, and `getStatus()`.
  - **Dual-Agent Routing**: Use routing rules in `dual-agent-orchestrator.js` - AWS tasks go to Amazon Q, code completion goes to Copilot, with automatic fallback.
  - Orchestration events: use the orchestrator event names shown in `heptagonal/0-core/orchestration/event-bus.js` for inter-domain communication.
  - Heptagonal directories map responsibilities; place new code in the appropriate layer (e.g., AI code in `heptagonal/2-intelligence/`).
  - **NEVER create duplicate files** - Search for existing files first: `git ls-files | grep filename`

- **Integration points & runtime details**:
  - **Main Platform**: `http://localhost:3000` (primary app entry)
  - **Frontend Pages**: `http://localhost:3001` (static HTML pages server)
  - **Agent Hub**: Access 75+ agents via `enhanced-agent-hub.js` API
  - **Dual Agent System**: Automatic routing between GitHub Copilot and Amazon Q
  - **Event Bus**: Inter-domain communication via `event-bus.js` (subscribe/publish pattern)
  - ML services: Python-based under `services/video-generation/` (install via provided scripts)
  - Node runtime: targets modern Node (ESM first). Be careful with `.cjs` and `.mjs` boundaries.

- **What to avoid / watch for**:
  - Don't assume all files are ESM — check the module style before editing imports/exports.
  - Large operations (refactors) should follow the Plan Agent pattern: break into steps, run tests, and use the repo's `scripts/refactoring/` utilities when available.
  - Avoid touching unrelated framework folders; the repo is intentionally wide and opinionated — put changes into the correct scope.

- **When creating patches**:
  - Run `npm run lint:fix` and `npm test` before proposing a patch.
  - Include references to the files you changed in the PR description and run the orchestrator's local dashboard to verify side-effects (start `index.js`).

If anything here is unclear or you want deeper details (examples of agent interfaces, common event payload shapes, or a short checklist for safe large-scale refactors), tell me which section to expand.

If anything here is unclear or you want deeper details (examples of agent interfaces, common event payload shapes, or a short checklist for safe large-scale refactors), tell me which section to expand.
