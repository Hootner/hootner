#!/usr/bin/env node
/**
 * Layer 7: Static Site Generator - Build static websites
 * Dependencies: Layer 2 (Parser), Layer 3 (Filesystem), Layer 7 (Template Engine)
 */

class StaticSiteGenerator {
  constructor() {
    this.pages = [];
    this.layouts = new Map();
    this.config = { outputDir: 'dist' };
  }

  // Add page
  addPage(path, content, metadata = {}) {
    this.pages.push({
      path,
      content,
      metadata: {
        title: metadata.title || 'Untitled',
        layout: metadata.layout || 'default',
        date: metadata.date || Date.now(),
        ...metadata
      }
    });
    console.log(`[PAGE] Added ${path}`);
  }

  // Add layout
  addLayout(name, template) {
    this.layouts.set(name, template);
    console.log(`[LAYOUT] Added ${name}`);
  }

  // Parse markdown (simplified)
  parseMarkdown(md) {
    let html = md;
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    // Paragraphs
    html = html.split('\n\n').map(p => {
      if (!p.startsWith('<')) return `<p>${p}</p>`;
      return p;
    }).join('\n');
    
    return html;
  }

  // Parse front matter
  parseFrontMatter(content) {
    const match = content.match(/^---\n(.*?)\n---\n(.*)/s);
    
    if (!match) return { metadata: {}, content };
    
    const [, frontMatter, body] = match;
    const metadata = {};
    
    for (const line of frontMatter.split('\n')) {
      const [key, ...value] = line.split(':');
      if (key && value.length) {
        metadata[key.trim()] = value.join(':').trim();
      }
    }
    
    return { metadata, content: body };
  }

  // Build page
  buildPage(page) {
    const { metadata, content: body } = this.parseFrontMatter(page.content);
    const mergedMetadata = { ...page.metadata, ...metadata };
    
    // Parse markdown
    const html = this.parseMarkdown(body);
    
    // Apply layout
    const layout = this.layouts.get(mergedMetadata.layout);
    if (!layout) return html;
    
    return layout
      .replace('{{ content }}', html)
      .replace('{{ title }}', mergedMetadata.title)
      .replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
        return mergedMetadata[key] || '';
      });
  }

  // Build all pages
  build() {
    console.log('\n[BUILD] Starting build...\n');
    
    const output = [];
    
    for (const page of this.pages) {
      const html = this.buildPage(page);
      output.push({
        path: page.path,
        html,
        metadata: page.metadata
      });
      console.log(`[BUILT] ${page.path}`);
    }
    
    console.log(`\n[BUILD] Complete! Generated ${output.length} pages`);
    return output;
  }

  // Generate sitemap
  generateSitemap() {
    const urls = this.pages.map(page => ({
      loc: page.path,
      lastmod: new Date(page.metadata.date).toISOString()
    }));
    
    return urls;
  }

  // Generate RSS feed
  generateRSS() {
    const items = this.pages
      .sort((a, b) => b.metadata.date - a.metadata.date)
      .slice(0, 10)
      .map(page => ({
        title: page.metadata.title,
        link: page.path,
        pubDate: new Date(page.metadata.date).toUTCString()
      }));
    
    return items;
  }
}

// Demo
if (require.main === module) {
  const ssg = new StaticSiteGenerator();
  
  console.log('=== Static Site Generator Demo ===\n');
  
  // Add layouts
  ssg.addLayout('default', `
<!DOCTYPE html>
<html>
<head>
  <title>{{ title }}</title>
</head>
<body>
  <nav>{{ siteName }}</nav>
  {{ content }}
  <footer>© 2024</footer>
</body>
</html>
  `.trim());
  
  console.log();
  
  // Add pages
  ssg.addPage('/index.html', `
---
title: Home Page
siteName: My Blog
---

# Welcome

This is a **static site** generator demo.

## Features

- Markdown parsing
- Front matter
- Layouts
  `.trim(), { layout: 'default' });
  
  ssg.addPage('/about.html', `
# About

This is the *about* page.

[Home](/)
  `.trim(), { title: 'About', layout: 'default' });
  
  // Build
  const output = ssg.build();
  
  console.log('\n--- Generated HTML ---\n');
  console.log(output[0].html.slice(0, 200) + '...');
  
  console.log('\n--- Sitemap ---');
  console.log(ssg.generateSitemap());
}

module.exports = StaticSiteGenerator;
