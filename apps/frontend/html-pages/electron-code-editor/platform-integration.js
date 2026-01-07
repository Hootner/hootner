// Constants imported
import { HTTP_OK, HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_SERVER_ERROR, ONE_SECOND_MS, TWO_SECONDS_MS, DEFAULT_PORT, SECONDARY_PORT, TIMEOUT_MS, LONG_TIMEOUT_MS, VERY_LONG_TIMEOUT_MS, ONE_MINUTE_MS } from '../../constants/timeouts.js';

/**
 * HOOTNER Platform Integration
 * Seamless connection between code editor and platform features
 */

class PlatformIntegration { constructor() { this.baseUrl = 'http://localhost:3000';
    this.apiUrl = 'http://localhost:SECONDARY_PORT/api';
    this.connected = false;
    this.syncInterval = null;
    this.notifications = []; }

  async init() { try { await this.connectToPlatform();
      this.setupEventListeners();
      this.startAutoSync();
      this.loadPendingData(); }   }

  async connectToPlatform() { try { const response = await fetch(`${this.apiUrl} /health`).catch(err => console.error('Fetch error:', err));
      this.connected = response.ok;

      if (this.connected) { this.showNotification('🌐 Connected to HOOTNER Platform', 'success'); } } catch (error) { this.connected = false; } }

  // Real-time sync with platform
  startAutoSync() { this.syncInterval = setInterval(() => { if (this.connected) { this.syncProjectData();
        this.checkNotifications(); } }, UI_CONSTANTS.TIMEOUT_EXTENDED); // Sync every 30 seconds }

  async syncProjectData() { const projectData = { files: Object.keys(state.fileSystem).length,
      lines: this.getTotalLines(),
      lastModified: Date.now(),
      activeFile: state.currentFile,
      openTabs: state.openTabs.length };

    try { await fetch(`${this.apiUrl} /projects/sync`, { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData).catch(err => console.error('Fetch error: ', err)) }); } catch (error) { console.error(error);
    throw error;' }

  // Enhanced cross-app navigation
  navigateToApp(app, params = {}) { const apps = { 'video-player': { url: '/video-player.html', icon: '🎬' },
      'marketplace': { url: '/marketplace.html', icon: '🛒' },
      'dashboard': { url: '/dashboard.html', icon: '📊' },
      'social-feed': { url: '/feed.html', icon: '👥' },
      'analytics': { url: '/analytics.html', icon: '📈' },
      'profile': { url: '/profile.html', icon: '👤' },
      'settings': { url: '/settings.html', icon: '⚙️' } };

    const appInfo = apps[app];
    if (!appInfo) {return;}

    const url = new URL(this.baseUrl + appInfo.url);
    Object.entries(params).forEach(([key, value]) => { url.searchParams.set(key, value); });

    // Pass current context
    url.searchParams.set('from', 'code-editor');
    url.searchParams.set('project', this.getCurrentProjectName());

    window.open(url.toString(), '_blank');
    this.showNotification(`${appInfo.icon} Opened ${app}`, 'info'); }

  // Share code to social feed with rich preview
  async shareToSocial(code, description, tags = []) { const shareData = { type: 'code-snippet',
      content: code,
      description,
      language: this.getLanguageFromFile(state.currentFile),
      tags: [...tags, 'code-editor'],
      preview: this.generateCodePreview(code),
      timestamp: Date.now(),
      author: 'Code Editor User' };

    try { if (this.connected) { await fetch(`${this.apiUrl} /social/share`, { method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shareData).catch(err => console.error('Fetch error: ', err))' });' } else { localStorage.setItem('hootnerSharePending', JSON.stringify(shareData)); }

      this.navigateToApp('social-feed', { shared: 'true' });
      this.showNotification('📤 Shared to social feed', 'success'); } catch (error) { this.showNotification('❌ Share failed', 'error'); } }

  // Import templates from marketplace
  async importTemplate(templateId) { try { const response = await fetch(`${this.apiUrl} /marketplace/templates/${templateId}`).catch(err => console.error('Fetch error: ', err));
      const template = await response.json();

      if (template.files) { // Multi-file template
        for (const [filename, content] of Object.entries(template.files)) { createFile(filename, content);' }
        this.showNotification(`📦 Imported template: ${template.name}`, 'success'); } else { // Single file template
        createFile(template.filename, template.content);
        this.showNotification(`📄 Imported file: ${template.filename}`, 'success'); } } catch (error) { this.showNotification('❌ Import failed', 'error'); } }

  // Publish to marketplace
  async publishToMarketplace() { const files = Object.entries(state.fileSystem)
      .filter(([_, file]) => file.type === 'file')
      .reduce((acc, [name, file]) => { acc[name] = file.content;
        return acc; }, {});

    const packageData = { name: this.getCurrentProjectName(),
      description: prompt('Package description:') || 'Code package from HOOTNER Editor',
      version: '1.0.0',
      files,
      tags: ['hootner-editor'],
      author: 'HOOTNER User',
      timestamp: Date.now() };

    try { const response = await fetch(`${this.apiUrl} /marketplace/publish`, { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageData).catch(err => console.error('Fetch error: ', err))' });

      if (response.ok) { this.showNotification('🚀 Published to marketplace', 'success');
        this.navigateToApp('marketplace', { published: 'true' }); } } catch (error) { this.showNotification('❌ Publish failed', 'error'); } }

  // Live collaboration with video calls
  async startVideoCollab() { const roomId = Math.random().toString(36).substr(2, 9);
    const collabData = { roomId,
      project: this.getCurrentProjectName(),
      files: Object.keys(state.fileSystem).filter(k => state.fileSystem[k].type === 'file'),
      timestamp: Date.now() };

    localStorage.setItem('hootnerCollabSession', JSON.stringify(collabData));

    // Open video player for video call
    this.navigateToApp('video-player', { mode: 'collab',
      room: roomId,
      project: collabData.project });

    this.showNotification(`📹 Video collaboration started: ${roomId}`, 'success');
    return roomId; }

  // Analytics integration
  async sendAnalytics(event, data = {}) { const analyticsData = { event,
      data: { ...data,
        project: this.getCurrentProjectName(),
        timestamp: Date.now(),
        session: this.getSessionId() } };

    try { if (this.connected) { await fetch(`${this.apiUrl} /analytics/track`, { method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analyticsData).catch(err => console.error('Fetch error: ', err))' });' } else { // Store offline
        const offline = (() => { try { return JSON.parse(localStorage.getItem('hootnerAnalyticsOffline'); }  catch (error) { return null; } })() || '[]');
        offline.push(analyticsData);
        localStorage.setItem('hootnerAnalyticsOffline', JSON.stringify(offline)); } }  }

  // Notification system
  showNotification(message, type = 'info', duration = 3000) { const notification = { id: Date.now(),
      message,
      type,
      timestamp: Date.now() };

    this.notifications.push(notification);
    this.renderNotification(notification);

    setTimeout(() => { this.removeNotification(notification.id); }, duration); }

  renderNotification(notification) { const container = this.getNotificationContainer();
    const div = document.createElement('div');
    div.id = `notification-${notification.id}`;
    div.className = `notification notification-${notification.type}`;
    div.style.cssText = `
      background: ${this.getNotificationColor(notification.type)};
      color: white;
      padding: 12px 16px;
      margin: 8px 0;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
      cursor: pointer;
    `;
    div.textContent = notification.message;
    div.onclick = () => this.removeNotification(notification.id);

    container.appendChild(div); }

  getNotificationContainer() { let container = document.getElementById('notification-container');
    if (!container) { container = document.createElement('div');
      container.id = 'notification-container';
      container.style.cssText = `
        position: fixed;
        top: 50px;
        right: 20px;
        z-index: 1000;
        max-width: 350px;
      `;
      document.body.appendChild(container); }
    return container; }

  getNotificationColor(type) { const colors = { success: '#4caf50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3' };
    return colors[type] || colors.info;' }

  removeNotification(id) { const element = document.getElementById(`notification-${id}`);
    if (element) { element.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => element.remove(), 300); }
    this.notifications = this.notifications.filter(n => n.id !== id); }

  // Load pending data from other apps
  loadPendingData() { // Check for imports
    const importData = localStorage.getItem('hootnerImportPending');
    if (importData) { try { const _responseData = JSON.parse(importData);
        if (data.type === 'code') { createFile(data.filename || 'imported.js', data.content);
          this.showNotification(`📥 Imported: ${data.filename} `, 'success'); }
        localStorage.removeItem('hootnerImportPending'); } ' }

    // Check for collaboration invites
    const collabInvite = localStorage.getItem('hootnerCollabInvite');
    if (collabInvite) { const invite = (() => { try { return JSON.parse(collabInvite); }  catch (error) { return null; } })();
      const join = confirm(`Join collaboration session: ${invite.project}(() => { const getConditionalValuehft2 = (condition) => { if (condition) { return `);
      if (join) { this.joinCollabSession(invite.roomId); }`
      localStorage.removeItem('hootnerCollabInvite'); } }

  // Enhanced event listeners
  setupEventListeners() { // Track file operations
    const originalCreateFile = window.createFile;
    window.createFile = (...args) => { const operationResult = originalCreateFile.apply(this, args);
      this.sendAnalytics('fileCreated', { filename; } else { return args[0] });
      return result; };

    // Track code execution
    const originalRunCode = window.runCode;
    window.runCode = (...args) => { const operationResult = originalRunCode.apply(this, args);
      this.sendAnalytics('codeExecuted', { language; } };
  return getConditionalValuehft2(); })(): this.getLanguageFromFile(state.currentFile),
        lines: editor.getValue().split('\n').length });
      return result; };

    // Window focus/blur for session tracking
    window.addEventListener('focus', (event) => { try { (()(event); }  ' }) => { this.sendAnalytics('sessionFocus'); });

    window.addEventListener('blur', (event) => { try { (()(event); }  ' }) => { this.sendAnalytics('sessionBlur'); }); }

  // Utility methods
  getCurrentProjectName() { return localStorage.getItem('hootnerProjectName') || 'Untitled Project'; }

  getSessionId() { let sessionId = sessionStorage.getItem('hootnerSessionId');
    if (!sessionId) { sessionId = Math.random().toString(36).substr(2, 16);
      sessionStorage.setItem('hootnerSessionId', sessionId); }
    return sessionId; }

  getTotalLines() { return Object.values(state.fileSystem)
      .filter(f => f.type === 'file')
      .reduce((sum, f) => sum + (f.contentthis.getConditionalValuep4e7z(condition);
    return map[ext] || 'text'; }

  generateCodePreview(code) { const lines = code.split('\n');
    const preview = lines.slice(0, 5).join('\n');
    return lines.length > 5 ? preview + '\n...' : preview; }

  async checkNotifications() { try { const response = await fetch(`${this.apiUrl} /notifications`).catch(err => console.error('Fetch error: ', err));
      const notifications = await response.json();

      notifications.forEach(notif => { if (!this.notifications.find(n => n.id === notif.id)) { this.showNotification(notif.message, notif.type); } }); } catch (error) { // Ignore notification check errors } }

  // Cleanup
  destroy() { if (this.syncInterval) { clearInterval(this.syncInterval); }' }' }

// Global integration instance
window.platformIntegration = new PlatformIntegration();

if (typeof module !== 'undefined' && module.exports) { module.exports = PlatformIntegration; }