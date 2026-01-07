/* global showPanel, addOutput, createFile, state, editor, monaco, DOMPurify */

class PluginSystem { 
  constructor() { 
    this.plugins = new Map();
    this.marketplace = new Map();
    this.hooks = new Map();
    this.setupMarketplace(); 
  }

  setupMarketplace() { 
    this.marketplace.set('prettier', { 
      name: 'Prettier', description: 'Code formatter', version: '1.0.0', icon: '✨', category: 'formatter',
      code: `class PrettierPlugin { activate() { this.addCommand('format', () => this.format()); } format() { const code = editor.getValue(); const formatted = code.replace(/;\\s*\\n/g, ';\\n'); editor.setValue(formatted); addOutput('✨ Code formatted', 'success'); } } return PrettierPlugin;`
    });
  }

  showMarketplace() { 
    try {
      const panel = document.getElementById('output');
      if (!panel) return;
      if (typeof showPanel === 'function') showPanel('output');
      const installed = Array.from(this.plugins.keys());
      const available = Array.from(this.marketplace.entries()).filter(([id]) => !installed.includes(id));
      panel.innerHTML = `<div style="padding:16px"><h3>🔌 Plugin Marketplace</h3><div><h4>Installed (${installed.length})</h4>${installed.map(id => {
        const plugin = this.marketplace.get(id);
        return `<div class="plugin-item"><span>${plugin.icon} ${plugin.name}</span><button onclick="pluginSystem.uninstall('${id}')">Uninstall</button></div>`;
      }).join('') || '<div>No plugins installed</div>'}</div><div><h4>Available (${available.length})</h4>${available.map(([id, plugin]) => 
        `<div class="plugin-item"><div><span>${plugin.icon} <strong>${plugin.name}</strong></span><p>${plugin.description}</p></div><button onclick="pluginSystem.install('${id}')">Install</button></div>`
      ).join('')}</div></div>`;
    } catch (error) {
      console.error('Show marketplace failed:', error);
    }
  }

  async install(pluginId) { 
    try {
      const plugin = this.marketplace.get(pluginId);
      if (!plugin) return;
      const PluginClass = eval(`(function() { ${plugin.code} })()`);
      const instance = new PluginClass();
      instance.addCommand = (name, handler) => this.addHook(`command:${name}`, handler);
      if (instance.activate) instance.activate();
      this.plugins.set(pluginId, instance);
      if (typeof addOutput === 'function') addOutput(`🔌 Installed ${plugin.name}`, 'success');
      this.showMarketplace();
    } catch (error) {
      console.error('Install failed:', error);
      if (typeof addOutput === 'function') addOutput(`❌ Plugin install failed`, 'error');
    }
  }

  uninstall(pluginId) { 
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) return;
      if (plugin.deactivate) plugin.deactivate();
      this.plugins.delete(pluginId);
      const pluginInfo = this.marketplace.get(pluginId);
      if (typeof addOutput === 'function') addOutput(`🗑️ Uninstalled ${pluginInfo.name}`, 'success');
      this.showMarketplace();
    } catch (error) {
      console.error('Uninstall failed:', error);
    }
  }

  addHook(event, handler) { 
    if (!this.hooks.has(event)) this.hooks.set(event, []);
    this.hooks.get(event).push(handler);
  }

  triggerHook(event, ...args) { 
    try {
      const handlers = this.hooks.get(event) || [];
      handlers.forEach(handler => {
        try { handler(...args); } catch (error) { console.error('Hook error:', error); }
      });
    } catch (error) {
      console.error('Trigger hook failed:', error);
    }
  }
}

window.pluginSystem = new PluginSystem();

if (typeof module !== 'undefined' && module.exports) { module.exports = PluginSystem; }
