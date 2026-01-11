# HOOTNER Project Reorganization Plan

## 🗂️ Current Structure Issues
- **58 loose files** in root directory
- Mixed file types scattered throughout
- No clear separation of concerns
- Hard to navigate and maintain

## 🎯 Proposed Systematic Organization

### **📁 `/src/` - Main Source Code**
```
src/
├── hexarchy/              # New hexarchy architecture (keep as-is)
├── legacy/               # Existing HOOTNER servers & core
│   ├── servers/          # All existing servers (collab, mcp, etc.)
│   ├── middleware/       # Auth, validation, etc.
│   ├── services/         # Business logic services
│   └── lib/              # Utility libraries
├── frontend/             # All client-side code
│   ├── apps/            # Existing apps (dashboard, editor, etc.)
│   ├── components/      # Reusable UI components
│   └── assets/          # Static assets, CSS, images
└── shared/              # Shared utilities
    ├── constants/       # Application constants
    ├── config/          # Configuration files
    └── types/           # TypeScript definitions
```

### **📁 `/infrastructure/` - DevOps & Operations**
```
infrastructure/
├── docker/              # All Docker files & compose
├── deployment/          # Deploy scripts, CI/CD
├── monitoring/          # Logging, metrics, health checks
├── security/            # Security configs, SSL certs
└── scripts/             # All .bat, .sh scripts
```

### **📁 `/docs/` - Documentation** 
```
docs/
├── architecture/        # System design docs
├── api/                # API documentation
├── guides/             # Setup, development guides
├── reports/            # Analysis reports, status
└── assets/             # Documentation images/diagrams
```

### **📁 `/data/` - Data & Storage**
```
data/
├── uploads/            # File uploads
├── logs/               # Application logs
├── backups/            # System backups
├── temp/               # Temporary files
└── cache/              # Cache files
```

### **📁 `/tools/` - Development Tools**
```
tools/
├── lint/               # Linting configs & scripts
├── test/               # Test configurations
├── build/              # Build tools & configs
└── generators/         # Code generators, scaffolding
```

## 🚀 **Migration Commands**

### **1. Create New Structure**
```powershell
# Create main directories
mkdir src\legacy, src\frontend, src\shared
mkdir infrastructure\docker, infrastructure\deployment, infrastructure\monitoring, infrastructure\security, infrastructure\scripts
mkdir data\uploads, data\logs, data\backups, data\temp, data\cache
mkdir tools\lint, tools\test, tools\build, tools\generators

# Move existing directories
Move-Item hexarchy src\hexarchy
Move-Item apps src\frontend\apps
Move-Item servers src\legacy\servers
Move-Item middleware src\legacy\middleware
Move-Item services src\legacy\services
Move-Item lib src\legacy\lib
Move-Item constants src\shared\constants
Move-Item config src\shared\config
```

### **2. Move Files Systematically**
```powershell
# Infrastructure files
Move-Item *.dockerfile infrastructure\docker\
Move-Item docker-compose*.yml infrastructure\docker\
Move-Item *.bat infrastructure\scripts\
Move-Item *.sh infrastructure\scripts\
Move-Item deploy-*.* infrastructure\deployment\
Move-Item nginx.conf infrastructure\security\

# Development tools  
Move-Item .eslintrc.json tools\lint\
Move-Item .prettierrc.json tools\lint\
Move-Item *.config.js tools\lint\
Move-Item package*.json .\ # Keep in root

# Data files
Move-Item uploads data\uploads
Move-Item logs data\logs  
Move-Item temp data\temp
Move-Item *.txt data\logs\  # Log files

# Documentation
Move-Item *.md docs\
Move-Item GITBOOK_*.md docs\guides\
Move-Item TODO_*.md docs\reports\
```

### **3. Update Import Paths**
```javascript
// Old imports:
import { config } from './config/app-config.js';
import { HTTP_STATUS } from './constants/index.js';

// New imports:
import { config } from './src/shared/config/app-config.js';
import { HTTP_STATUS } from './src/shared/constants/index.js';
```

## 📋 **Implementation Strategy**

### **Phase 1: Infrastructure** (Low Risk)
- Move deployment scripts, Docker files
- Move documentation files
- Move development tools

### **Phase 2: Static Assets** (Low Risk)  
- Move uploads, logs, temp files
- Move CSS, images, static content

### **Phase 3: Source Code** (Medium Risk)
- Move servers to `src/legacy/servers/`
- Move middleware to `src/legacy/middleware/`
- Update import paths in package.json scripts

### **Phase 4: Integration** (High Risk)
- Update all import statements
- Test all functionality
- Update CI/CD paths

## 🔧 **Automated Migration Script**

Would you like me to create a PowerShell script that:
1. ✅ **Backs up current state** 
2. ✅ **Creates new folder structure**
3. ✅ **Moves files systematically** 
4. ✅ **Updates import paths automatically**
5. ✅ **Validates all moves completed**

## 🎯 **Benefits of Reorganization**

✅ **Clear Separation**: Source code, infrastructure, docs, data  
✅ **Easier Navigation**: Logical grouping of related files  
✅ **Scalability**: Room to grow without clutter  
✅ **Team Collaboration**: Clear ownership of folders  
✅ **CI/CD Optimization**: Better build/deploy paths  
✅ **Maintenance**: Easier to find and update files  

Would you like me to start with Phase 1 (infrastructure files) or create the automated migration script?