# Frontend Structure Overview

This project intentionally has two frontend locations serving different roles:

- apps/frontend — the runnable application: pages/routes, app state, API integration, and build/dev tooling.
- hexarchy/4-interface — the UI layer library: shared UI primitives, components, styles, and interface utilities for reuse across apps.

## Recommended Usage

- Keep reusable UI primitives and styles in hexarchy/4-interface (e.g., components, design tokens, helpers). Export them as a small UI library.
- Keep app-specific code (pages, feature containers, routing, app state) under apps/frontend/src.
- Import shared UI from the UI layer into the app rather than duplicating components.

## Importing Shared UI (Path Aliases)

To avoid fragile relative paths, use path aliases. Example TypeScript alias (tsconfig.json in apps/frontend):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@ui/*": ["hexarchy/4-interface/*"],
      "@ui-components/*": ["hexarchy/4-interface/components/*"]
    }
  }
}
```

Bundle config should mirror these aliases:
- Vite: `resolve.alias` in vite.config.ts
- Webpack: `resolve.alias` in webpack.config.js

## De-duplication Plan

1. Identify components duplicated between apps/frontend/src and hexarchy/4-interface.
2. Move reusable ones into hexarchy/4-interface/components and export them.
3. Update imports in apps/frontend to use the alias (e.g., `@ui-components/Button`).
4. Remove duplicates from the app to keep a single source of truth.

## Quick References

- App runtime: apps/frontend
- Shared UI library: hexarchy/4-interface

## Next Steps

- Approve alias strategy and bundle wiring.
- Run `npm run dev` in the app and verify imports.
- Optionally add lint rules to prevent cross-layer duplication.
