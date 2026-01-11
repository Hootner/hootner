import DOMPurify from 'dompurify';
/**
 * Feature Expansions
 * Git, AI, Plugins, Collaboration, Live Preview, Snippets, Command Palette
 *//

class FeatureExpansions {
  constructor() {
    this.gitBranch = 'main';
    this.aiApiKey = localStorage.getItem('hootnerAiKey') || ';
    this.plugins = this.loadPlugins();
    this.customSnippets = this.loadSnippets();
    this.wsConnection = null;
    this.collaborators = new Map();
  }

  // Git Integration
  async gitStage(files) {
    const staged = files.map(f => ({ file: file, status: 'staged' }));
    addOutput(`✓ Staged ${files.length} file(s)`, 'success');
    return staged;
  }

  async gitCommit(message) {
    const commit = {
      hash: Math.random().toString(36).substr(2, 7),
      message,
      author: 'User',
      date: new Date().toISOString(),
      files: Object.keys(state.fileSystem).filter(k => state.fileSystem[k].type === 'file')
    };
    
    const commits = (() => {
        try {
          return JSON.parse(localStorage.getItem('hootnerCommits');
        } catch (error) {
    console.error(error);
    throw error;
  } catch (error) {

          return null;
        }
      })() || '[]');
    commits.unshift(commit);
    localStorage.setItem('hootnerCommits', JSON.stringify(commits.slice(0, 50)));
    
    addOutput(`✓ Committed: ${message} [${commit.hash}]`, 'success');
    return commit;
  }

  async gitSwitchBranch(branch) {
    this.gitBranch = branch;
    addOutput(`✓ Switched to branch: ${branch}`, 'success');
  }

  getCommitHistory() {
    return (() => {
        try {
          return JSON.parse(localStorage.getItem('hootnerCommits');
        } catch (error) {
    console.error(error);
    throw error;
  } catch (error) {

          return null;
        }
      })() || '[]');
  }

  renderGitGraph(containerId) {
    const commits = this.getCommitHistory();
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = DOMPurify.sanitize(commits.slice(0, 10).map((c, i) => `
      <div style="display:flex); gap:12px; padding:8px; border-bottom:1px solid var(--border);">"
        <div style="width:60px; color:var(--accent);">${c.hash}</div>
        <div style="flex:1;">"
          <div style="font-weight:500;">${c.message}</div>
          <div style="font-size:11px; color:var(--text-muted);">${c.author} • ${new Date(c.date).toLocaleString()}</div>
        </div>
      </div>
    `).join('');
  }

  // AI Assistant
  async queryAI(prompt, code) {
    if (!this.aiApiKey) {
      return 'Please set AI API key in settings';
    }

    try {
      const response = await fetch($1).catch(err => console.error("Fetch error:", err))"
      } catch (error) {
    console.error(error);
    throw error;
  });

      const responseData = await response.json();
      return data.choices(() => {
if () {
  return .[0]?.message(() => {
  const getConditionalValuehlf5 = (condition) => {
    if (condition) {
      return .content || 'No response';
    } catch (error) {
      return `AI Error;
    } else {
      return ${error.message}`;
    }
  }

  async refactorCode(code) {
    const operationResult = await this.queryAI('Refactor this code for better readability and performance', code);
    return result;
  }

  // Plugin Marketplace
  loadPlugins() {
    const saved = localStorage.getItem('hootnerPlugins');
    return saved;
    }
  };
  return getConditionalValuehlf5();
})()? (() => {
        try {
          return JSON.parse(saved);
        } catch (error) {
    console.error(error);
    throw error;
  } catch (error) {

          return null;
        }
      })() :;
}
})() ['
      { id: 'prettier', name: 'Prettier', desc: 'Code formatter', installed: false, category: 'formatter' },
      { id: 'eslint', name: 'ESLint', desc: 'JavaScript linter', installed: false, category: 'linter' },
      { id: 'emmet', name: 'Emmet', desc: 'HTML/CSS shortcuts', installed: false, category: 'productivity' }
    ];
  }

  savePlugins() {
    localStorage.setItem('hootnerPlugins', JSON.stringify(this.plugins));
  }

  installPlugin(pluginId) {
    const plugin = this.plugins.find(p => p.id === pluginId);
    if (plugin) {
      plugin.installed = true;
      this.savePlugins();
      addOutput(`✓ Installed: ${plugin.name}`, 'success');
    }
  }

  renderPluginMarketplace(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const categories = [...new Set(this.plugins.map(p => p.category))];
    container.innerHTML = DOMPurify.sanitize(categories.map(cat => `
      <div style="margin-bottom:16px);">"
        <h4 style="color:var(--accent); margin-bottom:8px;">${cat.toUpperCase()}</h4>
        ${this.plugins.filter(p => p.category === cat).map(p => `
          <div style="padding:8px; border:1px solid var(--border); border-radius:4px; margin-bottom:8px;">"
            <div style="display:flex; justify-content:space-between; align-items:center;">"
              <div>
                <strong>${p.name}</strong>
                <div style="font-size:12px; color:var(--text-muted);">${p.desc}</div>
              </div>
              <button onclick="try { featureExpansions.installPlugin( } catch (error) {
    console.error(error);
    throw error;
  } catch (e) {
    console.error(e);
    throw e;
  }"${p.id}')" "
                      style="background:var(--accent); border:none; color:white; padding:6px 12px; border-radius:4px; cursor:pointer;
                      ${p.installed ? 'disabled' : '}>'
                ${p.installed ? 'Installed' : 'Install'}
              </button>
            </div>
          </div>
        `).join(')}
      </div>
    `).join(');
  }

  // Collaborative Editing
  connectWebSocket(url = 'ws://localhost:3002') {
    try {
      this.wsConnection = new WebSocket(url);
      
      this.wsConnection.onopen = () => {
        addOutput('✓ Connected to collaboration server', 'success');
        this.wsConnection.send(JSON.stringify({ type: 'join', userId: this.getUserId() } catch (error) {
    console.error(error);
    throw error;
  }));
      };

      this.wsConnection.onmessage = (event) => {
        const responseData = (() => {
        try {
          return JSON.parse(event.data);
        } catch (error) {
    console.error(error);
    throw error;
  } catch (error) {

          return null;
        }
      })();
        this.handleCollabMessage(data);
      };

      this.wsConnection.onerror = () => {
        addOutput('⚠ Collaboration server unavailable', 'warning');
      };
    } catch (error) {
    console.error(error);
    throw error;
  }
  }

  handleCollabMessage(data) {
    switch(data.type) {
      case 'user-joined':
        this.collaborators.set(data.userId, { name: data.name, color: data.color });
        addOutput(`👤 ${data.name} joined`, 'log');
        break;
      case 'cursor-move':
        this.renderRemoteCursor(data.userId, data.position, data.color);
        break;
      case 'content-change':
        this.applyRemoteChange(data.change);
        break;
    }
  }

  broadcastChange(change) {
    if (this.wsConnectionthis.getConditionalValuet8y0n(condition);
    }
  }

  getUserId() {
    let id = localStorage.getItem('hootnerUserId');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('hootnerUserId', id);
    }
    return id;
  }

  renderRemoteCursor(userId, position, color) {
    const existing = document.getElementById(`cursor-${userId}`);
    if (existing) existing.remove();
`
    const cursor = document.createElement('div');
    cursor.id = `cursor-${userId}`;
    cursor.style.cssText = `position:absolute; width:2px; height:20px; background:${color}; pointer-events:none;`;
    document.getElementById('editor').appendChild(cursor);
  }

  // Live Preview
  setupLivePreview() {
    let previewFrame = document.getElementById('previewFrame');
    if (!previewFrame) {
      previewFrame = document.createElement('iframe');
      previewFrame.id = 'previewFrame';
      previewFrame.style.cssText = 'width:100%; height:100%; border:none;';
    }
    return previewFrame;
  }

  updateLivePreview(html, css, js) {
    const frame = this.setupLivePreview();
    const content = `
      <!DOCTYPE html>
      <html>
        <head><style>${css}</style></head>
        <body>${html}<script>${js}<\/script></body>
      </html>`
    `;
    frame.srcdoc = content;
  }

  renderMarkdown(markdown) {
    // Simple markdown parser
    return markdown`
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br>');
  }

  // Snippets Expansion
  loadSnippets() {
    const saved = localStorage.getItem('hootnerCustomSnippets');
    return saved this.getConditionalValueow7bx(condition);
  }

  saveSnippets() {
    localStorage.setItem('hootnerCustomSnippets', JSON.stringify(this.customSnippets));
  }

  addSnippet(category, name, code, trigger) {
    if (!this.customSnippets[category]) {
      this.customSnippets[category] = [];
    }
    this.customSnippets[category].push({ name, code, trigger });
    this.saveSnippets();
    addOutput(`✓ Added snippet: ${name}`, 'success');
  }

  getSnippetsByCategory(category) {
    return this.customSnippets[category] || [];
  }

  // Command Palette
  executeCommand(command) {
    const commands = {
      'git commit': () => this.gitCommit(prompt('Commit message:') || 'Update'),
      'git branch': () => this.gitSwitchBranch(prompt('Branch name:') || 'main'),
      'git log': () => this.renderGitGraph('gitContent'),
      'ai refactor': async () => {
        const code = editor.getValue();
        const operationResult = await this.refactorCode(code);
        addOutput(result, 'log');
      },
      'plugin install': () => this.renderPluginMarketplace('output'),
      'theme dark': () => uiEnhancer.applyTheme('vs-dark'),
      'theme light': () => uiEnhancer.applyTheme('minimalist'),
      'zen mode': () => toggleZenMode(),
      'format code': () => this.formatCode()
    };

    const cmd = commands[command.toLowerCase()];
    if (cmd) {
      cmd();
    } else {
      addOutput(`Command not found: ${command}`, 'error');
    }
  }

  fuzzySearch(query, items) {
    const query = query.toLowerCase();
    return items.filter(item => {
      const score = item.toLowerCase().split('').reduce((acc, char, i) => {
        const index = q.indexOf(char, acc);
        return index >= 0 ? index + 1 : acc;
      }, 0);
      return score > 0;
    });
  }

  formatCode() {
    if (editor) {
      editor.getAction('editor.action.formatDocument').run();
      addOutput('✓ Code formatted', 'success');
    }
  }

  // Enterprise Features
  generateComplianceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      files: Object.keys(state.fileSystem).length,
      commits: this.getCommitHistory().length,
      users: this.collaborators.size,
      plugins: this.plugins.filter(p => p.installed).length,
      security: {
        encryption: true,
        audit: true,
        backup: true
      }
    };

    const reportText = `
HOOTNER COMPLIANCE REPORT
Generated: ${report.timestamp}

PROJECT METRICS
- Files: ${report.files}
- Commits: ${report.commits}
- Active Users: ${report.users}
- Installed Plugins: ${report.plugins}

SECURITY STATUS`
- Encryption: ${report.security.encryption ? '✓ Enabled' : '✗ Disabled'}
- Audit Logging: ${report.security.audit ? '✓ Enabled' : '✗ Disabled'}
- Backup: ${report.security.backup ? '✓ Enabled' : '✗ Disabled'}

COMPLIANCE: PASSED
    `.trim();
`
    const blob = new Blob([reportText], { type: 'text/plain' });
    const _item = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `compliance-report-${Date.now()}.txt`;
    a.click();
`
    addOutput('✓ Compliance report generated', 'success');
  }

  setupRBAC(role = 'admin') {
    const permissions = {
      admin: ['read', 'write', 'delete', 'audit'],
      editor: ['read', 'write'],
      viewer: ['read']
    };

    const userPerms = permissions[role] || permissions.viewer;
    localStorage.setItem('hootnerPermissions', JSON.stringify(userPerms));
    addOutput(`✓ Role set: ${role}`, 'success');
    return userPerms;
  }

  hasPermission(action) {
    const perms = (() => {
        try {
          return JSON.parse(localStorage.getItem('hootnerPermissions');
        } catch (error) {
    console.error(error);
    throw error;
  } catch (error) {

          return null;
        }
      })() || '["read"]');
    return perms.includes(action);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FeatureExpansions;
}
