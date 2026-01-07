/* global state, addOutput, createFile, featureExpansions */
import { DEFAULT_PORT } from '../../constants/timeouts.js';
import DOMPurify from 'dompurify';

class CrossIntegration { 
  constructor() { 
    this.videoPlayerUrl = `http://localhost:${DEFAULT_PORT}/video-player.html`;
    this.marketplaceUrl = `http://localhost:${DEFAULT_PORT}/marketplace.html`;
    this.dashboardUrl = `http://localhost:${DEFAULT_PORT}/dashboard.html`; 
  }

  embedVideoPreview(videoUrl) { 
    try {
      const container = document.getElementById('previewPane') || this.createPreviewPane();
      container.innerHTML = DOMPurify.sanitize(`
        <iframe src="${this.videoPlayerUrl}?video=${encodeURIComponent(videoUrl)}" 
                style="width:100%; height:100%; border:none;"
                allow="autoplay; fullscreen">
        </iframe>
      `);
      if (typeof addOutput === 'function') addOutput('✓ Video preview loaded', 'success');
    } catch (error) {
      console.error('Embed video preview failed:', error);
    }
  }

  openMarketplace() { 
    try {
      const win = window.open(this.marketplaceUrl, '_blank', 'width=1200,height=800');
      if (win) { 
        win.focus();
        if (typeof addOutput === 'function') addOutput('✓ Marketplace opened', 'success'); 
      }
    } catch (error) {
      console.error('Open marketplace failed:', error);
    }
  }

  openDashboard() { 
    try {
      const win = window.open(this.dashboardUrl, '_blank', 'width=1400,height=900');
      if (win) { 
        win.focus();
        if (typeof addOutput === 'function') addOutput('✓ Dashboard opened', 'success'); 
      }
    } catch (error) {
      console.error('Open dashboard failed:', error);
    }
  }

  shareToSocialFeed(code, description) { 
    try {
      const data = { 
        type: 'code',
        content: code,
        description,
        language: (typeof state !== 'undefined' && state.currentFile) ? state.currentFile.split('.').pop() : 'javascript',
        timestamp: Date.now() 
      };
      localStorage.setItem('hootnerSharePending', JSON.stringify(data));
      window.open(`http://localhost:${DEFAULT_PORT}/social-feed.html`, '_blank');
      if (typeof addOutput === 'function') addOutput('✓ Shared to social feed', 'success');
    } catch (error) {
      console.error('Share to social feed failed:', error);
    }
  }

  async importFromMarketplace(itemId) { 
    try { 
      const response = await fetch(`http://localhost:${DEFAULT_PORT}/api/marketplace/${itemId}`);
      const item = await response.json();
      if (item.type === 'snippet' && typeof featureExpansions !== 'undefined') { 
        featureExpansions.addSnippet('marketplace', item.name, item.code, item.trigger);
        if (typeof addOutput === 'function') addOutput(`✓ Imported snippet: ${item.name}`, 'success'); 
      } else if (item.type === 'template' && typeof createFile === 'function') { 
        createFile(item.filename, item.code);
        if (typeof addOutput === 'function') addOutput(`✓ Imported template: ${item.filename}`, 'success'); 
      }
    } catch (error) { 
      console.error('Import from marketplace failed:', error);
      if (typeof addOutput === 'function') addOutput(`✗ Import failed: ${error.message}`, 'error'); 
    }
  }

  syncAnalytics() { 
    try {
      const analytics = { 
        files: (typeof state !== 'undefined' && state.fileSystem) ? Object.keys(state.fileSystem).length : 0,
        lines: (typeof state !== 'undefined' && state.fileSystem) ? Object.values(state.fileSystem)
          .filter(f => f.type === 'file')
          .reduce((sum, f) => sum + (f.content ? f.content.split('\n').length : 0), 0) : 0,
        commits: (typeof featureExpansions !== 'undefined') ? featureExpansions.getCommitHistory().length : 0,
        lastActive: Date.now() 
      };
      localStorage.setItem('hootnerEditorAnalytics', JSON.stringify(analytics));
      if (typeof addOutput === 'function') addOutput('✓ Analytics synced', 'success');
    } catch (error) {
      console.error('Sync analytics failed:', error);
    }
  }

  createPreviewPane() { 
    const container = document.querySelector('.editor-container');
    const pane = document.createElement('div');
    pane.id = 'previewPane';
    pane.style.cssText = 'flex:1; background:white; border-left:1px solid var(--border);';
    if (container) container.appendChild(pane);
    return pane; 
  }

  exportToVideoEditor(code) { 
    try {
      const data = { 
        type: 'code-snippet',
        code,
        language: (typeof state !== 'undefined' && state.currentFile) ? state.currentFile.split('.').pop() : 'javascript',
        timestamp: Date.now() 
      };
      localStorage.setItem('hootnerVideoExport', JSON.stringify(data));
      window.open(this.videoPlayerUrl, '_blank');
      if (typeof addOutput === 'function') addOutput('✓ Exported to video editor', 'success');
    } catch (error) {
      console.error('Export to video editor failed:', error);
    }
  }

  receiveFromApp() { 
    try {
      const pending = localStorage.getItem('hootnerImportPending');
      if (pending) { 
        const data = JSON.parse(pending);
        if (data.type === 'code' && typeof createFile === 'function') { 
          createFile(data.filename || 'imported.js', data.content);
          if (typeof addOutput === 'function') addOutput(`✓ Imported from ${data.source}`, 'success'); 
        }
        localStorage.removeItem('hootnerImportPending'); 
      }
    } catch (error) {
      console.error('Receive from app failed:', error);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) { module.exports = CrossIntegration; }
