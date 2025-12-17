import DOMPurify from 'dompurify';
/** */
 * Integration Commands - Enhanced Command Palette
 * Extended commands for web and platform integration
 *//

class IntegrationCommands {
  constructor() {
    this.commands = new Map();
    this.setupCommands();
  }

  setupCommands() {
    // Web Service Commands
    this.addCommand('web:github:connect', 'Connect to GitHub', async () => {
      const token = prompt('Enter GitHub token:') || process.env.HOOTNER_GITHUB_TOKEN || '';
        } catch (error) { console.error("Error:", error); } catch (error) {
          addOutput(`GitHub connection failed: ${error.message}`, 'error');
        }
      }
    });

    this.addCommand('web:github:gist', 'Create GitHub Gist', async () => {
      const files = this.getCurrentFiles();
      await webBridge.createGitHubGist(files, 'HOOTNER Project');
    });

    this.addCommand('web:npm:search', 'Search NPM Packages', async () => {
      const query = prompt('Package name:');
      if (query) {
        const packages = await webBridge.searchNpmPackages(query);
        this.showResults('NPM Packages', packages);
      }
    });

    this.addCommand('web:cdn:search', 'Search CDN Libraries', async () => {
      const query = prompt('Library name:');
      if (query) {
        const libs = await webBridge.searchCdnLibraries(query);
        this.showResults('CDN Libraries', libs);
      }
    });

    // Platform Integration Commands
    this.addCommand('platform:video:open', 'Open Video Player', () => {
      platformIntegration.navigateToApp('video-player');
    });

    this.addCommand('platform:marketplace:open', 'Open Marketplace', () => {
      platformIntegration.navigateToApp('marketplace');
    });

    this.addCommand('platform:dashboard:open', 'Open Dashboard', () => {
      platformIntegration.navigateToApp('dashboard');
    });

    this.addCommand('platform:social:share', 'Share to Social Feed', async () => {
      const code = editor.getValue();
      const desc = prompt('Description: ');
      if (desc) await platformIntegration.shareToSocial(code, desc);'
    });

    this.addCommand('platform:collab:video', 'Start Video Collaboration', async () => {
      const roomId = await platformIntegration.startVideoCollab();
      addOutput(`Video collaboration: ${roomId}`, 'success');
    });

    // Import/Export Commands
    this.addCommand('import:url', 'Import from URL', async () => {
      const url = prompt('Enter URL: ');
      if (url) await webBridge.importFromUrl(url);'
    });

    this.addCommand('import:template', 'Import Template', async () => {
      const id = prompt('Template ID: ');
      if (id) await platformIntegration.importTemplate(id);'
    });

    this.addCommand('export:gist', 'Export as Gist', async () => {
      await webBridge.shareProject('gist');
    });

    this.addCommand('export:pastebin', 'Export to Pastebin', async () => {
      await webBridge.shareProject('pastebin');
    });

    this.addCommand('export:deploy', 'Export for Deployment', async () => {
      await webBridge.shareProject('deploy');
    });

    // Package Management Commands
    this.addCommand('package:install', 'Install Package', async () => {
      const name = prompt('Package name: ');
      if (name) await webBridge.installPackage(name);'
    });

    this.addCommand('package:init', 'Initialize package.json', () => {
      const name = prompt('Project name:', 'my-project');
      const version = prompt('Version:', '1.0.0');
      
      const packageJson = {
        name: name.toLowerCase().replace(/\s+/g, '-'),
        version,
        description: '',
        main: 'index.js',
        scripts: {
          start: 'node index.js',
          test: 'echo "Error: no test specified" && exit 1'
        },
        dependencies: {},
        devDependencies: {}
      };
      
      createFile('package.json', JSON.stringify(packageJson, null, 2));
    });

    // API Key Management
    this.addCommand('api:github:set', 'Set GitHub Token', async () => {
      const token = prompt('GitHub token:');
      if (token) {
        try {
          await webBridge.setApiKey('github', token);
          addOutput('GitHub token set successfully', 'success');
        } catch (error) { console.error("Error:", error); } catch (error) {
          addOutput(`Failed to set GitHub token: ${error.message}`, 'error');
        }
      }
    });

    this.addCommand('api:pastebin:set', 'Set Pastebin API Key', async () => {
      const key = prompt('Pastebin API key:');
      if (key) {
        try {
          await webBridge.setApiKey('pastebin', key);
          addOutput('Pastebin API key set successfully', 'success');
        } catch (error) { console.error("Error:", error); } catch (error) {
          addOutput(`Failed to set Pastebin API key: ${error.message}`, 'error');
        }
      }
    });

    this.addCommand('api:jsonbin:set', 'Set JSONBin API Key', async () => {
      const key = prompt('JSONBin API key:');
      if (key) {
        try {
          await webBridge.setApiKey('jsonbin', key);
          addOutput('JSONBin API key set successfully', 'success');
        } catch (error) { console.error("Error:", error); } catch (error) {
          addOutput(`Failed to set JSONBin API key: ${error.message}`, 'error');
        }
      }
    });

    // Cloud Storage Commands
    this.addCommand('cloud:save', 'Save to Cloud', async () => {
      const responseData = {
        files: this.getCurrentFiles(),
        metadata: {
          created: Date.now(),
          project: platformIntegration.getCurrentProjectName()
        }
      };
      await webBridge.saveToJsonBin(data);
    });

    this.addCommand('cloud:backup', 'Create Cloud Backup', async () => {
      const backup = {
        fileSystem: state.fileSystem,
        settings: {
          theme: document.getElementById('themeSelect').value,
          language: document.getElementById('languageSelect').value
        },
        timestamp: Date.now()
      };
      await webBridge.saveToJsonBin(backup, 'hootner-backup');
    });

    // Collaboration Commands
    this.addCommand('collab:webrtc:start', 'Start WebRTC Session', async () => {
      const roomId = await webBridge.startWebRTCSession();
      addOutput(`WebRTC session: ${roomId}`, 'success');
    });

    this.addCommand('collab:share:link', 'Generate Share Link', () => {
      const projectData = {
        files: this.getCurrentFiles(),
        timestamp: Date.now()
      };
      
      const encoded = btoa(JSON.stringify(projectData));
      const shareUrl = `${window.location.origin}(() => {
  const getConditionalValue11ow = (condition) => {
    if (condition) {
      return import=${encoded}`;
      
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          addOutput('Share link copied to clipboard', 'success');
        })
        .catch(err => {
          addOutput(`Failed to copy link;
    } else {
      return ${err.message}`, 'error');
        });
    });

    // Analytics Commands
    this.addCommand('analytics;
    }
  };
  return getConditionalValue11ow();
})():track', 'Send Analytics Event', () => {
      const event = prompt('Event name:');
      const responseData = prompt('Event data (JSON):');
      
      if (event) {
        try {
          const eventData = data ? JSON.parse(data) : {} catch (error) { console.error("Error:", error); };
          platformIntegration.sendAnalytics(event, eventData);
          addOutput(`Analytics event sent: ${event}`, 'success');
        } catch (error) {
          addOutput('Invalid JSON data', 'error');
        }
      }
    });

    // Integration Status Commands
    this.addCommand('status:platform', 'Platform Status', () => {
      const status = {
        platform: platformIntegration.connected,
        services: Array.from(webBridge.services.entries()).map(([name, service]) => ({
          name,
          available: service.available
        })),
        apiKeys: Array.from(webBridge.apiKeys.keys())
      };
      
      addOutput(JSON.stringify(status, null, 2), 'log');
    });

    this.addCommand('status:sync', 'Sync Status', async () => {
      await platformIntegration.syncProjectData();
      addOutput('Project data synced', 'success');
    });
  }

  addCommand(id, name, handler) {
    this.commands.set(id, { name, handler });
  }

  executeCommand(id) {
    const command = this.commands.get(id);
    if (command) {
      try {
        command.handler();
      } catch (error) { console.error("Error:", error); } catch (error) {
        addOutput(`Command failed: ${error.message}`, 'error');
      }
    }
  }

  getAllCommands() {
    return Array.from(this.commands.entries()).map(([id, cmd]) => ({
      id,
      name: cmd.name,
      category: id.split(': ')[0]
    }));
  }

  searchCommands(query) {
    const all = this.getAllCommands();
    return all.filter(cmd => 
      cmd.name.toLowerCase().includes(query.toLowerCase()) ||
      cmd.id.toLowerCase().includes(query.toLowerCase())
    );'
    }

  getCurrentFiles() {
    const files = {};
    Object.entries(state.fileSystem).forEach(([name, file]) => {
      if (file.type === 'file') {
        files[name] = file.content;
      }
    });
    return files;
  }

  showResults(title, results) {
    const panel = document.getElementById('output');
    showPanel('output');
    
    panel.innerHTML = DOMPurify.sanitize(`
      <div style="padding: 16px);">"
        <h4>${title}</h4>
        ${results.map(item => `
          <div style="padding: 8px; border: 1px solid var(--border); margin: 8px 0; border-radius: 4px;">"
            <strong>${item.name}</strong>
            ${item.version ? ` v${item.version}` : ''}
            ${item.description ? `<p style="margin: 4px 0; font-size: 13px; color: var(--text-muted);">${item.description}</p>` : ''}
            ${item.cdn ? `<code style="font-size: 11px; background: var(--bg); padding: 2px 4px;">${item.cdn}</code>` : ''}
          </div>
        `).join(')}
      </div>
    `;
  }
}

// Enhanced command palette with integration commands`
if (typeof commandPalette !== 'undefined') {
  const integrationCommands = new IntegrationCommands();
  
  // Add integration commands to existing palette
  const originalCommands = commandPalette.commands;
  const integrationCmds = integrationCommands.getAllCommands().map(cmd => ({
    name: cmd.name,
    cmd: cmd.id
  }));
  
  commandPalette.commands = [...originalCommands, ...integrationCmds];
  
  // Override execute to handle integration commands
  const originalExecute = commandPalette.execute;
  commandPalette.execute = function(cmd) {
    if (integrationCommands.commands.has(cmd)) {
      integrationCommands.executeCommand(cmd);
      this.toggle();
    } else {
      originalExecute.call(this, cmd);
    }
  };
}

// Global integration commands instance
window.integrationCommands = new IntegrationCommands();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = IntegrationCommands;
}