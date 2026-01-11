## Quick orient for AI coding agents

Purpose: give an AI agent the exact, actionable signals it needs to be productive in this repository (architecture, key files, developer workflows, and conventions).

- **Big picture**: HOOTNER is a monorepo-style full-stack platform (video player, AI services, microservices) organized around a hexarchy (see `hexarchy/`) and framework folders (`frameworks/`). The runtime orchestration is handled under `orchestration/` and `services/`; AI agents live under `frameworks/ai/agents/` and are coordinated by orchestration and agent-hub modules.

- **Key files to read first**:
  - [docs/AI_AGENT_ORCHESTRATION.md](../docs/AI_AGENT_ORCHESTRATION.md) — multi-agent design and supported operations.
  - [index.js](../index.js) — the main orchestrator that wires hexagonal architecture layers, starts services, and provides health monitoring.
  - [enhanced-agent-hub.js](../enhanced-agent-hub.js) — the entrypoint for the 75+ enhanced agents; demonstrates how agents are initialized and how requests are routed through them.
  - [agent-orchestrator-cli.js](../agent-orchestrator-cli.js) — CLI for advanced agent orchestration with real-time task management.
  - [frontend-server.js](../frontend-server.js) — HTTP server for the frontend with health check endpoints.
  - [README.md](../README.md) — project quick-start, top-level commands, and environment notes.

- **Architecture summary (short)**:
  - Plan agent breaks complex tasks into steps; parallel subagents execute specific operations (refactor, debug, optimize). See `docs/AI_AGENT_ORCHESTRATION.md` for parallelism defaults (refactor=4, optimize=4, debug=2).
  - Main orchestrator (`index.js`) coordinates hexagonal architecture layers, manages service lifecycle, and provides health monitoring.
  - Enhanced agents (security, compliance, BI, etc.) are implemented as modules and accessed via `enhanced-agent-hub.js`.

- **Developer workflows & commands** (use these exact commands when scripting or running tasks):
  - Install dependencies: `npm install`
  - Start dev frontend: `npm run dev`
  - Start all servers (cross-platform): `npm run start:all` or `node index.js`
  - Start agent orchestrator: `npm run orchestrator:init` or `node agent-orchestrator-cli.js init`
  - Start standalone video player (dev):
    - `cd apps/frontend/html-pages`
    - `node video-player-server.js` (serves player at http://localhost:3000)
  - Tests: `npm test`
  - Lint & auto-fix: `npm run lint -- --fix`

- **Conventions and patterns to follow**:
  - ES modules are the primary module system. Some legacy files use CommonJS (.cjs or `require()`); prefer ESM when adding new modules.
  - Agents live in `frameworks/ai/agents/` and expose start/monitor/process functions. `enhanced-agent-hub.js` shows the expected interface: `initialize()`, `processRequest(req,res)`, and `getStatus()`.
  - Agent orchestration events: use the orchestrator event names shown in `agent-orchestrator-cli.js` (`task-started`, `task-completed`, `task-failed`, `agent-started`, `agent-stopped`) when working with agents.
  - Hexarchy directories map responsibilities; place new code in the appropriate layer (e.g., AI code in `hexarchy/2-intelligence/` or `frameworks/ai/`).

- **Integration points & runtime details**:
  - Frontend: `http://localhost:3000` (served by frontend-server.js)
  - GraphQL API: `http://localhost:4000/graphql` (served by api/graphql)
  - Health checks: `http://localhost:3000/api/health` (frontend health endpoint)
  - ML services: Python-based under `services/video-generation/` (install via provided `install.py` script)
  - Node runtime: targets modern Node (ESM first). Be careful with `.cjs` and `.mjs` boundaries.

- **What to avoid / watch for**:
  - Don't assume all files are ESM — check the module style before editing imports/exports.
  - Large operations (refactors) should follow the Plan Agent pattern: break into steps, run tests, and use the repo's `scripts/refactoring/` utilities when available.
  - Avoid touching unrelated framework folders; the repo is intentionally wide and opinionated — put changes into the correct scope.

- **When creating patches**:
  - Run `npm run lint -- --fix` and `npm test` before proposing a patch.
  - Include references to the files you changed in the PR description and test the orchestrator to verify side-effects (use `npm run start:all` or `node index.js`).

If anything here is unclear or you want deeper details (examples of agent interfaces, common event payload shapes, or a short checklist for safe large-scale refactors), tell me which section to expand.
