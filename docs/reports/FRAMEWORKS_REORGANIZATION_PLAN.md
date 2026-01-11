# Frameworks Reorganization Plan

## Overview
Restructure the project to centralize all framework configurations in a dedicated `frameworks/` directory for better organization and maintainability.

## Current State Issues
- Framework configs scattered across multiple directories
- Mixed concerns (app code + framework setup)
- Difficult dependency management
- Hard to track framework versions

## Target Structure

```
frameworks/
├── frontend/
│   ├── react/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── config.js
│   ├── vite/
│   │   ├── vite.config.js
│   │   └── plugins/
│   ├── tailwind/
│   │   ├── tailwind.config.js
│   │   └── themes/
│   └── typescript/
│       ├── tsconfig.json
│       └── types/
├── backend/
│   ├── express/
│   │   ├── middleware/
│   │   └── config.js
│   ├── nestjs/
│   │   ├── modules/
│   │   └── decorators/
│   ├── graphql/
│   │   ├── schemas/
│   │   └── resolvers/
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.*
│   │   └── compose/
│   ├── kubernetes/
│   │   ├── manifests/
│   │   └── helm/
│   ├── istio/
│   │   └── configs/
│   └── monitoring/
│       ├── prometheus/
│       └── grafana/
├── testing/
│   ├── vitest/
│   │   └── config/
│   ├── playwright/
│   │   └── config/
│   └── chaos/
│       └── scenarios/
├── security/
│   ├── helmet/
│   ├── auth/
│   └── middleware/
└── ai/
    ├── mcp/
    └── agents/
```

## Migration Steps

### Phase 1: Create Framework Structure
1. Create `frameworks/` directory with subdirectories
2. Move framework configs (no code changes yet)
3. Update import paths in package.json scripts

### Phase 2: Frontend Frameworks
**Move from → to:**
- `config/testing/vitest.config.*` → `frameworks/testing/vitest/`
- `config/testing/playwright.config.*` → `frameworks/testing/playwright/`
- `config/linting/eslint.*` → `frameworks/frontend/linting/`
- `config/linting/.prettierrc` → `frameworks/frontend/prettier/`

### Phase 3: Backend Frameworks
**Move from → to:**
- `middleware/` → `frameworks/backend/express/middleware/`
- `lib/` (framework utilities) → `frameworks/backend/shared/`
- `prisma/` → `frameworks/backend/prisma/`

### Phase 4: Infrastructure Frameworks
**Move from → to:**
- `config/docker/` → `frameworks/infrastructure/docker/`
- `infrastructure/` → `frameworks/infrastructure/`
- `k8s/` → `frameworks/infrastructure/kubernetes/`

### Phase 5: Security Frameworks
**Move from → to:**
- `middleware/security*` → `frameworks/security/middleware/`
- `config/security/` → `frameworks/security/config/`

### Phase 6: AI Frameworks
**Move from → to:**
- `ai-services/` → `frameworks/ai/services/`
- MCP configs → `frameworks/ai/mcp/`

## Files to Update

### Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest --config frameworks/testing/vitest/config.js",
    "test:e2e": "playwright test --config frameworks/testing/playwright/config.js",
    "lint": "eslint --config frameworks/frontend/linting/eslint.config.js",
    "build": "vite build --config frameworks/frontend/vite/config.js"
  }
}
```

### Import Path Updates
- Update all relative imports to use new framework paths
- Update Docker COPY commands
- Update CI/CD workflow paths

## Benefits After Reorganization

### ✅ Improved Organization
- Clear separation of framework vs application code
- Easier to find and manage framework configurations
- Better dependency tracking

### ✅ Maintainability
- Framework updates isolated to specific directories
- Easier to upgrade/replace frameworks
- Clear ownership of framework-specific code

### ✅ Developer Experience
- Faster onboarding (clear framework structure)
- Easier debugging (know where to look)
- Better IDE support (organized imports)

### ✅ DevOps Benefits
- Cleaner Docker builds (copy only needed frameworks)
- Better caching strategies
- Easier CI/CD configuration

## Implementation Timeline

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1 | 1 day | High |
| Phase 2 | 2 days | High |
| Phase 3 | 2 days | Medium |
| Phase 4 | 1 day | Medium |
| Phase 5 | 1 day | High |
| Phase 6 | 1 day | Low |

**Total Estimated Time:** 8 days

## Risk Mitigation

### Backup Strategy
- Create git branch before starting
- Test each phase independently
- Keep rollback scripts ready

### Testing Strategy
- Run full test suite after each phase
- Verify all services start correctly
- Check CI/CD pipelines work

### Communication
- Update team on progress
- Document any breaking changes
- Provide migration guide for developers

## Success Criteria

- [ ] All framework configs moved to `frameworks/` directory
- [ ] All tests pass
- [ ] All services start without errors
- [ ] CI/CD pipelines work
- [ ] Documentation updated
- [ ] Team trained on new structure

## Next Steps

1. **Review and approve** this plan
2. **Create backup branch** for safety
3. **Start with Phase 1** (low risk)
4. **Test thoroughly** after each phase
5. **Update documentation** as we go

---

*This reorganization will significantly improve the project's maintainability and developer experience while following modern project structure best practices.*