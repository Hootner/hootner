# SPARK PROMPT: Generate HOOTNER HTML Pages with Python/Flask

## Objective
Generate 15 HTML pages for HOOTNER platform using **Python 3.11+ with Flask and Jinja2 templates** for clean, maintainable code.

## Tech Stack
- **Python 3.11+** with Flask 3.0+
- **Jinja2** templates for HTML generation
- **Tailwind CSS** via CDN (no build step)
- **Alpine.js** for reactive UI (lightweight, no build)
- **HTMX** for dynamic content (optional, minimal JS)

## Project Structure
```
apps/frontend/flask-app/
├── app.py                    # Flask server (50 lines max)
├── templates/
│   ├── base.html            # Base template with nav/footer
│   ├── dashboard.html       # Extends base
│   ├── upload-video.html
│   ├── my-videos.html
│   ├── video-player.html
│   ├── analytics.html
│   ├── profile.html
│   ├── settings.html
│   ├── marketplace.html
│   ├── messages.html
│   ├── live-stream.html
│   ├── collaboration.html
│   ├── ai-video.html
│   ├── auto-editor.html
│   ├── contact.html
│   └── login.html
├── static/
│   ├── css/
│   │   └── custom.css       # Minimal custom styles (50 lines)
│   └── js/
│       └── api.js           # Shared API client (100 lines)
└── requirements.txt         # Flask, python-dotenv
```

## Design System (Same as Before)
```python
COLORS = {
    'primary': '#00ff00',    # Green
    'secondary': '#00ffff',  # Cyan
    'accent': '#ff00ff',     # Purple
    'bg_dark': '#0a0a0a',
    'glass': 'rgba(255, 255, 255, 0.05)'
}
```

## Flask App (app.py)
```python
from flask import Flask, render_template, jsonify
import os

app = Flask(__name__)
API_BASE = os.getenv('API_BASE_URL', 'http://localhost:3005/api')

@app.route('/')
def dashboard():
    return render_template('dashboard.html', api_base=API_BASE)

@app.route('/<page>')
def page(page):
    return render_template(f'{page}.html', api_base=API_BASE)

if __name__ == '__main__':
    app.run(port=3000, debug=True)
```

## Base Template (templates/base.html)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}HOOTNER{% endblock %}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/custom.css') }}">
</head>
<body class="bg-gradient-to-br from-gray-900 to-black text-white min-h-screen">
    {% include 'partials/nav.html' %}
    
    <main class="container mx-auto px-4 py-8">
        {% block content %}{% endblock %}
    </main>
    
    {% include 'partials/footer.html' %}
    
    <script src="{{ url_for('static', filename='js/api.js') }}"></script>
    {% block scripts %}{% endblock %}
</body>
</html>
```

## Page Requirements

### 1. Dashboard (dashboard.html)
```jinja2
{% extends 'base.html' %}
{% block content %}
<div x-data="dashboard()" x-init="loadStats()">
    <!-- 4 stat cards -->
    <!-- Quick actions grid -->
    <!-- Recent activity feed -->
</div>
{% endblock %}
```

### 2. Upload Video (upload-video.html)
- Drag-drop zone with Alpine.js
- Progress bar
- Metadata form (title, description, tags)
- POST to `/api/videos/upload`

### 3. My Videos (my-videos.html)
- Video grid with Alpine.js
- Search/filter
- GET from `/api/videos/user`

### 4. Video Player (video-player.html)
- HTML5 video player
- Comments section
- Share buttons
- GET from `/api/videos/:id`

### 5. Analytics (analytics.html)
- Chart.js for graphs
- Stats table
- Date range picker
- GET from `/api/analytics`

### 6. Profile (profile.html)
- Avatar upload
- Bio editor
- Social links
- PATCH to `/api/users/profile`

### 7. Settings (settings.html)
- Tabs: Account, Privacy, Notifications, Billing
- Toggle switches (Alpine.js)
- PATCH to `/api/users/settings`

### 8. Marketplace (marketplace.html)
- Template grid
- Category filter
- Search bar
- GET from `/api/marketplace`

### 9. Messages (messages.html)
- Conversation list
- Chat interface
- WebSocket connection
- GET from `/api/messages`

### 10. Live Stream (live-stream.html)
- Stream preview
- Chat sidebar
- Start/stop controls
- POST to `/api/streams/start`

### 11. Collaboration (collaboration.html)
- Project list
- Team members
- Invite modal
- GET from `/api/projects`

### 12. AI Video (ai-video.html)
- Prompt textarea
- Style selector
- Generate button
- POST to `/api/ai/generate`

### 13. Auto Editor (auto-editor.html)
- Timeline view
- Clip selector
- Export options
- POST to `/api/editor/auto`

### 14. Contact (contact.html)
- Contact form
- FAQ accordion
- POST to `/api/contact`

### 15. Login (login.html)
- Email/password form
- USB Passkey button
- POST to `/api/auth/login`

## Alpine.js Pattern
```javascript
function dashboard() {
    return {
        stats: {},
        loading: true,
        async loadStats() {
            this.stats = await api.get('/stats');
            this.loading = false;
        }
    }
}
```

## API Client (static/js/api.js)
```javascript
const api = {
    base: '{{ api_base }}',
    token: localStorage.getItem('hootner_auth_token'),
    
    async get(path) {
        const res = await fetch(this.base + path, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return res.json();
    },
    
    async post(path, data) {
        const res = await fetch(this.base + path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(data)
        });
        return res.json();
    }
};
```

## Success Criteria
- ✅ Each template < 150 lines
- ✅ No duplicate code (use Jinja2 includes/macros)
- ✅ Mobile responsive (Tailwind)
- ✅ Accessible (ARIA labels)
- ✅ Fast (Alpine.js is 15KB)
- ✅ Works offline (service worker optional)

## Run Commands
```bash
cd apps/frontend/flask-app
pip install -r requirements.txt
python app.py
# Visit http://localhost:3000
```

## Why Python/Flask?
- **Cleaner**: Jinja2 templates vs 126K line HTML files
- **DRY**: Reusable components with `{% include %}`
- **Type-safe**: Python 3.11+ type hints
- **Fast**: Alpine.js (15KB) vs React (100KB+)
- **Simple**: No build step, no npm, no webpack
- **Maintainable**: 50-150 lines per file vs 10K+ lines

## Generate Now
Create all files in `apps/frontend/flask-app/` with minimal, production-ready code.
