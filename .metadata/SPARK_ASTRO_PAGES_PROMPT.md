# SPARK PROMPT: Generate HOOTNER Pages with Astro

## Objective
Generate 15 pages for HOOTNER using **Astro 4.0+** - the fastest modern framework that ships zero JS by default.

## Tech Stack
- **Astro 4.0+** (island architecture, zero JS default)
- **Tailwind CSS** (built-in integration)
- **Alpine.js** (only for interactive islands)
- **TypeScript** (native support)

## Project Structure
```
apps/frontend/astro-app/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Dashboard
│   │   ├── upload-video.astro
│   │   ├── my-videos.astro
│   │   ├── video-player.astro
│   │   ├── analytics.astro
│   │   ├── profile.astro
│   │   ├── settings.astro
│   │   ├── marketplace.astro
│   │   ├── messages.astro
│   │   ├── live-stream.astro
│   │   ├── collaboration.astro
│   │   ├── ai-video.astro
│   │   ├── auto-editor.astro
│   │   ├── contact.astro
│   │   └── login.astro
│   ├── layouts/
│   │   └── Layout.astro             # Base layout
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── StatCard.astro
│   │   └── VideoCard.astro
│   └── lib/
│       └── api.ts                   # API client
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## Setup Files

### package.json
```json
{
  "name": "hootner-astro",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "astro dev --port 3000",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "alpinejs": "^3.13.0"
  },
  "devDependencies": {
    "@types/alpinejs": "^3.13.0"
  }
}
```

<!-- cSpell:ignore alpinejs astrojs tailwindcss dragover rgba -->

### astro.config.mjs
```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  server: { port: 3000 }
});
```

### tailwind.config.mjs
```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: '#00ff00',
        secondary: '#00ffff',
        accent: '#ff00ff'
      }
    }
  }
};
```

## Base Layout (src/layouts/Layout.astro)
```astro
---
interface Props {
  title: string;
}
const { title } = Astro.props;
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} - HOOTNER</title>
</head>
<body class="bg-gradient-to-br from-gray-900 to-black text-white min-h-screen">
  <Nav />
  <main class="container mx-auto px-4 py-8">
    <slot />
  </main>
  <Footer />
</body>
</html>
```

## API Client (src/lib/api.ts)
```typescript
const API_BASE = import.meta.env.PUBLIC_API_BASE || 'http://localhost:3005/api';

export const api = {
  async get<T>(path: string): Promise<T> {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('hootner_auth_token') 
      : null;
    const res = await fetch(`${API_BASE}${path}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    return res.json();
  },
  
  async post<T>(path: string, data: unknown): Promise<T> {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('hootner_auth_token')
      : null;
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
```

## Page Examples

### 1. Dashboard (src/pages/index.astro)
```astro
---
import Layout from '../layouts/Layout.astro';
import StatCard from '../components/StatCard.astro';
import { api } from '../lib/api';

const stats = await api.get('/stats');
---
<Layout title="Dashboard">
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    {stats.map(stat => <StatCard {...stat} />)}
  </div>
  
  <div class="glass-card p-6">
    <h2 class="text-2xl font-bold mb-4">Recent Activity</h2>
    <div id="activity" x-data="activity()" x-init="load()">
      <template x-for="item in items">
        <div class="border-b border-gray-700 py-3" x-text="item.title"></div>
      </template>
    </div>
  </div>
</Layout>

<script>
  import Alpine from 'alpinejs';
  Alpine.data('activity', () => ({
    items: [],
    async load() {
      const res = await fetch('http://localhost:3005/api/activity');
      this.items = await res.json();
    }
  }));
  Alpine.start();
</script>

<style>
  .glass-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
</style>
```

### 2. Upload Video (src/pages/upload-video.astro)
```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout title="Upload Video">
  <div class="max-w-2xl mx-auto">
    <h1 class="text-4xl font-bold mb-8">Upload Video</h1>
    
    <div x-data="uploader()" class="glass-card p-8">
      <div 
        @drop.prevent="handleDrop"
        @dragover.prevent
        class="border-2 border-dashed border-primary rounded-lg p-12 text-center cursor-pointer hover:bg-white/5"
        @click="$refs.fileInput.click()"
      >
        <p class="text-xl mb-4">Drop video here or click to browse</p>
        <input type="file" x-ref="fileInput" @change="handleFile" class="hidden" accept="video/*">
      </div>
      
      <div x-show="uploading" class="mt-6">
        <div class="bg-gray-700 rounded-full h-4">
          <div class="bg-primary h-4 rounded-full transition-all" :style="`width: ${progress}%`"></div>
        </div>
        <p class="text-center mt-2" x-text="`${progress}% uploaded`"></p>
      </div>
      
      <form x-show="file" @submit.prevent="upload" class="mt-6 space-y-4">
        <input type="text" x-model="title" placeholder="Title" class="w-full bg-gray-800 rounded px-4 py-2">
        <textarea x-model="description" placeholder="Description" class="w-full bg-gray-800 rounded px-4 py-2 h-32"></textarea>
        <button type="submit" class="bg-primary text-black px-6 py-2 rounded font-bold hover:bg-primary/80">
          Upload
        </button>
      </form>
    </div>
  </div>
</Layout>

<script>
  import Alpine from 'alpinejs';
  Alpine.data('uploader', () => ({
    file: null,
    title: '',
    description: '',
    uploading: false,
    progress: 0,
    
    handleDrop(e) {
      this.file = e.dataTransfer.files[0];
    },
    
    handleFile(e) {
      this.file = e.target.files[0];
    },
    
    async upload() {
      this.uploading = true;
      const formData = new FormData();
      formData.append('video', this.file);
      formData.append('title', this.title);
      formData.append('description', this.description);
      
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        this.progress = Math.round((e.loaded / e.total) * 100);
      });
      
      xhr.addEventListener('load', () => {
        window.location.href = '/my-videos';
      });
      
      xhr.open('POST', 'http://localhost:3005/api/videos/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('hootner_auth_token')}`);
      xhr.send(formData);
    }
  }));
  Alpine.start();
</script>
```

### 3. My Videos (src/pages/my-videos.astro)
```astro
---
import Layout from '../layouts/Layout.astro';
import VideoCard from '../components/VideoCard.astro';
import { api } from '../lib/api';

const videos = await api.get('/videos/user');
---
<Layout title="My Videos">
  <h1 class="text-4xl font-bold mb-8">My Videos</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {videos.map(video => <VideoCard {...video} />)}
  </div>
</Layout>
```

### 4. Video Player (src/pages/video-player.astro)
```astro
---
import Layout from '../layouts/Layout.astro';
import { api } from '../lib/api';

const id = Astro.url.searchParams.get('id');
const video = await api.get(`/videos/${id}`);
---
<Layout title={video.title}>
  <div class="max-w-5xl mx-auto">
    <video controls class="w-full rounded-lg mb-6" src={video.url}></video>
    
    <h1 class="text-3xl font-bold mb-4">{video.title}</h1>
    <p class="text-gray-400 mb-8">{video.description}</p>
    
    <div x-data="comments()" x-init="load()" class="glass-card p-6">
      <h2 class="text-2xl font-bold mb-4">Comments</h2>
      <template x-for="comment in items">
        <div class="border-b border-gray-700 py-3">
          <p class="font-bold" x-text="comment.user"></p>
          <p x-text="comment.text"></p>
        </div>
      </template>
    </div>
  </div>
</Layout>

<script>
  import Alpine from 'alpinejs';
  Alpine.data('comments', () => ({
    items: [],
    async load() {
      const id = new URLSearchParams(window.location.search).get('id');
      const res = await fetch(`http://localhost:3005/api/videos/${id}/comments`);
      this.items = await res.json();
    }
  }));
  Alpine.start();
</script>
```

## Required Components (Create These First)

### Nav.astro
```astro
---
// src/components/Nav.astro
---
<nav class="bg-black/50 backdrop-blur-lg border-b border-gray-800">
  <div class="container mx-auto px-4 py-4 flex justify-between items-center">
    <a href="/" class="text-2xl font-bold text-primary">🦉 HOOTNER</a>
    <div class="space-x-6">
      <a href="/upload-video" class="hover:text-primary">Upload</a>
      <a href="/my-videos" class="hover:text-primary">My Videos</a>
      <a href="/marketplace" class="hover:text-primary">Marketplace</a>
      <a href="/profile" class="hover:text-primary">Profile</a>
    </div>
  </div>
</nav>
```

### Footer.astro
```astro
---
// src/components/Footer.astro
---
<footer class="bg-black/50 backdrop-blur-lg border-t border-gray-800 mt-16">
  <div class="container mx-auto px-4 py-8 text-center text-gray-400">
    <p>&copy; 2026 HOOTNER. Built with Astro.</p>
  </div>
</footer>
```

### StatCard.astro
```astro
---
interface Props {
  label: string;
  value: string | number;
  icon?: string;
}
const { label, value, icon } = Astro.props;
---
<div class="glass-card p-6">
  <p class="text-gray-400 text-sm mb-2">{label}</p>
  <p class="text-3xl font-bold text-primary">{value}</p>
</div>
```

### VideoCard.astro
```astro
---
interface Props {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
}
const { id, title, thumbnail, views } = Astro.props;
---
<a href={`/video-player?id=${id}`} class="glass-card overflow-hidden hover:scale-105 transition">
  <img src={thumbnail} alt={title} class="w-full h-48 object-cover">
  <div class="p-4">
    <h3 class="font-bold mb-2">{title}</h3>
    <p class="text-sm text-gray-400">{views} views</p>
  </div>
</a>
```

## Remaining Pages (Generate Similar Pattern)

5. **analytics.astro** - Fetch `/api/analytics`, render Chart.js
6. **profile.astro** - Fetch `/api/users/profile`, form with Alpine.js
7. **settings.astro** - Tabs with Alpine.js, PATCH to `/api/users/settings`
8. **marketplace.astro** - Grid of templates from `/api/marketplace`
9. **messages.astro** - Chat UI with WebSocket (Alpine.js)
10. **live-stream.astro** - Video preview, chat, POST to `/api/streams/start`
11. **collaboration.astro** - Project list from `/api/projects`
12. **ai-video.astro** - Prompt form, POST to `/api/ai/generate`
13. **auto-editor.astro** - Timeline UI, POST to `/api/editor/auto`
14. **contact.astro** - Contact form, POST to `/api/contact`
15. **login.astro** - Auth form, POST to `/api/auth/login`

## Success Criteria
- ✅ Each page < 100 lines
- ✅ Zero JS shipped (except interactive islands)
- ✅ SSR by default (fast initial load)
- ✅ TypeScript for type safety
- ✅ Tailwind for styling
- ✅ Alpine.js only where needed

## Setup Steps (Do These First)

### 1. Create Directory
```bash
mkdir -p apps/frontend/astro-app
cd apps/frontend/astro-app
```

### 2. Initialize Project
```bash
npm create astro@latest . -- --template minimal --no-install --typescript strict
```

### 3. Install Dependencies
```bash
npm install astro@^4.0.0 @astrojs/tailwind@^5.0.0 tailwindcss@^3.4.0 alpinejs@^3.13.0
```

### 4. Create .env File
```bash
echo "PUBLIC_API_BASE=http://localhost:3005/api" > .env
```

### 5. Create All Directories
```bash
mkdir -p src/pages src/layouts src/components src/lib
```

### 6. File Creation Order
1. **astro.config.mjs** (config first)
2. **tailwind.config.mjs** (styling config)
3. **package.json** (update scripts)
4. **src/lib/api.ts** (API client)
5. **src/layouts/Layout.astro** (base layout)
6. **src/components/Nav.astro** (navigation)
7. **src/components/Footer.astro** (footer)
8. **src/components/StatCard.astro** (reusable component)
9. **src/components/VideoCard.astro** (reusable component)
10. **All 15 pages** in src/pages/

## Run Commands
```bash
npm run dev
# Visit http://localhost:3000
```

## Why Astro?
- **50x faster** than React (ships HTML, not JS)
- **Island architecture** (hydrate only interactive parts)
- **Built-in Tailwind** (no config needed)
- **TypeScript native** (no setup)
- **SEO perfect** (SSR by default)
- **Future-proof** (newest framework, 2024)

## Generate Now
Create all files in `apps/frontend/astro-app/` with minimal, production-ready code.
