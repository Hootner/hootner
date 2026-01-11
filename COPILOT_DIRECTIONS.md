# 🤖 Copilot Directions for HOOTNER

## Quick Start Commands
```bash
# Essential setup
npm install && cd api/graphql && npm install
docker-compose up -d
npm run start:all

# Copilot workflow
node copilot-delegate.js delegate "Fix security issues"
node copilot-guide.js  # View delegation guide
```

## Repository Structure (Key Paths)
- **Frontend**: `apps/frontend/` - React 18 + TypeScript + Vite
- **API**: `api/graphql/` - GraphQL server with enhanced schema
- **AI Services**: `services/video-generation/` - Python ML services
- **Hexarchy**: `hexarchy/0-core/` to `hexarchy/8-operations/` - Clean architecture
- **Frameworks**: `frameworks/ai/`, `frameworks/backend/` - Organized by tech stack
- **Scripts**: `scripts/` - Automation and utilities
- **Docs**: `docs/` - Comprehensive documentation

## Code Standards
- **ES Modules**: Use `import/export` (Node.js 25.2.1)
- **Comments**: Add `// COPILOT: [description]` to changes
- **Error Handling**: Comprehensive try-catch blocks
- **Security First**: Always check for vulnerabilities
- **Chalk Colors**: Use for console output

## Key Files to Understand
1. `README.md` - Project overview and quick start
2. `.github/copilot-instructions.md` - Detailed architecture guide
3. `enhanced-agent-hub.js` - 75+ AI agents orchestration
4. `index.js` - Main orchestrator and hexagonal architecture coordinator
5. `agent-orchestrator-cli.js` - Advanced agent orchestration CLI
6. `copilot-delegate.js` - Task delegation system

## Workflow Integration
- **Task Delegation**: `node copilot-delegate.js delegate "task"`
- **Progress Monitoring**: `node copilot-delegate.js monitor`
- **GitHub Actions**: 24 automated workflows
- **Pre-commit Hooks**: Husky + lint-staged

## Security Focus Areas
- Injection attacks (SQL, XSS, NoSQL, LDAP)
- Deserialization vulnerabilities
- JWT/Firebase auth validation
- Rate limiting and CORS
- Dependency audits

## Development Patterns
- Hexagonal architecture layers
- Microservices with service mesh
- Real-time GraphQL subscriptions
- AI agent orchestration
- Container-first deployment

## Testing Strategy
- Unit: Vitest
- E2E: Playwright
- Load: k6
- Security: Snyk + CodeQL
- Chaos: 8 engineering scenarios

## Deployment
- Docker + Kubernetes + Istio
- Blue-green deployments
- AWS SAM serverless
- Multi-region sync
- Zero-downtime updates