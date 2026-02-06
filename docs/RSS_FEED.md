# HOOTNER RSS Feed

## 📡 RSS Feed Implementation

### Feed URL
```
https://hootner.com/feed.xml
```

### Features
- ✅ AI-Generated content categorization
- ✅ Holographic streaming posts
- ✅ Mind-to-Video content
- ✅ Secured content markers
- ✅ Media enclosures (images/videos)
- ✅ User attribution
- ✅ Timestamps

### Categories
- `AI-Generated` - Neural synthesis content
- `Holographic` - 3D volumetric videos
- `Mind-to-Video` - Consciousness-captured content
- `Secured` - Military-grade protected posts

### Usage

**Subscribe in RSS Reader:**
1. Copy feed URL: `https://hootner.com/feed.xml`
2. Add to your RSS reader (Feedly, Inoreader, etc.)
3. Get automatic updates

**Programmatic Access:**
```javascript
fetch('https://hootner.com/feed.xml')
  .then(res => res.text())
  .then(xml => console.log(xml));
```

### API Integration

**Backend (Express):**
```javascript
const rssRoutes = require('./api/rss-routes');
app.use('/', rssRoutes);
```

**Generate Feed:**
```javascript
const { generateRSSFeed } = require('./api/rss-feed');
const posts = await getPosts(); // Your database query
const rss = generateRSSFeed(posts);
```

### Feed Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>HOOTNER</title>
    <link>https://hootner.com</link>
    <description>AI-Native Video Intelligence Platform</description>
    <item>
      <title>Post Title</title>
      <link>https://hootner.com/post/123</link>
      <pubDate>Mon, 01 Jan 2026 12:00:00 GMT</pubDate>
      <description>Post content</description>
      <category>AI-Generated</category>
    </item>
  </channel>
</rss>
```

### Files Created
- `api/rss-feed.js` - RSS generator
- `api/rss-routes.js` - Express routes
- RSS button in feed.html header
- RSS modal with feed URL

### Next Steps
1. Connect to your database
2. Replace `getPosts()` with real data query
3. Deploy RSS endpoint
4. Test with RSS reader
