# Missing Documentation Files

## ❌ Files Referenced in README but Missing

### 1. TEMPLATE_CONNECTIONS_MAP.md
**Referenced in:** README.md line ~150
**Section:** 120-Pipe Infrastructure
**Status:** File does not exist
**Suggested Action:** Create file or remove reference

### 2. docs/DEPLOYMENT_GUIDE.md
**Referenced in:** README.md line ~140
**Section:** Developer Guides
**Status:** File does not exist
**Alternatives Available:**
- `DEPLOYMENT_CHECKLIST_120_PIPES.md` ✅
- `docs/AWS_TOOLKIT_DEPLOYMENT.md` ✅
- `QUICK_DEPLOY.md` ✅
**Suggested Action:** Create comprehensive deployment guide or redirect to existing docs

### 3. docs/DOCUMENTATION_INDEX.md
**Referenced in:** README.md troubleshooting section
**Status:** File exists as `DOCUMENTATION_INDEX_120_PIPES.md`
**Suggested Action:** Update reference or create symlink

---

## 📋 Recommended New Documentation

### High Priority

#### 1. MCP_INTEGRATION_GUIDE.md
**Why:** Multiple MCP scripts exist but no user guide
**Location:** `docs/guides/`
**Content Should Cover:**
- What is MCP (Model Context Protocol)
- Setup instructions
- Available commands (`npm run mcp:*`)
- Integration with Amazon Q

#### 2. AGENT_ORCHESTRATION_GUIDE.md
**Why:** 20+ agent scripts but no comprehensive guide
**Location:** `docs/guides/`
**Content Should Cover:**
- Agent architecture overview
- Available agents and their purposes
- Commands (`npm run agents:*`)
- Dual-agent setup

#### 3. REVENUE_TRACKING_GUIDE.md
**Why:** Revenue tracking features exist but undocumented
**Location:** `docs/guides/`
**Content Should Cover:**
- How revenue tracking works
- Commands (`npm run revenue:*`, `npm run track-money`)
- Data storage locations
- Integration with Stripe

#### 4. DEPLOYMENT_GUIDE.md
**Why:** Referenced in README but missing
**Location:** `docs/`
**Content Should Cover:**
- Local deployment
- AWS SAM deployment
- Environment configuration
- Troubleshooting

### Medium Priority

#### 5. SALES_ENABLEMENT_GUIDE.md
**Why:** Sales scripts exist in `scripts/sales/` but no documentation
**Location:** `docs/guides/`
**Content Should Cover:**
- Platform pitch materials
- Battle cards usage
- Integration explanations

#### 6. HOOTNER_CONFIG_GUIDE.md
**Why:** `.hootner/` directory exists but undocumented
**Location:** `docs/guides/`
**Content Should Cover:**
- Configuration options
- Telemetry settings
- Privacy considerations

#### 7. PM2_PROCESS_MANAGEMENT.md
**Why:** PM2 is used but not documented
**Location:** `docs/guides/`
**Content Should Cover:**
- PM2 setup
- Process monitoring
- Log management

### Low Priority

#### 8. KIRO_SETTINGS_GUIDE.md
**Why:** `.kiro/` directory exists
**Location:** `docs/guides/`

#### 9. CODEGPT_INTEGRATION.md
**Why:** `.codegpt/` directory exists
**Location:** `docs/guides/`

#### 10. ELECTRON_CODE_EDITOR_GUIDE.md
**Why:** Electron editor exists but minimal docs
**Location:** `docs/readme/`
**Note:** `electron-code-editor-README.md` exists but may need expansion

---

## 📊 Summary

- **Missing Referenced Files:** 3
- **Recommended New Guides:** 10
- **Total Documentation Gap:** 13 files

---

## 🎯 Quick Wins

Create these first for immediate impact:

1. **DEPLOYMENT_GUIDE.md** - Most referenced, most needed
2. **AGENT_ORCHESTRATION_GUIDE.md** - Complex feature needs explanation
3. **MCP_INTEGRATION_GUIDE.md** - New technology needs documentation
4. Fix **DOCUMENTATION_INDEX.md** reference (rename or redirect)
5. Create or remove **TEMPLATE_CONNECTIONS_MAP.md** reference
