## Quick orient for AI coding agents

Purpose: give an AI agent the exact, actionable signals it needs to be productive in this repository (architecture, key files, developer workflows, and conventions).

- **Big picture**: HOOTNER is a monorepo-style full-stack platform (video player, AI services, microservices) organized around a hexarchy (see `hexarchy/`) and framework folders (`frameworks/`). The runtime orchestration is handled under `orchestration/` and `services/`; AI agents live under `frameworks/ai/agents/` and are coordinated by orchestration and agent-hub modules.

- **Key files to read first**:
  - [docs/AI_AGENT_ORCHESTRATION.md](../docs/AI_AGENT_ORCHESTRATION.md) — multi-agent design and supported operations.
  - [orchestration/index.js](../orchestration/index.js) — how the production orchestrator, service mesh and data pipeline are wired; shows dashboard and service registration.
  - [enhanced-agent-hub.js](../enhanced-agent-hub.js) — the entrypoint for the 12 enhanced agents; demonstrates how agents are initialized and how requests are routed through them.
  - [core-server.js](../core-server.js) — simple example of HTTP endpoints and runtime expectations.
  - [README.md](../README.md) — project quick-start, top-level commands, and environment notes.

- **Architecture summary (short)**:
  - Plan agent breaks complex tasks into steps; parallel subagents execute specific operations (refactor, debug, optimize). See `docs/AI_AGENT_ORCHESTRATION.md` for parallelism defaults (refactor=4, optimize=4, debug=2).
  - Orchestration registers services with a service mesh and pipes logs/metrics into the data pipeline (`orchestration/index.js`).
  - Enhanced agents (security, compliance, BI, etc.) are implemented as modules and accessed via `enhanced-agent-hub.js`.

- **Developer workflows & commands** (use these exact commands when scripting or running tasks):
  - Install dependencies: `npm install`
  - Start dev frontend: `npm run dev`
  - Start all servers (cross-platform): `npm run start:all` or `node scripts/start-all-servers.js`
  - Start orchestration locally: `node orchestration/index.js` (dashboard runs on port 9000)
  - Start standalone video player (dev):
    - `cd apps/frontend/html-pages`
    - `node video-player-server.js` (serves player at http://localhost:3000)
  - Tests: `npm test`
  - Lint & auto-fix: `npm run lint -- --fix`

- **Conventions and patterns to follow**:
  - ES modules are the primary module system. Some legacy files use CommonJS (.cjs or `require()`); prefer ESM when adding new modules.
  - Agents live in `frameworks/ai/agents/` and expose start/monitor/process functions. `enhanced-agent-hub.js` shows the expected interface: `initialize()`, `processRequest(req,res)`, and `getStatus()`.
  - Orchestration events: use the orchestrator event names shown in `orchestration/index.js` (`orchestration:ready`, `service:log`, `service:critical`, `metrics:collected`) when integrating with the data pipeline.
  - Hexarchy directories map responsibilities; place new code in the appropriate layer (e.g., AI code in `hexarchy/2-intelligence/` or `frameworks/ai/`).

- **Integration points & runtime details**:
  - API gateway: `http://localhost:8080` (documented in orchestration console logs)
  - Monitoring dashboard: `http://localhost:9000/dashboard` (served by orchestration)
  - Service discovery: `http://localhost:8500` (mentioned in orchestration startup logs)
  - ML services: Python-based under `services/video-generation/` (install via provided `install.py` script);
  - Node runtime: targets modern Node (ESM first). Be careful with `.cjs` and `.mjs` boundaries.

- **What to avoid / watch for**:
  - Don't assume all files are ESM — check the module style before editing imports/exports.
  - Large operations (refactors) should follow the Plan Agent pattern: break into steps, run tests, and use the repo's `scripts/refactoring/` utilities when available.
  - Avoid touching unrelated framework folders; the repo is intentionally wide and opinionated — put changes into the correct scope.

- **When creating patches**:
  - Run `npm run lint -- --fix` and `npm test` before proposing a patch.
  - Include references to the files you changed in the PR description and run the orchestrator's local dashboard to verify side-effects (start `orchestration/index.js`).

If anything here is unclear or you want deeper details (examples of agent interfaces, common event payload shapes, or a short checklist for safe large-scale refactors), tell me which section to expand.
