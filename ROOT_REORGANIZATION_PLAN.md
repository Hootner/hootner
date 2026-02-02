# Root Directory Reorganization Plan

## Current State: 80+ files in root (too cluttered)

## Proposed Structure:

### Keep in Root (Essential Only)
```
├── package.json              # Main project config
├── package-lock.json         # Lock file
├── README.md                 # Main documentation
├── LICENSE                   # License file
├── template.yaml             # AWS SAM template
├── .env                      # Environment variables
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── .npmrc                    # NPM configuration
└── index.js                  # Main entry point
```

### Move to Organized Folders:

#### 1. Move to `config/` folder:
- `.eslintrc.json` → `config/eslint.config.json`
- `.prettierrc` → `config/prettier.config.json`
- `.commitlintrc.json` → `config/commitlint.config.json`
- `tailwind.config.js` → `config/tailwind.config.js`
- `samconfig.toml` → `config/sam.config.toml`
- `requirements.txt` → `config/requirements.txt`
- All `dist-*.json` files → `config/dist/`
- All AWS config files → `config/aws/`

#### 2. Move to `docs/` folder (already exists):
- All `*.md` files except README.md
- All documentation HTML files
- `CSS-VISUAL-REFERENCE.html` → `docs/reference/`

#### 3. Move to `scripts/` folder (already exists):
- All standalone `.js` files that are utilities
- All `.py` files for training/setup
- All `.sh` files
- All `check-*.js` files
- All `setup-*.js` files

#### 4. Move to `tools/` folder (new):
- `find-duplicates.js`
- `scan-*.js` files
- `update-*.js` files
- Development utilities

#### 5. Move to `examples/` folder (already exists):
- `amazon-q-chat-example.html`
- `service-worker-test.html`
- `redirect-dashboard.html`
- `cloudfront-api-snippet.html`

#### 6. Move to `data/reports/` (already exists):
- All `*-report.json` files
- All `*-manifest.json` files

## Benefits:
1. **Cleaner root** - Only 10 essential files
2. **Logical grouping** - Related files together
3. **Easier navigation** - Clear folder purposes
4. **Better maintenance** - Easier to find and update files
5. **Professional appearance** - Industry standard structure

## Implementation Steps:
1. Create missing folders
2. Move files to appropriate locations
3. Update import paths in code
4. Update documentation references
5. Test that everything still works