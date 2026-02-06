// RSS Feed Generator for HOOTNER
const generateRSSFeed = (posts) => {
  const now = new Date().toUTCString();
  
  const items = posts.map(post => `
    <item>
      <title><![CDATA[${post.user.name}: ${post.content.substring(0, 100)}...]]></title>
      <link>https://hootner.com/post/${post.id}</link>
      <guid>https://hootner.com/post/${post.id}</guid>
      <pubDate>${new Date(post.timestamp || Date.now()).toUTCString()}</pubDate>
      <description><![CDATA[${post.content}]]></description>
      <author>${post.user.handle}</author>
      ${post.media ? `<enclosure url="${post.media.url}" type="${post.media.type === 'video' ? 'video/mp4' : 'image/jpeg'}" />` : ''}
      ${post.aiGenerated ? '<category>AI-Generated</category>' : ''}
      ${post.holographic ? '<category>Holographic</category>' : ''}
      ${post.mindGenerated ? '<category>Mind-to-Video</category>' : ''}
    </item>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HOOTNER - AI-Native Video Intelligence Platform</title>
    <link>https://hootner.com</link>
    <description>The World's Most Advanced AI-Native Video Intelligence Platform - Neural-powered content, holographic streaming, and quantum-grade AI</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="https://hootner.com/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://hootner.com/logo.png</url>
      <title>HOOTNER</title>
      <link>https://hootner.com</link>
    </image>
    ${items}
  </channel>
</rss>`;
};

module.exports = { generateRSSFeed };
