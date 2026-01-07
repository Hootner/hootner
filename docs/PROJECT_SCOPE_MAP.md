# HOOTNER Project - Complete Scope Map

## 🎯 **What This Project Is**
Enterprise AI-powered development platform with MCP integration, microservices architecture, and autonomous agent orchestration.

---

## 📊 **The Big Picture (5 Core Layers)**

### **Layer 1: AI Brain** 🧠
```
.amazonq/
├── agents/ (30+ specialized AI agents)
│   ├── layer0-mathematical-foundations
│   ├── layer2-language-compilation
│   ├── layer3-os-kernel
│   ├── layer4-virtualization-runtime
│   ├── layer5-networking-communication
│   ├── layer6-data-storage
│   ├── layer7-web-servers
│   ├── layer8-browser-ui
│   ├── layer9-games-graphics
│   ├── layer10-dev-tools
│   └── layer11-advanced-systems
├── rules/ (Project context & guidelines)
└── training/ (Learned patterns)
```
**Purpose:** AI agents that understand every layer of computing from math to UI

---

### **Layer 2: Application Core** 💻
```
apps/frontend/          → React + Vite UI
servers/ (9 servers)    → Backend services
├── collab-server.js           → Real-time collaboration
├── electron-code-editor       → Code editor backend
├── hootner-mcp-server         → MCP integration
├── html-pages-server          → Static serving
├── hub-app                    → Central hub
├── mcp-server                 → Model Context Protocol
├── secure-server              → HTTPS server
└── video-player-server        → Video streaming

services/ (11+ microservices)
├── Analytics (3001)    → Metrics & tracking
├── Auth (3003)         → Authentication
├── Video (3012)        → Video processing
├── Marketplace (3006)  → Trading platform
└── ... 7 more services
```
**Purpose:** The actual applications users interact with

---

### **Layer 3: Intelligence & Data** 🤖
```
services/
├── massive-training-data/
│   ├── github-repos/          → Code examples
│   ├── books.txt              → Technical books
│   ├── wikipedia.txt          → Knowledge base
│   └── qa.txt                 → Q&A pairs
├── video-generation/          → ML video models
│   ├── diffusion.py
│   ├── generator.py
│   └── unet.py
└── llm-service.py             → Language model API
```
**Purpose:** Training data & ML models for AI capabilities

---

### **Layer 4: Infrastructure** 🏗️
```
config/
├── docker/                    → Containerization
├── security/                  → Security policies
├── testing/                   → Test configs
└── vscode/                    → IDE settings

k8s/                           → Kubernetes deployments
traefik/                       → Reverse proxy & TLS
middleware/ (25+ files)        → Security, auth, logging
lib/ (20+ utilities)           → Shared libraries
logs/                          → Structured logging
├── services/
├── servers/
├── access/
└── errors/
```
**Purpose:** DevOps, security, monitoring, and shared utilities

---

### **Layer 5: Automation & Tools** 🛠️
```
scripts/
├── agents/                    → Auto-fix agents
├── ai/                        → AI orchestration
├── analysis/                  → Code scanning
├── monitoring/                → Performance tracking
├── refactoring/               → Code quality
└── utilities/                 → Helper scripts

.github/
├── workflows/                 → CI/CD pipelines
│   ├── aws-compliance.yml
│   ├── security-scan.yml
│   └── performance-tests.yml
└── scripts/                   → GitHub automation
```
**Purpose:** Automation, CI/CD, code quality, and DevOps tools

---

## 🔄 **How Everything Connects**

```
User Request
    ↓
[Frontend UI] ← WebSocket → [Collab Server]
    ↓
[Hub App] → Routes to → [Microservices]
    ↓                       ↓
[Auth Service]         [Video Service]
    ↓                       ↓
[Database] ← Logs → [Logging System]
    ↓
[AI Agents] → Analyze → [Training Data]
    ↓
[MCP Server] → Amazon Q Integration
```

---

## 📈 **Scale & Complexity**

| Component | Count | Purpose |
|-----------|-------|---------|
| **AI Agents** | 30+ | Specialized knowledge domains |
| **Servers** | 9 | Backend services |
| **Microservices** | 11+ | Business logic |
| **Middleware** | 25+ | Security, auth, logging |
| **Scripts** | 100+ | Automation & tools |
| **Config Files** | 50+ | Settings & policies |
| **Training Data** | 5GB+ | ML model training |
| **GitHub Workflows** | 11 | CI/CD automation |

---

## 🎯 **Key Capabilities**

### **1. AI-Powered Development**
- Multi-agent orchestration (30+ agents)
- Cursor-style AI modes (Chat, Write, Refactor)
- Autonomous code fixing
- Real-time collaboration

### **2. Enterprise Infrastructure**
- Docker + Kubernetes deployment
- Blue-green deployments
- Chaos engineering tests
- Multi-region sync
- Automated backups

### **3. Security & Compliance**
- JWT authentication
- Rate limiting & CORS
- Injection attack protection
- Security scanning (Snyk)
- Audit logging

### **4. Monitoring & Observability**
- Structured logging (Winston)
- Performance tracking
- Error monitoring
- Sustainability metrics
- Grafana dashboards

### **5. ML & AI Services**
- Video generation (diffusion models)
- LLM service (transformer models)
- Training data pipeline
- Embeddings & vector DB

---

## 🚀 **Workflow Example**

**Scenario:** User wants to deploy a new feature

1. **Developer writes code** → Frontend UI
2. **AI agents analyze** → Code quality check
3. **Collab server syncs** → Real-time updates
4. **MCP integration** → Amazon Q reviews
5. **Security scan** → Middleware validates
6. **Logs captured** → Winston logging
7. **Tests run** → GitHub Actions
8. **Deploy** → Kubernetes cluster
9. **Monitor** → Grafana dashboard
10. **Learn** → Training data updated

---

## 💡 **Why This Architecture?**

### **Modularity**
- Each service is independent
- Easy to scale individual components
- Microservices can be deployed separately

### **AI-First**
- 30+ specialized agents for every domain
- Training data pipeline for continuous learning
- MCP integration for Amazon Q

### **Production-Ready**
- Enterprise security (25+ middleware)
- Comprehensive logging
- CI/CD automation
- Chaos engineering

### **Developer Experience**
- Real-time collaboration
- Visual designer
- Auto-fix agents
- IDE integration

---

## 📁 **Directory Purpose Summary**

| Directory | What It Does |
|-----------|--------------|
| `.amazonq/` | AI agent definitions & training |
| `apps/` | Frontend applications |
| `servers/` | Backend server implementations |
| `services/` | Microservices + ML models |
| `middleware/` | Security, auth, logging layers |
| `lib/` | Shared utilities & helpers |
| `scripts/` | Automation & DevOps tools |
| `config/` | All configuration files |
| `logs/` | Structured logging output |
| `k8s/` | Kubernetes deployments |
| `tests/` | Unit, integration, e2e tests |
| `.github/` | CI/CD workflows |
| `docs/` | Documentation & reports |

---

## 🎓 **Learning Path**

**To understand this project:**

1. **Start:** `README.md` → Overview
2. **Architecture:** `docs/ARCHITECTURE.md` → System design
3. **AI Agents:** `.amazonq/agents/README.md` → Agent hierarchy
4. **Servers:** `servers/` → Backend services
5. **Services:** `services/` → Microservices
6. **Scripts:** `scripts/README.md` → Automation
7. **Logs:** `logs/` → Observability

---

## 🔑 **Key Files to Know**

| File | Purpose |
|------|---------|
| `package.json` | 40+ npm scripts |
| `server.js` | Main entry point |
| `lib/logger.js` | Logging infrastructure |
| `.amazonq/rules/project-context.md` | Project rules |
| `mcp-server.js` | Amazon Q integration |
| `docker-compose.yml` | Container orchestration |

---

**Bottom Line:** This is a full-stack, AI-powered, enterprise-grade development platform with microservices, ML models, and autonomous agents - all integrated with Amazon Q Developer.
