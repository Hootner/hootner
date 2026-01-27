# Component De-duplication Plan

This plan inventories shared vs app components and proposes canonical moves.

## Inventory
- Shared UI components:
  - `hexarchy/4-interface/ui/src/components/AlgorithmMarketplace.tsx`
- App components:
  - `apps/frontend/src/components/VideoPlayer.tsx`
  - `apps/frontend/src/components/VideoControls.tsx`
  - `apps/frontend/src/components/VideoProgressBar.tsx`
  - `apps/frontend/src/components/VideoSettings.tsx`
  - `apps/frontend/src/components/VideoVolumeControl.tsx`
  - `apps/frontend/src/components/PlaylistManager.tsx`
  - `apps/frontend/src/components/GraphQLDemo.tsx`
  - `apps/frontend/src/components/Dashboard.tsx`
  - `apps/frontend/src/components/legal/LegalComponents.jsx`

## Candidates for Shared Library
- Video UI primitives (`VideoControls`, `VideoProgressBar`, `VideoSettings`, `VideoVolumeControl`): move to `hexarchy/4-interface/ui/src/components/video/` and export.
- `PlaylistManager`: move to `hexarchy/4-interface/ui/src/components/media/`.
- `GraphQLDemo`: keep app-local; not broadly reusable.
- `Dashboard`: keep app-local; page-level component.
- `LegalComponents.jsx`: move to `hexarchy/4-interface/ui/src/components/legal/`.

## Steps
1. Create shared folders:
   - `hexarchy/4-interface/ui/src/components/video/`
   - `hexarchy/4-interface/ui/src/components/media/`
   - `hexarchy/4-interface/ui/src/components/legal/`
2. Move selected components and adjust relative imports.
3. Update app imports to use aliases (`@ui-components/...`).
4. Run lint/tests and verify builds.

## Example Alias Imports
- `import VideoControls from '@ui-components/video/VideoControls'`
- `import LegalComponents from '@ui-components/legal/LegalComponents'`

## Notes
- Keep ESM style and avoid heavy refactors; move only genuinely reusable pieces.
- Include minimal README in each shared folder documenting usage.
