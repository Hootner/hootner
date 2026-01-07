import DOMPurify from 'dompurify';

window.fallbackHandlers = { 
  showWebServices: () => { 
    try {
      const panel = document.getElementById('output');
      if (panel) { 
        panel.innerHTML = DOMPurify.sanitize(`
          <div style="padding: 16px;">
            <h3>🌐 Web Services (Demo Mode)</h3>
            <p>Web services are available in full version.</p>
            <button onclick="alert('Demo: GitHub connected')" style="padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer; margin: 4px;">Connect GitHub</button>
            <button onclick="alert('Demo: NPM search')" style="padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer; margin: 4px;">Search NPM</button>
          </div>
        `); 
      }
    } catch (error) {
      console.error('Show web services failed:', error);
    }
  },

  showShareOptions: () => { 
    try {
      const panel = document.getElementById('output');
      if (panel) { 
        panel.innerHTML = DOMPurify.sanitize(`
          <div style="padding: 16px;">
            <h3>📤 Share Options (Demo Mode)</h3>
            <p>Sharing features are available in full version.</p>
            <button onclick="alert('Demo: Shared to GitHub Gist')" style="padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer; margin: 4px;">GitHub Gist</button>
            <button onclick="alert('Demo: Shared to Social')" style="padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer; margin: 4px;">Social Feed</button>
          </div>
        `); 
      }
    } catch (error) {
      console.error('Show share options failed:', error);
    }
  },

  showPackagePanel: () => { 
    try {
      const panel = document.getElementById('output');
      if (panel) { 
        panel.innerHTML = DOMPurify.sanitize(`
          <div style="padding: 16px;">
            <h3>📦 Package Manager (Demo Mode)</h3>
            <p>Package management is available in full version.</p>
            <div style="margin: 16px 0;">
              <h4>Demo Packages</h4>
              <div style="padding: 8px; border: 1px solid var(--border); margin: 8px 0; border-radius: 4px;">
                <strong>react</strong> v18.2.0
                <p style="margin: 4px 0; font-size: 13px; color: var(--text-muted);">JavaScript library for building user interfaces</p>
                <button onclick="alert('Demo: React installed')" style="padding: 4px 8px; background: var(--accent); color: white; border: none; border-radius: 3px; cursor: pointer;">Install</button>
              </div>
            </div>
          </div>
        `); 
      }
    } catch (error) {
      console.error('Show package panel failed:', error);
    }
  },

  showCloudPanel: () => { 
    try {
      const panel = document.getElementById('output');
      if (panel) { 
        panel.innerHTML = DOMPurify.sanitize(`
          <div style="padding: 16px;">
            <h3>☁️ Cloud Sync (Demo Mode)</h3>
            <p>Cloud features are available in full version.</p>
            <button onclick="alert('Demo: Project saved to cloud')" style="padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer; margin: 4px;">Save Project</button>
            <button onclick="alert('Demo: Backup created')" style="padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer; margin: 4px;">Create Backup</button>
          </div>
        `); 
      }
    } catch (error) {
      console.error('Show cloud panel failed:', error);
    }
  },

  showAIPanel: () => { 
    try {
      const panel = document.getElementById('output');
      if (panel) { 
        panel.innerHTML = DOMPurify.sanitize(`
          <div style="padding: 16px;">
            <h3>🤖 AI Assistant (Demo Mode)</h3>
            <p>AI features are available in full version.</p>
            <button onclick="alert('Demo: Code analyzed')" style="padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer; margin: 4px;">Analyze Code</button>
            <button onclick="alert('Demo: Code refactored')" style="padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer; margin: 4px;">Refactor</button>
          </div>
        `); 
      }
    } catch (error) {
      console.error('Show AI panel failed:', error);
    }
  },

  showMarketplace: () => { 
    try {
      const panel = document.getElementById('output');
      if (panel) { 
        panel.innerHTML = DOMPurify.sanitize(`
          <div style="padding: 16px;">
            <h3>🔌 Plugin Marketplace (Demo Mode)</h3>
            <p>Plugin system is available in full version.</p>
            <div style="margin: 16px 0;">
              <h4>Demo Plugins</h4>
              <div style="padding: 8px; border: 1px solid var(--border); margin: 8px 0; border-radius: 4px;">
                <strong>✨ Prettier</strong>
                <p style="margin: 4px 0; font-size: 13px; color: var(--text-muted);">Code formatter</p>
                <button onclick="alert('Demo: Prettier installed')" style="padding: 4px 8px; background: var(--accent); color: white; border: none; border-radius: 3px; cursor: pointer;">Install</button>
              </div>
            </div>
          </div>
        `); 
      }
    } catch (error) {
      console.error('Show marketplace failed:', error);
    }
  },

  showTemplates: () => { 
    try {
      const panel = document.getElementById('output');
      if (panel) { 
        panel.innerHTML = DOMPurify.sanitize(`
          <div style="padding: 16px;">
            <h3>🚀 Project Templates (Demo Mode)</h3>
            <p>Template system is available in full version.</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 16px 0;">
              <div style="padding: 16px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer;" onclick="alert('Demo: React template created')">
                <h4>React App</h4>
                <p style="font-size: 12px; color: var(--text-muted);">Includes: react, react-dom</p>
              </div>
              <div style="padding: 16px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer;" onclick="alert('Demo: Express template created')">
                <h4>Express Server</h4>
                <p style="font-size: 12px; color: var(--text-muted);">Includes: express</p>
              </div>
            </div>
          </div>
        `); 
      }
    } catch (error) {
      console.error('Show templates failed:', error);
    }
  } 
};

setTimeout(() => { 
  try {
    if (!window.packageManager) { 
      window.packageManager = { showPackagePanel: window.fallbackHandlers.showPackagePanel }; 
    }
    if (!window.cloudSync) { 
      window.cloudSync = { showCloudPanel: window.fallbackHandlers.showCloudPanel }; 
    }
    if (!window.aiAssistant) { 
      window.aiAssistant = { showAIPanel: window.fallbackHandlers.showAIPanel }; 
    }
    if (!window.pluginSystem) { 
      window.pluginSystem = { showMarketplace: window.fallbackHandlers.showMarketplace }; 
    }
    if (!window.quickSetup) { 
      window.quickSetup = { showTemplates: window.fallbackHandlers.showTemplates }; 
    }
  } catch (error) {
    console.error('Fallback assignment failed:', error);
  }
}, 1000);
