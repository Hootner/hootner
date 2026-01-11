# HOOTNER Project Organization Plan

## Current Issues
- Root directory cluttered with 15+ loose files
- Config files scattered across multiple directories
- Revenue/payment services duplicated
- Mixed naming conventions
- Services directory has 60+ files without clear categorization

## Proposed Structure

### 1. Root Directory Cleanup
Move these files to appropriate directories:
```
# Move to /services/revenue/
- alternative-payments.js
- enhanced-revenue-api.js
- local-revenue-api.js
- mock-revenue-server.js
- revenue-server.js
- stripe-revenue-server.js

# Move to /services/core/
- core-server.js
- enhanced-agent-hub.js

# Move to /config/aws/
- aws-revenue-deployment.js
- no-stripe-template.yaml
- revenue-template.yaml

# Move to /data/usage/
- revenue-usage.json

# Move to /services/ai/
- copilot-commit-agent.js
- run-all-agents.js
```

### 2. Services Directory Reorganization
Create subcategories in `/services/`:

```
services/
├── ai/                    # AI & ML services
│   ├── content-moderation-ai.js
│   ├── deep-learning-pipelines.js
│   ├── federated-learning.js
│   ├── natural-language-processing.js
│   ├── recommendation-ml.js
│   └── sentiment-analysis.js
├── analytics/             # Analytics & monitoring
│   ├── apm-monitoring.js
│   ├── business-metrics.js
│   ├── performance-monitor.js
│   └── predictive-analytics.js
├── commerce/              # Payment & commerce
│   ├── payment-service.js
│   ├── payment-fraud-detection-agent.js
│   ├── pricing-algorithms.js
│   └── conversion-optimization.js
├── compliance/            # Compliance & security
│   ├── audit-service.js
│   ├── gdpr-compliance-tools.js
│   └── penetration-testing.js
├── core/                  # Core platform services
│   ├── health-checks.js
│   ├── rate-limiting.js
│   └── queue-systems.js
├── infrastructure/        # Infrastructure services
│   ├── auto-scaling.js
│   ├── cdn-management.js
│   └── load-testing-tools.js
├── integration/           # Third-party integrations
│   ├── crm-integration.js
│   ├── erp-integration.js
│   └── marketing-automation-integration.js
└── revenue/              # Revenue optimization
    ├── revenue-algorithms-api.js
    ├── revenue-analytics.js
    └── revenue-optimization.js
```

### 3. Config Consolidation
Merge scattered configs:
```
config/
├── environments/         # Environment configs
├── services/            # Service-specific configs
├── security/           # Security configs
└── runtime/            # Runtime configs (merge from /runtimes/)
```

### 4. Documentation Structure
```
docs/
├── api/                 # API documentation
├── architecture/        # Architecture docs
├── deployment/         # Deployment guides
├── development/        # Dev guides
└── operations/         # Operations docs
```

## Implementation Steps

1. **Phase 1: Root Cleanup** (Priority: High)
   - Move revenue services to `/services/revenue/`
   - Move core services to `/services/core/`
   - Update import paths

2. **Phase 2: Services Categorization** (Priority: High)
   - Create service subcategories
   - Move services to appropriate folders
   - Update service registry

3. **Phase 3: Config Consolidation** (Priority: Medium)
   - Merge duplicate configs
   - Standardize config format
   - Update config references

4. **Phase 4: Documentation** (Priority: Medium)
   - Reorganize docs by category
   - Update README references
   - Create service catalogs

## Benefits
- Cleaner root directory
- Logical service grouping
- Easier navigation
- Better maintainability
- Consistent structure