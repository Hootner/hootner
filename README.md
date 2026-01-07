# HOOTNER MCP Integration

Enterprise-grade Amazon Q Developer MCP integration for HOOTNER deployment, monitoring, and AI-powered development workflows.

## Quick Start

```bash
npm install
npm run mcp:start              # Start MCP server
npm run dev                    # Development mode
node servers/collab-server.js  # Collaboration server
```

## Project Structure

```
my-local-repo/
├── .amazonq/                  # Amazon Q configuration
│   ├── agents/               # AI agent definitions (30+ specialized agents)
│   ├── rules/                # Project context rules
│   └── training/             # Learned patterns
├── apps/frontend/            # React + Vite frontend
├── servers/                  # 9 server implementations
├── services/                 # Microservices & ML models
├── scripts/                  # Automation & utilities
├── middleware/               # Security & auth layers
├── lib/                      # Shared libraries
├── k8s/                      # Kubernetes deployments
└── docs/                     # Documentation
```

## Available Servers (9)

1. **collab-server.js** - Real-time collaboration
2. **electron-code-editor-server.js** - Code editor backend
3. **hootner-mcp-server.js** - MCP integration
4. **html-pages-server.js** - Static page serving
5. **hub-app.js** - Central hub application
6. **mcp-server.js** - Model Context Protocol
7. **secure-server.js** - HTTPS server
8. **video-player-server.js** - Video streaming

## MCP Tools

- `getProjectInfo` - Project structure & configuration
- `listServices` - List all running services
- `getServiceStatus` - Check service health
- `readLogs` - Application log access

## Key Features

### AI-Powered Development
- **40+ npm scripts** for automation
- **Multi-agent orchestration** with specialized AI agents
- **Cursor-style AI modes** (Chat, Write, Refactor, Modernize)
- **Real-time collaboration** with conflict resolution
- **Visual designer** with drag-and-drop UI

### Infrastructure
- Docker multi-stage builds
- Kubernetes orchestration with Istio
- Blue-green deployments
- Chaos engineering tests
- Automated backups with PITR
- Multi-region sync

### Security
- JWT authentication
- Helmet.js security headers
- Rate limiting & CORS
- Content Security Policy
- Injection attack protection
- DOMPurify XSS prevention
- Snyk security scanning

### Monitoring
- Prometheus metrics
- Grafana dashboards
- Performance tracking
- Error monitoring
- Sustainability metrics

## Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Kubernetes (optional)

### Environment Setup
```bash
cp env/.env.example .env
npm install
```

### Run Services
```bash
# Development
npm run dev

# Secure HTTPS
npm run dev:secure

# Collaboration
npm run collab

# MCP Server
npm run mcp:start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run mcp:start` | Start MCP server |
| `npm run mcp:test` | Test MCP tools |
| `npm run deploy:dev` | Deploy development |
| `npm run deploy:prod` | Deploy production |
| `npm run security:audit` | Security scan |
| `npm run chaos:test` | Chaos engineering |
| `npm run backup:full` | Full backup |
| `npm run lint` | Lint codebase |
| `npm run lint:fix` | Auto-fix linting issues |

## Architecture

### Microservices (11+)
- Analytics Service (Port 3001)
- Audit Service (Port 3002)
- Auth Service (Port 3003)
- Content Moderation (Port 3004)
- Event Service (Port 3005)
- Marketplace (Port 3006)
- Police Bot (Port 3007)
- Profile Service (Port 3008)
- Search Service (Port 3009)
- Security Service (Port 3010)
- Subscription Service (Port 3011)
- Video Service (Port 3012)

### Communication
- REST APIs (HTTP/JSON)
- GraphQL Gateway
- Event-driven messaging
- JWT authentication flow

## AI Agents

30+ specialized agents organized in layers:
- **Layer 0:** Mathematical foundations
- **Layer 2:** Language compilation
- **Layer 3:** OS kernel
- **Layer 4:** Virtualization & runtime
- **Layer 5:** Networking & communication
- **Layer 6:** Data storage
- **Layer 7:** Web servers
- **Layer 8:** Browser UI
- **Layer 9:** Games & graphics
- **Layer 10:** Dev tools
- **Layer 11:** Advanced systems

## Testing

```bash
npm test                    # Run all tests
npm run test:chaos          # Chaos engineering
npm run test:load           # Load testing
npm run security:audit      # Security audit
```

## Deployment

### Docker
```bash
docker build -t hootner-mcp .
docker-compose up
```

### Kubernetes
```bash
kubectl apply -f k8s/
./scripts/blue-green-deploy.sh
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Deployment Checklist](.github/QUICK_SETUP.md)
- [Chaos Engineering](docs/CHAOS_ENGINEERING.md)
- [AI Agent Orchestration](docs/AI_AGENT_ORCHESTRATION.md)
- [Security Guide](docs/INJECTION_PROTECTION.md)

## Configuration

### VS Code Settings
- Location: `.vscode/settings.json`
- MCP servers: hootner-deployment, aws-cdk
- TODO tracking: 17 tag types
- Auto-format: Prettier + ESLint

### Environment Variables
See `env/.env.example` for required configuration:
- GitHub token
- Pastebin API key
- JSONBin API key
- Database URL
- JWT secret
- Firebase credentials

## License

MIT License

## Support

- Issues: GitHub Issues
- Documentation: `docs/`
- Last Updated: 2025-12-31

---

**HOOTNER** - The Owl Never Sleeps 🦉
