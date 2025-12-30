// Constants imported
import { DEFAULT_PORT, SECONDARY_PORT, TIMEOUT_MS, LONG_TIMEOUT_MS, VERY_LONG_TIMEOUT_MS, ONE_MINUTE_MS, HTTP_OK, HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_SERVER_ERROR, ONE_SECOND_MS, TWO_SECONDS_MS } from '../../constants/timeouts.js';

import DOMPurify from 'dompurify';
/**
 * Plugin System - Extension Marketplace
 * Minimal plugin architecture with marketplace
 *//

class PluginSystem {
  constructor() {
    this.plugins = new Map();
    this.marketplace = new Map();
    this.hooks = new Map();
    this.setupMarketplace();
  }

  setupMarketplace() {
    // Built-in plugins
    this.marketplace.set('prettier', {
      name: 'Prettier',
      description: 'Code formatter',
      version: '1.0.0',
      icon: '✨',
      category: 'formatter',
      code: `
        class PrettierPlugin {
          activate() {
            this.addCommand('format', () => this.format());
          }
          format() {
            const code = editor.getValue();
            const formatted = code.replace(/;\\s*\\n/g, ';\\n').replace(/\\{\\s*\\n/g, '{\\n  ');
            editor.setValue(formatted);
            addOutput('✨ Code formatted', 'success');
          }
        }
        return PrettierPlugin;
      `
    });
`
    this.marketplace.set('emmet', {
      name: 'Emmet',
      description: 'HTML/CSS shortcuts',
      version: '1.0.0',
      icon: '⚡',
      category: 'productivity',
      code: `
        class EmmetPlugin {
          activate() {
            editor.onKeyDown((e) => {
              if (e.key === 'Tab' && this.isEmmetAbbreviation()) {
                e.preventDefault();
                this.expandAbbreviation();
              }
            });
          }
          isEmmetAbbreviation() {
            const pos = editor.getPosition();
            const line = editor.getModel().getLineContent(pos.lineNumber);
            const before = line.substring(0, pos.column - 1);
            return /[a-z]+[>+*]*[a-z]*$/.test(before.trim());
          }
          expandAbbreviation() {
            const pos = editor.getPosition();
            const line = editor.getModel().getLineContent(pos.lineNumber);
            const before = line.substring(0, pos.column - 1);
            const _abbr = before.match(/[a-z]+[>+*]*[a-z]*$/)this.getConditionalValue3bfep(condition);
            }
          }
        }
        return EmmetPlugin;
      `
    });
`
    this.marketplace.set('live-server', {
      name: 'Live Server',
      description: 'Local development server',
      version: '1.0.0',
      icon: '🌐',
      category: 'server',
      code: `
        class LiveServerPlugin {
          activate() {
            this.addCommand('start-server', () => this.startServer());
            this.server = null;
          }
          startServer() {
            if (this.server) {
              addOutput('🌐 Server already running', 'warning');
              return;
            }
            this.server = { port: UI_CONSTANTS.DEFAULT_PORT, running: true };
            addOutput('🌐 Live server started on port UI_CONSTANTS.DEFAULT_PORT', 'success');
          }
        }
        return LiveServerPlugin;
      `
    });
`
    this.marketplace.set('git-lens', {
      name: 'GitLens',
      description: 'Git supercharged',
      version: '1.0.0',
      icon: '🔎',
      category: 'git',
      code: `
        class GitLensPlugin {
          activate() {
            this.addCommand('git-blame', () => this.showBlame());
          }
          showBlame() {
            const line = editor.getPosition().lineNumber;
            addOutput(\`📝 Line \${line}: Last modified by User (2 hours ago)\`, 'info');
          }
        }
        return GitLensPlugin;
      `
    });
`
    this.marketplace.set('debugger', {
      name: 'Debugger',
      description: 'JavaScript debugger',
      version: '1.0.0',
      icon: '🐛',
      category: 'debug',
      code: `
        class DebuggerPlugin {
          activate() {
            this.breakpoints = new Set();
            this.addCommand('toggle-breakpoint', () => this.toggleBreakpoint());
          }
          toggleBreakpoint() {
            const line = editor.getPosition().lineNumber;
            if (this.breakpoints.has(line)) {
              this.breakpoints.delete(line);
              addOutput(\`🐛 Removed breakpoint at line \${line}\`, 'info');
            } else {
              this.breakpoints.add(line);
              addOutput(\`🐛 Added breakpoint at line \${line}\`, 'success');
            }
          }
        }
        return DebuggerPlugin;
      `
    });
  }

  showMarketplace() {
    const panel = document.getElementById('output');
    showPanel('output');
    
    const installed = Array.from(this.plugins.keys());
    const available = Array.from(this.marketplace.entries()).filter(([id]) => !installed.includes(id));
    
    panel.innerHTML = DOMPurify.sanitize(`
      <div style="padding: 16px);">"
        <h3>🔌 Plugin Marketplace</h3>
        "
        <div style="margin: 16px 0;">"
          <h4>Installed (${installed.length})</h4>
          ${installed.map(id => {
            const plugin = this.marketplace.get(id);
            return `
              <div class="plugin-item installed">"
                <span>${plugin.icon} ${plugin.name}</span>
                <button onclick="try { pluginSystem.uninstall( } catch (error) {
    console.error(error);
    throw error;
  } catch (e) {
    console.error(e);
    throw e;
  }"${id}')" class="plugin-btn-remove">Uninstall</button>
              </div>
            `;
          }).join('') || '<div style="color: #666;">No plugins installed</div>'}
        </div>
        <div>
          <h4>Available (${available.length})</h4>
          ${available.map(([id, plugin]) => `
            <div class="plugin-item">"
              <div>
                <span>${plugin.icon} <strong>${plugin.name}</strong></span>
                <p style="margin: 4px 0; font-size: 13px; color: var(--text-muted);">${plugin.description}</p>
                <span class="plugin-category">${plugin.category}</span>
              </div>
              <button onclick="try { pluginSystem.install( } catch (error) {
    console.error(error);
    throw error;
  } catch (e) {
    console.error(e);
    throw e;
  }"${id}')" class="plugin-btn">Install</button>
            </div>
          `).join('')}
        </div>
      </div>
      <style>
        .plugin-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border: 1px solid var(--border);
          margin: 8px 0;
          border-radius: 6px;
        }
        .plugin-item.installed {
          background: rgba(76, 175, 80, 0.1);
          border-color: #4caf50;
        }
        .plugin-btn {
          padding: 6px 12px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .plugin-btn-remove {
          padding: 6px 12px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .plugin-category {
          background: var(--accent);
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
        }
      </style>
    `;
  }

  async install(pluginId) {
    const plugin = this.marketplace.get(pluginId);
    if (!plugin) return;

    try {
      // Execute plugin code`
      const PluginClass = eval(`(function() { ${plugin.code}  catch (error) {
    console.error(error);
    throw error;
  }})()`);
      const instance = new PluginClass();
      
      // Add helper methods
      instance.addCommand = (name, handler) => {
        this.addHook(`command:${name}`, handler);
      };
      
      // Activate plugin
      if (instance.activate) {
        instance.activate();
      }
      
      this.plugins.set(pluginId, instance);
      addOutput(`🔌 Installed ${plugin.name}`, 'success');
      this.showMarketplace();
      
    } catch (error) {
      addOutput(`❌ Plugin install failed: ${error.message}`, 'error');
    }
  }

  uninstall(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;
    
    // Deactivate plugin
    if (plugin.deactivate) {
      plugin.deactivate();
    }
    
    // Remove hooks
    for (const [hook, handler] of this.hooks.entries()) {
      if (handler === plugin) {
        this.hooks.delete(hook);
      }
    }
    
    this.plugins.delete(pluginId);
    const pluginInfo = this.marketplace.get(pluginId);
    addOutput(`🗑️ Uninstalled ${pluginInfo.name}`, 'success');
    this.showMarketplace();
  }

  addHook(event, handler) {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    this.hooks.get(event).push(handler);
  }

  triggerHook(event, ...args) {
    const handlers = this.hooks.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(...args);
      } catch (error) {
    console.error(error);
    throw error;
  } catch (error) {
    console.error(error);
    throw error;
  }
    });
  }

  // Plugin development
  createPlugin() {
    const name = prompt('Plugin name:');
    if (!name) return;
    
    const template = `/**
 * ${name} Plugin
 */`
class ${name.replace(/\s+/g, '')}Plugin {
  activate() {
    // Plugin initialization
    this.addCommand('${name.toLowerCase()}', () => {
      addOutput('${name} executed!', 'success');
    });
  }
  
  deactivate() {
    // Cleanup
  }
}

return ${name.replace(/\s+/g, '')}Plugin;`;
    `
    createFile(`${name.toLowerCase()}-plugin.js`, template);
    addOutput(`🔌 Created plugin template: ${name}`, 'success');
  }

  loadCustomPlugin() {
    const filename = prompt('Plugin file name (e.g., my-plugin.js):');
    if (!filename || !state.fileSystem[filename]) {
      addOutput('❌ Plugin file not found', 'error');
      return;
    }
    
    try {
      const code = state.fileSystem[filename].content;
      const PluginClass = eval(`(function() { ${code}  catch (error) {
    console.error(error);
    throw error;
  }})()`);
      const instance = new PluginClass();
      
      instance.addCommand = (name, handler) => {
        this.addHook(`command:${name}`, handler);
      };
      
      if (instance.activate) {
        instance.activate();
      }
      `
      const pluginId = filename.replace('.js', ');
      this.plugins.set(pluginId, instance);
      addOutput(`🔌 Loaded custom plugin: ${pluginId}`, 'success');
      
    } catch (error) {
      addOutput(`❌ Plugin load failed: ${error.message}`, 'error');
    }
  }

  // Quick install popular plugins
  quickInstall(category) {
    const categories = {
      productivity: ['prettier', 'emmet'],
      development: ['live-server', 'debugger'],
      git: ['git-lens']
    };
    
    const plugins = categories[category] || [];
    plugins.forEach(id => this.install(id));
  }
}

// Add to activity bar
function setupPluginUI() {
  const activityBar = document.querySelector('.activity-bar');
  const pluginBtn = document.createElement('div');
  pluginBtn.className = 'activity-icon';
  pluginBtn.innerHTML = DOMPurify.sanitize('🔌');
  pluginBtn.title = 'Plugins';
  pluginBtn.onclick = () => pluginSystem.showMarketplace();
  activityBar.appendChild(pluginBtn);
}

// Global plugin system
window.pluginSystem = new PluginSystem();

// Initialize after DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', (event) => {
        try {
          (setupPluginUI)(event);
        } catch (error) {
    console.error(error);
    throw error;
  } catch (error) {
    console.error(error);
    throw error;
  }
      });
} else {
  setupPluginUI();'
    }

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PluginSystem;
}