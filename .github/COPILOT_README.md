# GitHub Copilot Configuration for HOOTNER

This directory contains configuration files for GitHub Copilot and other AI coding assistants to work effectively with the HOOTNER platform.

## 📚 Documentation Files

### [copilot-directions.md](./copilot-directions.md)
**Comprehensive Copilot guide** with:
- Quick start commands
- Repository structure and key paths
- Code standards and conventions
- Security focus areas
- Testing and deployment strategies
- Best practices for Copilot users

**Start here** if you're new to using Copilot with HOOTNER.

### [copilot-instructions.md](./copilot-instructions.md)
**Quick orientation guide** for AI coding agents with:
- Big picture architecture overview
- Key files to read first
- Hexagonal architecture (9 layers)
- Developer workflows and commands
- Conventions and patterns
- Integration points and runtime details

**Use this** for quick reference on architecture and conventions.

### [copilot-agent.md](./copilot-agent.md)
**Custom agent configuration** for the HOOTNER Code Guardian:
- Agent name and description
- Specialized expertise areas
- Key files to focus on
- Security and code quality standards

## 🚀 Quick Start

### 1. Setup
```bash
# Install dependencies
npm install && cd api/graphql && npm install

# Start infrastructure
docker-compose up -d

# Start all services
npm run start:all
```

### 2. Use Copilot Task Delegation
```bash
# Delegate a task
node copilot-delegate.js delegate "Fix security issues"

# View delegation guide
node copilot-guide.js

# Monitor task progress
node copilot-delegate.js monitor

# Mark task complete
node copilot-delegate.js complete <taskId>
```

### 3. Follow Conventions
- Use ES Modules (`import`/`export`)
- Add `// COPILOT: [description]` comments to changes
- Use chalk for colored console output
- Run `npm run lint:fix` before committing

## 🔧 GitHub Actions Workflows

The `.github/workflows/` directory contains 24+ automated workflows including:

### Copilot-Specific Workflows
- **copilot-commits.yml**: Automated commit monitoring
- **copilot-review.yml**: Code review automation
- **copilot-monitor.yml**: Task progress monitoring (runs every 30 minutes)
- **copilot-docs.yml**: Documentation updates

### Other Workflows
- **commit-validation.yml**: Validate commit messages
- **dependency-update.yml**: Automated dependency updates
- **aws-compliance.yaml**: AWS compliance checks
- **auto-commit.yml**: Automated commits for specific changes

## 📂 Repository Structure

The HOOTNER platform uses a **hexagonal architecture** organized into layers:

```
hexarchy/
├── 0-core/         # Core business logic & orchestration
├── 1-foundation/   # Infrastructure layer
├── 2-intelligence/ # AI and analytics
├── 3-communication/# External interfaces (API, WebSocket)
├── 4-interface/    # User interfaces
├── 5-economy/      # Business logic (payments, billing)
├── 6-governance/   # Policies and access control
├── 7-data/         # Data management
└── 8-operations/   # DevOps and monitoring
```

Other key directories:
- **api/graphql/**: GraphQL server with Apollo
- **services/video-generation/**: Python ML services
- **docs/**: Comprehensive documentation
- **.github/scripts/**: Automation utilities

## 🔐 Security Standards

Always check for and fix:
- ✅ SQL injection vulnerabilities
- ✅ XSS (Cross-Site Scripting) attacks
- ✅ NoSQL and LDAP injection
- ✅ Deserialization vulnerabilities
- ✅ JWT/Firebase authentication issues
- ✅ Missing rate limiting
- ✅ CORS misconfigurations
- ✅ Dependency vulnerabilities

Run security audits:
```bash
npm run security:audit
npm run lint:security
npm audit
```

## 🧪 Testing

```bash
# Unit tests (Vitest)
npm test
npm run test:unit

# E2E tests (Playwright)
npm run test:e2e

# Chaos engineering
npm run chaos:test

# Smoke tests
npm run test:smoke
```

## 🎨 Code Style

### ES Modules
```javascript
// ✅ Correct - ES Modules
import { someFunction } from './module.js';
export { myFunction };

// ❌ Avoid - CommonJS (unless required for compatibility)
const { someFunction } = require('./module');
module.exports = { myFunction };
```

### COPILOT Comments
```javascript
// COPILOT: Added input validation to prevent XSS attacks
const sanitizedInput = sanitize(userInput);

// COPILOT: Implemented rate limiting for API endpoint
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

### Console Output
```javascript
import chalk from 'chalk';

console.log(chalk.green('✅ Task completed'));
console.log(chalk.red('❌ Error occurred'));
console.log(chalk.yellow('⚠️ Warning'));
console.log(chalk.blue('ℹ️ Information'));
```

### Error Handling
```javascript
try {
  await riskyOperation();
} catch (error) {
  console.error(chalk.red(`Error: ${error.message}`));
  // Log error details
  console.error(error.stack);
  // Exit with error code for CLI tools
  process.exit(1);
}
```

## 📖 Additional Resources

### Documentation
- [Main README](../README.md) - Project overview
- [Documentation Index](../docs/DOCUMENTATION_INDEX.md) - Complete docs
- [MCP Integration](../docs/MCP_INTEGRATION.md) - Model Context Protocol
- [Security Report](../.security-report.md) - Security findings

### Scripts
- [copilot-delegate.js](../copilot-delegate.js) - Task delegation system
- [copilot-guide.js](../copilot-guide.js) - Interactive guide
- [enhanced-agent-hub.js](../enhanced-agent-hub.js) - 75+ AI agents

### Configuration
- [package.json](../package.json) - npm scripts and dependencies
- [docker-compose.yml](../docker-compose.yml) - Service orchestration
- [.eslintrc.json](../.eslintrc.json) - ESLint configuration

## 🤝 Contributing with Copilot

1. **Create a feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Delegate task to track work**
   ```bash
   node copilot-delegate.js delegate "Implement feature X" file1.js file2.js
   ```

3. **Make changes with Copilot**
   - Use `@workspace` commands in your IDE
   - Add `// COPILOT:` comments to changes
   - Follow the code standards

4. **Validate changes**
   ```bash
   npm run lint:fix
   npm test
   npm run security:audit
   ```

5. **Monitor progress**
   ```bash
   node copilot-delegate.js monitor
   ```

6. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: implement feature X"
   git push origin feature/my-feature
   ```

7. **Mark task complete**
   ```bash
   node copilot-delegate.js complete <taskId>
   ```

## 🆘 Troubleshooting

### Copilot scripts not working
```bash
# Reinstall dependencies
npm install

# Verify chalk is installed
npm list chalk
```

### Linting errors
```bash
# Auto-fix most issues
npm run lint:fix

# Check specific configuration
npm run lint:security
npm run lint:frontend
```

### Dependencies outdated
```bash
# Check for updates
npm outdated

# Update (careful with breaking changes)
npm update

# Run security audit
npm audit
npm audit fix
```

## 📊 Monitoring

### Task Monitoring
- GitHub Actions runs `copilot-monitor.yml` every 30 minutes
- Check `.github/workflows/` for workflow status
- View logs in GitHub Actions tab

### Application Monitoring
```bash
# PM2 process monitoring
npm run runtime:monitor

# View logs
npm run runtime:logs

# Health check
npm run health:check
```

## 🎯 Best Practices

1. **Security First**: Always prioritize security vulnerabilities
2. **Test Thoroughly**: Run tests before committing
3. **Document Changes**: Add clear comments and update docs
4. **Use Type Safety**: Leverage TypeScript when possible
5. **Follow Patterns**: Stick to established hexarchy patterns
6. **Review Code**: Use GitHub's code review features
7. **Monitor Progress**: Use the delegation system to track work
8. **Stay Updated**: Keep dependencies and tools current

---

**Remember**: The owl never sleeps 🦉 - HOOTNER is built for 24/7 operation with automated monitoring and AI-driven workflows.

For more information, see [copilot-directions.md](./copilot-directions.md).
