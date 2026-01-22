# 🦉 Day 1: Prove the Owl Flies

**One command. 60 seconds. You're in.**

## Quick Start

```bash
# Windows
node scripts/onboard-dev.js
# or
powershell scripts/onboard-dev.ps1

# Linux/Mac
node scripts/onboard-dev.js
```

## What It Does

1. ✓ Checks Node.js 18+ installed
2. ✓ Verifies Docker is running
3. 📦 Starts MongoDB + Redis containers
4. 📥 Installs dependencies (if needed)
5. 🚀 Launches frontend + GraphQL API

## You'll See

```
✨ HOOTNER is ready!

🔗 Key URLs:
   Login:      http://localhost:3001
   Dashboard:  http://localhost:3005
   Player:     http://localhost:3001/video-player
   GraphQL:    http://localhost:4000/graphql
```

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)

## Troubleshooting

**"Docker not running"**
→ Start Docker Desktop

**"Port already in use"**
→ `docker-compose down && npm run stop:all`

**"Module not found"**
→ Delete `node_modules` and re-run script

## Next Steps

- 📖 [Architecture Overview](ARCHITECTURE.md)
- 🔐 [Security Setup](../SECURITY_CHECKLIST.md)
- 🤖 [AI Services Guide](readme/services-README.md)

---

**The owl is flying.** 🦉
