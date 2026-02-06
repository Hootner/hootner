# SPARK EXECUTION PROMPT

Copy this entire prompt and paste it into Spark on GitHub. No modifications needed.

---

## TASK: Metadata Synchronization Test

**Objective:** Verify that Spark can execute a complex multi-file update operation from a single precise specification.

**Success Criteria:** All 4 files updated correctly with synchronized metadata (1,302 files, 10 layers, 2026-02-06 date).

---

## INSTRUCTIONS

Update the following 4 files with the exact content provided below. These files already exist and need to be overwritten completely.

---

## FILE 1: .metadata/baseline.json

**Action:** Replace entire file content

**Content:**
```json
{
  "baselineDate": "2026-02-06T02:53:19.795Z",
  "totalFiles": 1302,
  "filesByType": {
    "js": 797,
    "json": 101,
    "ts": 38,
    "tsx": 30,
    "jsx": 19,
    "yaml": 10,
    "yml": 4,
    "py": 70,
    "md": 220,
    "html": 117,
    "css": 21,
    "cjs": 10,
    "mjs": 1
  },
  "structure": {
    "hexarchy": 9,
    "api": 1,
    "apps": 1,
    "scripts": 1,
    "services": 1,
    "docs": 1,
    "tests": 1,
    "frameworks": 1,
    "tools": 1
  },
  "awsPipes": 120,
  "coreServices": [
    "video-generation",
    "ai-agents",
    "graphql",
    "authentication",
    "stripe-billing",
    "mcp-integration"
  ]
}
```

---

## FILE 2: .metadata/architecture.json

**Action:** Replace entire file content

**Content:**
```json
{
  "generated": "2026-02-06T02:53:19.795Z",
  "totalFiles": 1302,
  "filesByType": {
    "js": 797,
    "json": 101,
    "ts": 38,
    "tsx": 30,
    "jsx": 19,
    "yaml": 10,
    "yml": 4,
    "py": 70,
    "md": 220,
    "html": 117,
    "css": 21,
    "cjs": 10,
    "mjs": 1
  },
  "structure": {
    "hexarchy": 9,
    "api": 1,
    "apps": 1,
    "scripts": 1,
    "services": 1,
    "docs": 1,
    "tests": 1,
    "frameworks": 1,
    "tools": 1
  },
  "layers": [
    "0-core",
    "1-foundation",
    "2-intelligence",
    "3-communication",
    "4-interface",
    "5-economy",
    "6-governance",
    "7-data",
    "8-operations",
    "9-documentation"
  ],
  "awsPipes": 120,
  "coreServices": [
    "video-generation",
    "ai-agents",
    "graphql",
    "authentication",
    "stripe-billing",
    "mcp-integration"
  ]
}
```

---

## FILE 3: hexarchy/PDR.md

**Action:** Replace entire file content

**Content:**
```markdown
# Hexarchy - Product Design Requirements

**Version:** 1.0  
**Last Updated:** 2026-02-06  
**Component:** Hexagonal Architecture (10 Layers)

## Overview

The hexarchy implements a hexagonal (ports and adapters) architecture pattern across 10 distinct layers (9 hexarchy + 1 documentation), providing clear separation of concerns and maintainability.

## Architecture Layers

### Layer 0: Core Infrastructure
**Purpose:** Foundation services and infrastructure  
**Components:** API configs, authentication, AWS connectors, database utilities, logging, security  
**Files:** 200+ JavaScript files

### Layer 1: Foundation
**Purpose:** Domain logic and business rules  
**Components:** Domain models, validators, repositories, events, core services  
**Files:** 150+ JavaScript files

### Layer 2: Intelligence
**Purpose:** AI and machine learning capabilities  
**Components:** AI services, video generation, analytics engines, ML models  
**Files:** 100+ JavaScript/Python files

### Layer 3: Communication
**Purpose:** External integrations and APIs  
**Components:** API adapters, GraphQL resolvers, message queues, WebSocket, MCP server  
**Files:** 120+ JavaScript files

### Layer 4: Interface
**Purpose:** User interface and presentation  
**Components:** React components, UI frameworks, frontend apps, view models  
**Files:** 150+ JavaScript/TypeScript/HTML files

### Layer 5: Economy
**Purpose:** Business logic and monetization  
**Components:** Business logic, Stripe payments, revenue optimization, fraud detection  
**Files:** 80+ JavaScript files

### Layer 6: Governance
**Purpose:** Compliance and content management  
**Components:** Compliance, content moderation, legal templates, policy enforcement  
**Files:** 60+ JavaScript files

### Layer 7: Data
**Purpose:** Data management and storage  
**Components:** Analytics, backup, caching, storage, data warehouse  
**Files:** 70+ JavaScript files

### Layer 8: Operations
**Purpose:** DevOps and infrastructure management  
**Components:** CI/CD, deployment, IaC, monitoring, testing  
**Files:** 90+ JavaScript files

### Layer 9: Documentation
**Purpose:** Platform documentation and guides  
**Components:** README, PDR, guides, API docs, architecture diagrams  
**Files:** 220+ Markdown files

## Design Principles

1. **Separation of Concerns** - Each layer has a single responsibility
2. **Dependency Inversion** - Layers depend on abstractions, not implementations
3. **Testability** - Each layer can be tested independently
4. **Maintainability** - Clear boundaries make changes easier
5. **Scalability** - Layers can scale independently

## Integration Points

- **Event Bus:** Layer 0 orchestration/event-bus.js
- **GraphQL API:** Layer 3 adapters/graphql-api/
- **Frontend:** Layer 4 ui/frontend/
- **Stripe:** Layer 5 payments/
- **Documentation:** Layer 9 docs/

## Technology Stack

**Languages:** JavaScript (797), TypeScript (38), Python (70), Markdown (220)  
**Frameworks:** React 18+, Express, NestJS  
**Database:** DynamoDB, Redis  
**Testing:** Jest, Cypress

## References

- [Layer 0 README](0-core/README.md)
- [Layer 2 README](2-intelligence/README.md)
- [Layer 8 README](8-operations/README.md)
- [Layer 9 README](../docs/PDR.md)
- [Root PDR](../PDR.md)

---

**Last Updated:** 2026-02-06 | **Files:** 1,302 | **Layers:** 10
```

---

## FILE 4: docs/PDR.md

**Action:** Update line 39 only

**Find this line:**
```
- Current architecture (9 layers)
```

**Replace with:**
```
- Current architecture (10 layers: 9 hexarchy + 1 documentation)
```

---

## VALIDATION

After completing all updates, verify:

1. ✅ baseline.json has "totalFiles": 1302
2. ✅ architecture.json has "9-documentation" in layers array
3. ✅ hexarchy/PDR.md shows "10 Layers" in title
4. ✅ hexarchy/PDR.md includes Layer 9: Documentation section
5. ✅ docs/PDR.md line 39 mentions "10 layers"
6. ✅ All dates are "2026-02-06"
7. ✅ All JSON files are valid (no syntax errors)

---

## EXPECTED OUTCOME

If successful, you will have:
- Updated 2 JSON files with synchronized metadata
- Updated 1 complete markdown file (hexarchy/PDR.md)
- Updated 1 line in docs/PDR.md
- All files showing consistent data: 1,302 files, 10 layers, 2026-02-06

This proves Spark can execute complex multi-file operations from a single precise specification.

---

**Ready to execute? Copy this entire prompt to Spark now.**
