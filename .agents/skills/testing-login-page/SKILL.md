---
name: testing-login-page
description: Test the HOOTNER Owl login page end-to-end. Use when verifying login UI changes, form validation, passkey integration, or session storage.
---

# Testing the HOOTNER Login Page

## Overview

The login page is a static HTML file at `src/frontend/pages/login.html`. It can be tested locally by opening it directly in Chrome via `file://` protocol — no backend is required for UI and form logic testing.

## How to Open

```bash
google-chrome "file:///home/ubuntu/repos/hootner/src/frontend/pages/login.html" &
```

## Key Features to Test

### 1. Visual / Brand
- Owl emoji hero with pulse animation
- "HOOTNER" title + "Secure Owl Authentication" subtitle
- Dark glass card with aurora background
- Responsive layout (test at 480px width for mobile)

### 2. Form Toggle (Sign In / Register)
- Click tab buttons or use **Ctrl+K** keyboard shortcut
- Form state is preserved when switching

### 3. Password Strength Meter (Register Form)
- Focus on password field to reveal rules panel
- 5 rules: 8+ chars, uppercase, lowercase, number, special char
- 4-bar visual meter (red=weak, yellow=fair, green=strong)
- Type incrementally to verify rules light up individually

### 4. Form Validation
- **Empty submit:** Banner shows "Please fill in all fields."
- **Short password (<8 chars):** Banner shows "Password must be at least 8 characters."
- **Email validation on blur:** Red border for invalid, green for valid
- **Username validation:** 3-30 chars, letters/numbers/underscore/dash

### 5. Passkey / WebAuthn Button
- Button labeled "Use Passkey / Security Key" with FIDO2 badge
- Invokes `navigator.credentials.get()` WebAuthn API
- On `file://` protocol: expect "Security error. Ensure you are on a secure origin (HTTPS)."
- On HTTPS: may show browser passkey prompt or "Authentication cancelled" if user cancels

### 6. Successful Login
- Enter valid username (any text) + password (8+ chars)
- Success toast appears: "Signed in successfully!"
- Session storage populated:
  - `sessionStorage.hootner_auth_token` — base64 of `username:timestamp`
  - `sessionStorage.hootner_session` — "active"
  - `localStorage.hootner_user` — JSON `{username, email}`
- If "Remember me" checked: token goes to `localStorage` instead
- Redirects to `dashboard.html` after ~1.2s (will 404 in isolation)

### 7. Password Toggle
- Click eye icon to reveal password (type changes to "text")
- Icon changes to hide emoji
- Click again to re-hide

### 8. Session Revocation
- Runs on page load + every 5 seconds + visibility change
- Checks `localStorage.hootner_session_revocation` timestamp vs token creation time
- If revoked: clears all hootner_* storage keys

## Verification via Console

After login, verify storage:
```javascript
JSON.stringify({
  auth_token: sessionStorage.getItem('hootner_auth_token'),
  session: sessionStorage.getItem('hootner_session'),
  user: localStorage.getItem('hootner_user'),
  decoded: atob(sessionStorage.getItem('hootner_auth_token'))
})
```

## Known Limitations

- WebAuthn passkey flow requires HTTPS (secure origin). On `file://`, it will throw SecurityError which is handled gracefully.
- Session revocation requires a server-side revocation timestamp to be set in localStorage to test the clear behavior.
- Social login buttons (Google, GitHub, Discord) are UI-only — no OAuth backend.

## Devin Secrets Needed

None required for static HTML testing. If testing against a deployed HTTPS version, may need access credentials for the hosting environment.
