# UI Pages Alignment Report

This report summarizes alignment actions and duplicates across `hexarchy/4-interface/ui/pages`.

## Shared Includes
- Added across pages: `config.js`, `asset-loader.js`, `navigation-policy.js`.
- Pages updated in this pass: live-activity.html, my-videos.html, auto-editor.html, code-editor.html.

## Endpoint/Config Alignment
- `my-videos.html`: `API_BASE_URL` uses `HOOTNER_CONFIG`. Added optional `CLOUDFRONT_URL` and `S3_BUCKET` keys to `config.js` and consume them here.
- `live-activity.html`, `video-player.html`: GraphQL HTTP/WS endpoints aligned to `HOOTNER_CONFIG`.

## Duplicates & Canonicalization Candidates
- Editors: `code-editor.html` and `auto-editor.html` overlap. Canonicalize to `code-editor.html` for general editing and keep `auto-editor.html` as specialized workflow; add notice/links between them.
- Feeds: `feed-react.html` vs any legacy feed pages — prefer `feed-react.html` as canonical; redirect legacy variants.

## Next Steps
- Canonical banners/links added:
	- `code-editor.html` → links to `auto-editor.html` with "Canonical Editor" banner.
	- `auto-editor.html` → links to `code-editor.html` with "Specialized Auto Editor" banner.
- Continue moving reusable UI pieces into shared `hexarchy/4-interface/ui/src/components` and import via aliases in `apps/frontend`.
- Continue moving reusable UI pieces into shared `hexarchy/4-interface/ui/src/components` and import via aliases in `apps/frontend`.

