# Metadata Synchronization Recipe for Spark

**Task:** Update all metadata files to reflect current platform state

## Exact Specifications

### Platform Stats (Source of Truth)
```json
{
  "date": "2026-02-06",
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
  "layers": 10,
  "layerBreakdown": "9 hexarchy + 1 documentation",
  "awsPipes": 120,
  "coreServices": 6,
  "aiAgents": "75+"
}
```

## Files to Update

### 1. README.md
**Location:** `d:\my-local-repo\README.md`

**Changes:**
- Line 7: Change to `- **1,302 Files** across 10 architectural layers (9 hexarchy + 1 documentation)`
- Line 27: Change to `## 🏗️ Hexagonal Architecture (10 Layers)`
- After "Layer 8: Operations" add:
  ```
  ### Layer 9: Documentation
  README, PDR, guides, API docs, architecture diagrams (220 files)
  ```
- Footer: Change to `**Last Updated:** 2026-02-06 | **Version:** 1.0 | **Files:** 1,302 | **Layers:** 10`
- Remove all content after the footer (duplicate marketing sections)

### 2. .metadata/baseline.json
**Location:** `d:\my-local-repo\.metadata\baseline.json`

**Replace entire file:**
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

### 3. .metadata/architecture.json
**Location:** `d:\my-local-repo\.metadata\architecture.json`

**Replace entire file:**
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

### 4. .metadata/codebase.json
**Location:** `d:\my-local-repo\.metadata\codebase.json`

**Changes:**
- Line 2: `"generated": "2026-02-06T02:53:19.793Z",`
- Line 4: `"totalFiles": 1302,`
- After line 4, add:
```json
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
  "awsPipes": 120,
  "coreServices": [
    "video-generation",
    "ai-agents",
    "graphql",
    "authentication",
    "stripe-billing",
    "mcp-integration"
  ],
```

### 5. PDR_METADATA.md
**Location:** `d:\my-local-repo\PDR_METADATA.md`

**Changes:**
- Line 5: `**Last Updated:** 2026-02-06`
- Line 8: `**Next Review:** Q2 2026`
- After line 24 add: `- **Layers:** 10 (9 hexarchy + 1 documentation)`
- Line 33: Change to `- Layers: 10 (9 hexarchy + 1 documentation)`
- Line 95: Change to `- 2026-02-06: v1.0 - Updated with current metadata (1,302 files, 10 layers)`

### 6. Create PDR.md (Root)
**Location:** `d:\my-local-repo\PDR.md`

**Content:** See attached template (Section A below)

### 7. Create PDR.md (Hexarchy)
**Location:** `d:\my-local-repo\hexarchy\PDR.md`

**Content:** See attached template (Section B below)

### 8. Create PDR.md (Docs)
**Location:** `d:\my-local-repo\docs\PDR.md`

**Content:** See attached template (Section C below)

### 9. Create PDR.md (Services)
**Location:** `d:\my-local-repo\services\PDR.md`

**Content:** See attached template (Section D below)

---

## Templates

### Section A: Root PDR.md
```markdown
# HOOTNER - Product Design Requirements

**Version:** 1.0  
**Last Updated:** 2026-02-06  
**Status:** Active Development  
**Project:** AI-Native Video Intelligence Platform

## Platform Overview

**Total Files:** 1,302  
**Architecture:** Hexagonal (10 layers: 9 hexarchy + 1 documentation)  
**AWS Pipes:** 120  
**Core Services:** 6  
**AI Agents:** 75+

[... rest of content from current PDR.md ...]
```

### Section B: Hexarchy PDR.md
```markdown
# Hexarchy - Product Design Requirements

**Version:** 1.0  
**Last Updated:** 2026-02-06  
**Component:** Hexagonal Architecture (10 Layers)

[... content describing 9 hexarchy layers + 1 documentation layer ...]

**Last Updated:** 2026-02-06 | **Files:** 1,302 | **Layers:** 10
```

### Section C: Docs PDR.md
```markdown
# Documentation - Product Design Requirements

**Version:** 1.0  
**Last Updated:** 2026-02-06  
**Component:** Platform Documentation (220 files)

[... content describing documentation structure ...]

**Last Updated:** 2026-02-06 | **Files:** 220 | **Platform Files:** 1,302 | **Layers:** 10
```

### Section D: Services PDR.md
```markdown
# Services - Product Design Requirements

**Version:** 1.0  
**Last Updated:** 2026-02-06  
**Component:** Microservices Layer

[... content describing 6 core services ...]

**Last Updated:** 2026-02-06 | **Services:** 6 | **Platform Files:** 1,302 | **Layers:** 10
```

---

## Validation Checklist

After completing all updates, verify:

- [ ] All dates are `2026-02-06`
- [ ] All file counts are `1,302`
- [ ] All layer counts are `10` (or `9 hexarchy + 1 documentation`)
- [ ] All JSON files are valid (no syntax errors)
- [ ] README.md has no duplicate content after footer
- [ ] All 4 PDR.md files exist in correct locations
- [ ] All footers include layer count

---

## Execution Order

1. Update JSON files first (baseline, architecture, codebase)
2. Update PDR_METADATA.md
3. Create 4 new PDR.md files
4. Update README.md last (to incorporate all changes)

---

**This recipe is complete and executable by Spark in a single prompt.**
