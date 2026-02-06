# SPARK PROMPT: Generate All HOOTNER HTML Pages

## OBJECTIVE
Create 15 production-ready HTML pages for HOOTNER with consistent design, real API integration, and mobile responsiveness.

## DESIGN SYSTEM

**Colors:**
- Background: `linear-gradient(135deg, #0a0a0f, #1a1a2e)`
- Primary: `#00ff00` (green)
- Secondary: `#00ffff` (cyan)
- Accent: `#ff00ff` (purple)
- Glass effect: `rgba(255,255,255,0.05)` with `backdrop-filter: blur(20px)`

**Typography:**
- Font: System default (Segoe UI, sans-serif)
- Headers: Bold, gradient text
- Body: 14-16px

**Components:**
- Use Tailwind CDN: `https://cdn.tailwindcss.com`
- Glass cards with hover effects
- Responsive grid layouts
- Mobile-first design

## PAGES TO CREATE

### 1. dashboard.html
**Purpose:** Main hub after login
**Features:**
- 4 stat cards (videos, users, views, revenue)
- Quick action buttons (upload, my videos, analytics, settings)
- Recent activity feed
- System status indicators
- Notifications dropdown
**API:** `GET /api/dashboard/stats`

### 2. upload-video.html
**Purpose:** Upload videos
**Features:**
- Drag-and-drop zone
- File input with preview
- Progress bar
- Metadata form (title, description, tags)
- Thumbnail upload
**API:** `POST /api/videos/upload`

### 3. my-videos.html
**Purpose:** User's video library
**Features:**
- Grid of video cards
- Search and filter
- Sort options (date, views, likes)
- Edit/delete buttons
- Pagination
**API:** `GET /api/videos/user`

### 4. video-player.html
**Purpose:** Watch videos
**Features:**
- HTML5 video player with controls
- Video info (title, views, likes)
- Comments section
- Related videos sidebar
- Share buttons
**API:** `GET /api/videos/:id`

### 5. analytics.html
**Purpose:** View statistics
**Features:**
- Chart.js graphs (views, engagement)
- Date range picker
- Export button
- Top videos table
**API:** `GET /api/analytics`

### 6. profile.html
**Purpose:** User profile
**Features:**
- Avatar upload
- Bio editor
- Social links
- Video grid
- Followers/following count
**API:** `GET /api/users/:id`, `PUT /api/users/profile`

### 7. settings.html
**Purpose:** Account settings
**Features:**
- Profile settings
- Password change
- Email preferences
- API keys management
- Delete account
**API:** `PUT /api/settings`

### 8. marketplace.html
**Purpose:** Buy/sell content
**Features:**
- Product grid
- Search and filters
- Price display
- Buy button
- Seller info
**API:** `GET /api/marketplace/products`

### 9. messages.html
**Purpose:** Direct messaging
**Features:**
- Conversation list
- Chat interface
- Real-time updates (WebSocket)
- Send message form
**API:** `GET /api/messages`, `POST /api/messages/send`

### 10. live-stream.html
**Purpose:** Live streaming
**Features:**
- Video stream embed
- Live chat
- Viewer count
- Stream controls (start/stop)
**API:** `GET /api/streams/:id`

### 11. collaboration.html
**Purpose:** Team collaboration
**Features:**
- Project list
- Team members
- Shared files
- Activity timeline
**API:** `GET /api/collaboration/projects`

### 12. ai-video.html
**Purpose:** AI video generation
**Features:**
- Prompt input
- Style selector
- Generation progress
- Preview player
- Download button
**API:** `POST /api/ai/generate`

### 13. auto-editor.html
**Purpose:** Automated video editing
**Features:**
- Video upload
- Edit options (trim, effects, transitions)
- Preview
- Export settings
**API:** `POST /api/editor/process`

### 14. contact.html
**Purpose:** Contact form
**Features:**
- Name, email, message fields
- Subject dropdown
- Submit button
- Success message
**API:** `POST /api/contact`

### 15. login.html
**Purpose:** Authentication
**Features:**
- Email/password form
- Remember me checkbox
- Forgot password link
- Sign up link
- USB Passkey option
**API:** `POST /api/auth/login`

## SHARED COMPONENTS

### Navigation Bar (All Pages)
```html
<nav class="glass sticky top-0 z-50 px-6 py-4">
  <div class="flex justify-between items-center">
    <a href="dashboard.html" class="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
      🦉 HOOTNER
    </a>
    <div class="flex gap-4 items-center">
      <button onclick="toggleNotifications()" class="relative p-2 hover:bg-white/10 rounded-lg">🔔</button>
      <button onclick="logout()" class="px-4 py-2 border border-red-500 text-red-500 rounded-lg">Logout</button>
    </div>
  </div>
</nav>
```

### Footer (All Pages)
```html
<footer class="glass mt-12 p-6 text-center text-sm text-gray-400">
  © 2024 HOOTNER. All rights reserved. | "The Owl Never Sleeps"
</footer>
```

## JAVASCRIPT TEMPLATE

Each page should include:

```javascript
// API Configuration
const API_BASE = 'http://localhost:3005/api';

// Authentication check
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('hootner_auth_token');
  if (!token && window.location.pathname !== '/login.html') {
    window.location.href = '/login.html';
    return;
  }
  
  // Load page data
  loadPageData();
});

// Logout function
function logout() {
  localStorage.removeItem('hootner_auth_token');
  localStorage.removeItem('hootner_user');
  window.location.href = '/login.html';
}

// API helper
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('hootner_auth_token');
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  
  if (!response.ok) throw new Error('API call failed');
  return response.json();
}
```

## REQUIREMENTS

1. **Consistent Design:** All pages use same color scheme, glass effect, and layout
2. **Mobile Responsive:** Works on mobile, tablet, desktop
3. **API Integration:** Real endpoints, not mock data
4. **Error Handling:** Show user-friendly error messages
5. **Loading States:** Show spinners during API calls
6. **Validation:** Client-side form validation
7. **Accessibility:** Proper labels, ARIA attributes, keyboard navigation
8. **Performance:** Lazy load images, minimize JavaScript
9. **Security:** Sanitize inputs, CSRF protection
10. **SEO:** Proper meta tags, semantic HTML

## FILE STRUCTURE

Save all files to: `apps/frontend/html-pages/`

## SUCCESS CRITERIA

- ✅ All 15 pages created
- ✅ Consistent design across all pages
- ✅ Mobile responsive (test on 375px, 768px, 1920px)
- ✅ API integration working
- ✅ Navigation between pages works
- ✅ Authentication flow complete
- ✅ No console errors
- ✅ Fast load times (<2s)

## EXAMPLE: dashboard.html

See `apps/frontend/html-pages/dashboard-clean.html` for reference implementation.

---

**START NOW:** Generate all 15 HTML pages following this specification.
