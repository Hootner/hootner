# Architecture Naming Convention

## 🦉 IMPORTANT: Use `hexarchy/` NOT `heptagonal/`

### Actual Directory Structure
The HOOTNER platform uses a **9-layer architecture** (layers 0-8) located in the `hexarchy/` directory:

```
hexarchy/
├── 0-core/           # API, auth, AWS, database, logging, security
├── 1-foundation/     # Domain models, validators, repositories
├── 2-intelligence/   # AI services, video generation, ML models
├── 3-communication/  # API adapters, GraphQL, MCP server
├── 4-interface/      # React components, UI frameworks
├── 5-economy/        # Business logic, Stripe, revenue
├── 6-governance/     # Compliance, moderation, legal
├── 7-data/           # Analytics, backup, caching, storage
└── 8-operations/     # CI/CD, deployment, IaC, monitoring
```

### Why the Confusion?

The platform is sometimes referred to as "heptagonal" (7-sided) or with "heptagonal" in documentation, but:
- ✅ **ACTUAL FOLDER**: `hexarchy/` (9 layers: 0-8)
- ❌ **DOES NOT EXIST**: `heptagonal/` folder

### Auto-Detection Pattern

Many scripts use auto-detection to handle both names gracefully:

```javascript
// ✅ RECOMMENDED: Auto-detect with fallback
const serverPath = fs.existsSync('heptagonal/3-communication/adapters/enhanced-mcp-server.js')
  ? 'heptagonal/3-communication/adapters/enhanced-mcp-server.js'
  : 'hexarchy/3-communication/adapters/enhanced-mcp-server.js';
```

### When to Use Each

**In Code/Scripts:**
- **ALWAYS use**: `hexarchy/` (the actual folder)
- **OR use**: Auto-detection pattern with `hexarchy/` as fallback

**In Documentation:**
- **Architecture name**: "Heptagonal architecture" or "9-layer architecture"
- **File paths**: Always use `hexarchy/` for actual paths

### Examples

✅ **CORRECT**:
```bash
npm run start:api    # Uses hexarchy/3-communication/adapters/graphql-api
npm run aws:setup    # Uses hexarchy/8-operations/infrastructure/aws-setup.js
```

❌ **INCORRECT** (will fail):
```bash
cd heptagonal/3-communication/adapters/graphql-api  # Directory doesn't exist!
```

### Script Updates

The following npm scripts correctly reference `hexarchy/`:
- `start:api`
- `build:api`
- `aws:setup`
- `build:css:prod`
- `build:css:watch`
- `monitor:metrics`
- `test:integration`
- `infra:deploy`
- `db:migrate`
- `containers:start`
- `postinstall` (✅ FIXED in recent commit)

### Key Files Using Auto-Detection

These files correctly handle both naming conventions:
- `scripts/enhanced-mcp-client.js`
- `scripts/connect-mcp.js`
- `scripts/vscode-amazonq-bridge.js`
- `api/routes/amazon-q-chat.js`

### Memory Aid

Think of it this way:
- **"Heptagonal"** = Architecture concept (7-sided polygon → 9 layers in our case)
- **"hexarchy"** = Actual folder name (like "hierarchy" but with hex/hexa prefix)

---

**Remember**: When in doubt, use `hexarchy/` for file paths! 🦉
