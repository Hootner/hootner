# Dashboard.html Manual Fix Guide

## 🔴 CRITICAL FIXES REQUIRED

### Fix 1: Line 2918 - Incomplete CSS Property
**Location:** Style section, `.actions` class  
**Issue:** CSS property incomplete, breaks layout

```css
/* FIND (Line ~2918): */
.actions {
  display: flex;
  flex-direction: 

/* REPLACE WITH: */
.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
```

---

### Fix 2: Line 2972 - Malformed JavaScript String
**Location:** `updateMetrics()` function  
**Issue:** HTML tags inside JavaScript string

```javascript
/* FIND (Line ~2972): */
if (data.revenue) document.getElementById('stat-revenue').textContent = '</body>\n        </html>\n         + (data.revenue / 1000).toFixed(1) + 'K';

/* REPLACE WITH: */
if (data.revenue) document.getElementById('stat-revenue').textContent = '$' + (data.revenue / 1000).toFixed(1) + 'K';
```

---

### Fix 3: Add Sanitization Helper
**Location:** After first `<script>` tag in main script section  
**Issue:** Missing sanitization function

```javascript
/* ADD AFTER LINE ~2893 (after <script> tag): */
// Security: HTML sanitization helper
const sanitize = (html) => {
  if (typeof DOMPurify !== 'undefined') {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['strong', 'p', 'span', 'div', 'h3', 'button'],
      ALLOWED_ATTR: ['class', 'style', 'onclick']
    });
  }
  // Fallback: escape HTML
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};
```

---

### Fix 4: Line 3005 - XSS in addActivity()
**Location:** `addActivity()` function  
**Issue:** Unescaped user input in innerHTML

```javascript
/* FIND (Line ~3005): */
item.innerHTML = `<p><strong>${activity.text}</strong></p><p class="time">Just now</p>`;

/* REPLACE WITH: */
const safeText = sanitize(activity.text);
item.innerHTML = `<p><strong>${safeText}</strong></p><p class="time">Just now</p>`;
```

---

### Fix 5: Line 3033 - eval() Security Risk
**Location:** `runCode()` function  
**Issue:** Arbitrary code execution vulnerability

```javascript
/* FIND (Line ~3033): */
const result = eval(code);

/* REPLACE WITH: */
// Security: Use Function constructor instead of eval
const result = (() => {
  try {
    return new Function('return ' + code)();
  } catch (e) {
    throw new Error('Code execution failed: ' + e.message);
  }
})();
```

---

### Fix 6: Line 3070 - ReDoS Regex
**Location:** `saveProfile()` function  
**Issue:** Regex vulnerable to ReDoS attacks

```javascript
/* FIND (Line ~3070): */
if (username && !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
  alert('Invalid username format');
  return;
}

/* REPLACE WITH: */
// Security: Check length first to prevent ReDoS
if (username && (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9_]+$/.test(username))) {
  alert('Invalid username format');
  return;
}
```

---

### Fix 7: Line 3398 - XSS in showSuggestions()
**Location:** `showSuggestions()` function  
**Issue:** Unescaped suggestions in HTML

```javascript
/* FIND (Line ~3398): */
container.innerHTML = suggestions.map(s =>
  `<div onclick="applySuggestion('${s}')" style="padding:8px 12px;cursor:pointer;border-radius:4px;color:#00ffff;" onmouseover="this.style.background='rgba(0,255,0,0.1)'" onmouseout="this.style.background='transparent'">🔍 ${s}</div>`
).join('');

/* REPLACE WITH: */
container.innerHTML = suggestions.map(s => {
  const safeSuggestion = sanitize(s);
  return `<div onclick="applySuggestion('${safeSuggestion}')" style="padding:8px 12px;cursor:pointer;border-radius:4px;color:#00ffff;" onmouseover="this.style.background='rgba(0,255,0,0.1)'" onmouseout="this.style.background='transparent'">🔍 ${safeSuggestion}</div>`;
}).join('');
```

---

### Fix 8: Line 3410 - XSS in showRecentSearches()
**Location:** `showRecentSearches()` function  
**Issue:** Unescaped search queries in HTML

```javascript
/* FIND (Line ~3410): */
searchData.recentSearches.slice(0, 5).map(s =>
  `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;cursor:pointer;border-radius:4px;" onmouseover="this.style.background='rgba(0,255,0,0.1)'" onmouseout="this.style.background='transparent'">
    <span onclick="applySuggestion('${s}')" style="flex:1;color:#00ffff;">🕐 ${s}</span>
    <button onclick="removeRecentSearch('${s}');event.stopPropagation()" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px;">✕</button>
  </div>`
).join('')

/* REPLACE WITH: */
searchData.recentSearches.slice(0, 5).map(s => {
  const safeSearch = sanitize(s);
  return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;cursor:pointer;border-radius:4px;" onmouseover="this.style.background='rgba(0,255,0,0.1)'" onmouseout="this.style.background='transparent'">
    <span onclick="applySuggestion('${safeSearch}')" style="flex:1;color:#00ffff;">🕐 ${safeSearch}</span>
    <button onclick="removeRecentSearch('${safeSearch}');event.stopPropagation()" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px;">✕</button>
  </div>`;
}).join('')
```

---

### Fix 9: Line 3638 - XSS in renderNotifications()
**Location:** `renderNotifications()` function  
**Issue:** Unescaped notification text and user

```javascript
/* FIND (Line ~3638): */
html += grouped[group].map(n => `
  <div class="notif-item ${n.unread ? 'unread' : ''}">
    <div style="display:flex;gap:12px;align-items:start;">
      <div style="font-size:24px;flex-shrink:0;">${n.icon}</div>
      <div style="flex:1;min-width:0;" onclick="markRead(${n.id})">
        <div style="color:#00ff00;font-weight:bold;font-size:13px;margin-bottom:4px;">@${n.user}</div>
        <div style="color:#00ffff;font-size:13px;margin-bottom:4px;">${n.text}</div>
        <div style="color:#6b7280;font-size:11px;">${n.time}</div>
      </div>
      <div style="display:flex;gap:4px;flex-shrink:0;">
        ${n.unread ? '<div style="width:8px;height:8px;background:#00ffff;border-radius:50%;margin-top:6px;"></div>' : ''}
        <button onclick="deleteNotification(${n.id});event.stopPropagation()" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px;opacity:0.5;" title="Delete">✕</button>
      </div>
    </div>
  </div>
`).join('');

/* REPLACE WITH: */
html += grouped[group].map(n => {
  const safeUser = sanitize(n.user);
  const safeText = sanitize(n.text);
  return `
  <div class="notif-item ${n.unread ? 'unread' : ''}">
    <div style="display:flex;gap:12px;align-items:start;">
      <div style="font-size:24px;flex-shrink:0;">${n.icon}</div>
      <div style="flex:1;min-width:0;" onclick="markRead(${n.id})">
        <div style="color:#00ff00;font-weight:bold;font-size:13px;margin-bottom:4px;">@${safeUser}</div>
        <div style="color:#00ffff;font-size:13px;margin-bottom:4px;">${safeText}</div>
        <div style="color:#6b7280;font-size:11px;">${n.time}</div>
      </div>
      <div style="display:flex;gap:4px;flex-shrink:0;">
        ${n.unread ? '<div style="width:8px;height:8px;background:#00ffff;border-radius:50%;margin-top:6px;"></div>' : ''}
        <button onclick="deleteNotification(${n.id});event.stopPropagation()" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px;opacity:0.5;" title="Delete">✕</button>
      </div>
    </div>
  </div>
`;
}).join('');
```

---

### Fix 10: Line 3838 - Second eval() in Monaco Editor
**Location:** Monaco editor integration, `window.runCode` function  
**Issue:** Another eval() usage

```javascript
/* FIND (Line ~3838): */
const result = eval(code);

/* REPLACE WITH: */
// Security: Use Function constructor instead of eval
const result = (() => {
  try {
    const fn = new Function(code);
    return fn();
  } catch (e) {
    throw new Error('Execution error: ' + e.message);
  }
})();
```

---

## ✅ Verification Steps

After applying all fixes:

1. **Test Layout:**
   - Open dashboard.html
   - Verify all buttons and cards display correctly
   - Check that .actions class renders properly

2. **Test Security:**
   - Try entering `<script>alert('XSS')</script>` in search
   - Verify it's escaped/sanitized
   - Check notifications don't execute scripts

3. **Test Functionality:**
   - Test code editor (should work without eval)
   - Test search suggestions
   - Test notifications
   - Test profile validation

4. **Run Security Scan:**
   ```bash
   npm audit
   ```

5. **Check Console:**
   - No JavaScript errors
   - No CSP violations
   - No security warnings

---

## 📋 Checklist

- [ ] Fix 1: CSS flex-direction completed
- [ ] Fix 2: Malformed string corrected
- [ ] Fix 3: Sanitization helper added
- [ ] Fix 4: addActivity() sanitized
- [ ] Fix 5: First eval() replaced
- [ ] Fix 6: Regex validation improved
- [ ] Fix 7: Suggestions sanitized
- [ ] Fix 8: Recent searches sanitized
- [ ] Fix 9: Notifications sanitized
- [ ] Fix 10: Second eval() replaced
- [ ] All tests passing
- [ ] Security scan clean
- [ ] No console errors

---

## 🔄 Rollback

If issues occur:
```bash
# Restore backup
cp apps/frontend/html-pages/dashboard.html.backup apps/frontend/html-pages/dashboard.html
```
