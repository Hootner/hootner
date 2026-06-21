# Login Page Requirements

This document describes everything needed for `src/frontend/pages/login.html` to function correctly.

---

## 1. File Dependencies

| File | Path (relative to `pages/`) | Purpose | Required? |
|------|----------------------------|---------|-----------|
| `glass-ui.css` | `./glass-ui.css` | Shared glass/HDR visual layer (CSS variables, backdrop-blur styling) | Optional — page has all critical styles inline; glass-ui adds mouse-following gloss effect |
| `glass-ui.js` | `./glass-ui.js` | Mouse-tracking gloss highlight + HDR class injection | Optional — purely cosmetic enhancement |
| `styles.css` | `../html-pages/styles.css` | Global base stylesheet | Optional — page renders fully without it |

**Source locations in repo:**
- `apps/frontend/html-pages/glass-ui.css`
- `apps/frontend/html-pages/glass-ui.js`

To make these resolve correctly, either:
- Copy/symlink them into `src/frontend/pages/`
- Or serve from a web server with proper routing

---

## 2. Browser Requirements

| Feature | Minimum Browser | Fallback |
|---------|----------------|----------|
| CSS `backdrop-filter` | Chrome 76+, Safari 9+, Firefox 103+ | Card still renders, just without blur |
| CSS Custom Properties | All modern browsers | None — layout breaks on IE11 |
| WebAuthn / `navigator.credentials.get()` | Chrome 67+, Safari 14+, Firefox 60+ | Shows "Passkeys are not supported" error banner |
| `crypto.getRandomValues()` | All modern browsers | Passkey button fails gracefully |
| CSS `@keyframes` animations | All modern browsers | No aurora/stars animation |

**HTTPS Requirement:** The Passkey/USB Security Key feature requires a **secure origin** (HTTPS or `localhost`). On `http://` or `file://`, WebAuthn throws a `SecurityError` which is caught and displayed to the user.

---

## 3. Session Storage Contract

The login page writes these keys on successful authentication:

| Key | Storage | Format | Example |
|-----|---------|--------|---------|
| `hootner_auth_token` | `localStorage` (if "Remember me" checked) or `sessionStorage` | Base64 of `username:timestamp` | `b3dsdXNlcjoxNzgyMDY5MjQ0ODEy` |
| `hootner_session` | `sessionStorage` | String literal | `"active"` |
| `hootner_user` | `localStorage` | JSON object | `{"username":"owl","email":"owl@hootner.com"}` |

**Other pages that consume these keys:**
- `dashboard.html` — reads `hootner_auth_token` and `hootner_user`
- `messages.html` — reads `hootner_auth_token` for API calls
- `marketplace.html` — reads `hootner_auth_token`
- `admin-session-manager.html` — reads/writes all keys + `hootner_session_revocation`

---

## 4. Session Revocation System

The login page integrates the revocation logic from `heptagonal/4-interface/ui/assets/security/session-revocation.js`.

**How it works:**
1. Admin sets `localStorage.hootner_session_revocation` = Unix timestamp (via admin-session-manager.html)
2. Login page checks every 5 seconds + on tab visibility change
3. If the auth token's embedded timestamp is **before** the revocation timestamp → all session data is cleared and user must re-authenticate

**Keys cleared on revocation:**
- `hootner_auth_token`
- `hootner_user`
- `hootner_session_token`
- `hootner_fingerprint`
- All `sessionStorage` entries

---

## 5. Production Backend Requirements

The login page currently uses **client-side simulation** (no real API calls). For production, these backend endpoints are needed:

### 5a. Password Authentication
```
POST /api/auth/login
Body: { username, password }
Response: { token: "jwt...", user: { username, email, ... } }
```

Replace the `setTimeout` in `handleLogin()` (line ~1148) with a real `fetch()` call.

### 5b. WebAuthn / Passkey Authentication

Requires a backend implementing the FIDO2 server-side:

```
GET  /api/auth/passkey/options       → Returns PublicKeyCredentialRequestOptions (challenge, rpId, allowCredentials)
POST /api/auth/passkey/verify        → Verifies credential assertion, returns JWT
```

The backend module is already implemented at:
- `heptagonal/0-core/auth/usb-passkey.js` — `USBPasskeyAuth` class with:
  - `generateAuthenticationOptions(userId)` → challenge + options
  - `verifyAuthentication(credential, challenge, userId)` → `{ success, userId, credentialId }`

### 5c. Auth Middleware

The backend middleware at `heptagonal/0-core/auth/middleware.js` expects:
- **JWT auth:** `Authorization: Bearer <token>` header
- **Passkey auth:** `x-passkey-auth: <JSON>` header with `{ credential, challenge, userId }`

### 5d. Social OAuth

The social login buttons (Google, GitHub, Discord) require OAuth redirect endpoints:
```
GET /api/auth/oauth/:provider → Redirects to provider's OAuth consent screen
GET /api/auth/oauth/:provider/callback → Handles OAuth callback, issues token
```

### 5e. Registration
```
POST /api/auth/register
Body: { email, username, password }
Response: { token, user }
```

---

## 6. Redirect Behavior

After successful login, the page checks:
```javascript
sessionStorage.getItem('hootner_redirect_after_login')
```

- If set: redirects to that URL (used by protected pages to return users after auth)
- If not set: redirects to `dashboard.html`

**Other pages should set this before redirecting to login:**
```javascript
sessionStorage.setItem('hootner_redirect_after_login', window.location.href);
window.location.href = 'login.html';
```

---

## 7. Serving the Page

### Development (static)
```bash
# From repo root — any static server works:
npx serve src/frontend/pages
# Or open directly:
google-chrome src/frontend/pages/login.html
```

Note: Passkey button won't work on `file://` — use `localhost` for WebAuthn testing.

### Production
Serve behind HTTPS with proper routing so that:
- `/login` → `login.html`
- `/dashboard` → `dashboard.html`
- `glass-ui.css` and `glass-ui.js` resolve relative to login.html

---

## 8. Environment Variables (Backend)

These are used by `heptagonal/0-core/auth/usb-passkey.js`:

| Variable | Default | Description |
|----------|---------|-------------|
| `RP_ID` | `localhost` | WebAuthn Relying Party ID (must match the domain serving the page) |
| `ORIGIN` | `http://localhost:3000` | Expected origin for WebAuthn verification |

---

## 9. Accessibility

The page meets WCAG 2.1 AA with:
- All form inputs have associated `<label>` elements
- `aria-required="true"` on mandatory fields
- `aria-live="polite"` on message banner and password rules
- `role="tablist"` / `role="tab"` / `role="tabpanel"` on form toggle
- `:focus-visible` styling for keyboard navigation
- Screen reader announcements for validation state changes

---

## 10. Quick Checklist

- [ ] `glass-ui.css` and `glass-ui.js` accessible at same directory level (or remove `<link>`/`<script>` tags if not needed)
- [ ] Served over HTTPS for passkey support
- [ ] Backend auth API running (or keep client-side simulation for demos)
- [ ] `RP_ID` env var matches serving domain
- [ ] `dashboard.html` exists at same path level for post-login redirect
- [ ] Admin panel can write `hootner_session_revocation` to localStorage for revocation to work
