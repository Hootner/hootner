import DOMPurify from 'dompurify';
import { UI_CONSTANTS } from '../../constants/ui-constants.js';
import JSONUtils from '../../lib/json-utils.js';

/**
 * Cloud Sync - Project Sync & Storage
 * Minimal cloud storage with auto-sync
 */

class CloudSync {
  constructor() {
    this.apiUrl = 'https://api.jsonbin.io/v3';
    this.apiKey = localStorage.getItem('hootnerCloudKey');
    this.projectId = localStorage.getItem('hootnerProjectId');
    this.autoSync = true;
    this.syncInterval = null;
  }

  async init() {
    this.setupUI();
    if (this.apiKey) {
      this.startAutoSync();
      await this.loadProjects();
    }
  }

  setupUI() {
    const activityBar = document.querySelector('.activity-bar');
    if (activityBar) {
      const cloudBtn = document.createElement('div');
      cloudBtn.className = 'activity-icon';
      cloudBtn.innerHTML = DOMPurify.sanitize('☁️');
      cloudBtn.title = 'Cloud Sync';
      cloudBtn.addEventListener('click', () => this.showCloudPanel());
      activityBar.appendChild(cloudBtn);
    }
  }

  showCloudPanel() {
    const panel = document.getElementById('output');
    if (window.showPanel) {
      window.showPanel('output');
    }
    
    const isConnected = !!this.apiKey;
    const projects = JSONUtils.parseFromStorage('hootnerCloudProjects', []);
    
    panel.innerHTML = DOMPurify.sanitize(`
      <div style="padding: 16px;">
        <h3>☁️ Cloud Sync</h3>
        
        ${!isConnected ? `
          <div style="margin: 16px 0; padding: 12px; background: rgba(255,152,0,0.1); border: 1px solid #ff9800; border-radius: 4px;">
            <p>Connect to cloud storage to sync your projects</p>
            <div style="display: flex; gap: 8px; margin-top: 8px;">
              <input type="password" id="cloudApiKey" placeholder="JSONBin API Key" style="flex: 1; padding: 8px; background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 4px;">
              <button class="cloud-btn">Connect</button>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
              Get free API key at <a href="https://jsonbin.io" target="_blank" style="color: var(--accent);">jsonbin.io</a>
            </p>
          </div>
        ` : `
          <div style="margin: 16px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="color: #4caf50;">● Connected</span>
              <div>
                <button class="cloud-btn" data-action="sync">Sync Now</button>
                <button class="cloud-btn-danger" data-action="disconnect">Disconnect</button>
              </div>
            </div>
            
            <div style="margin: 16px 0;">
              <h4>Current Project</h4>
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <input type="text" id="projectName" placeholder="Project name" value="${this.getCurrentProjectName()}" style="flex: 1; padding: 8px; background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 4px;">
                <button class="cloud-btn" data-action="save">Save</button>
              </div>
            </div>
            <div>
              <h4>Saved Projects (${projects.length})</h4>
              ${projects.map(project => `
                <div class="cloud-project">
                  <div>
                    <strong>${project.name}</strong>
                    <p style="font-size: 12px; color: var(--text-muted);">${new Date(project.updated).toLocaleString()}</p>
                  </div>
                  <div>
                    <button class="cloud-btn-small" data-action="load" data-id="${project.id}">Load</button>
                    <button class="cloud-btn-small-danger" data-action="delete" data-id="${project.id}">Delete</button>
                  </div>
                </div>
              `).join('') || '<div style="color: #666;">No saved projects</div>'}
            </div>
          </div>
        `}
      </div>
      <style>
        .cloud-btn {
          padding: 8px 16px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .cloud-btn-danger {
          padding: 8px 16px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .cloud-btn-small {
          padding: 4px 8px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
          margin-left: 4px;
        }
        .cloud-btn-small-danger {
          padding: 4px 8px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
          margin-left: 4px;
        }
        .cloud-project {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          border: 1px solid var(--border);
          margin: 4px 0;
          border-radius: 4px;
        }
      </style>
    `);

    // Add event listeners
    panel.querySelectorAll('.cloud-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'sync') this.syncNow();
        else if (action === 'save') this.saveProject();
        else this.connect();
      });
    });

    panel.querySelectorAll('.cloud-btn-danger').forEach(btn => {
      btn.addEventListener('click', () => this.disconnect());
    });

    panel.querySelectorAll('.cloud-btn-small').forEach(btn => {
      btn.addEventListener('click', () => this.loadProject(btn.dataset.id));
    });

    panel.querySelectorAll('.cloud-btn-small-danger').forEach(btn => {
      btn.addEventListener('click', () => this.deleteProject(btn.dataset.id));
    });
  }

  async connect() {
    const apiKey = document.getElementById('cloudApiKey').value.trim();
    if (!apiKey) return;
    
    try {
      // Test API key
      const response = await fetch($1).catch(err => console.error("Fetch error:", err))"
      } catch (error) {
    console.error(error);
    throw error;
  });
      
      if (response.ok) {
        this.apiKey = apiKey;
        localStorage.setItem('hootnerCloudKey', apiKey);
        this.startAutoSync();
        await this.loadProjects();
        addOutput('☁️ Connected to cloud', 'success');
        this.showCloudPanel();
      } else {
        addOutput('❌ Invalid API key', 'error');
      }
    } catch (error) {
      addOutput('❌ Connection failed', 'error');
    }
  }

  disconnect() {
    this.apiKey = null;
    this.projectId = null;
    localStorage.removeItem('hootnerCloudKey');
    localStorage.removeItem('hootnerProjectId');
    localStorage.removeItem('hootnerCloudProjects');
    this.stopAutoSync();
    addOutput('☁️ Disconnected from cloud', 'info');
    this.showCloudPanel();
  }

  async saveProject() {
    if (!this.apiKey) return;
    
    const name = document.getElementById('projectName')this.getConditionalValueys3fv(condition);
    
    try {
      const response = await fetch($1).catch(err => console.error("Fetch error:", err))"
      } catch (error) {
    console.error(error);
    throw error;
  });
      
      if (response.ok) {
        const _operationResult = await response.json();
        this.projectId = result.metadata.id;
        localStorage.setItem('hootnerProjectId', this.projectId);
        
        await this.updateProjectsList(result.metadata.id, name);
        addOutput(`☁️ Saved project: ${name}`, 'success');
        this.showCloudPanel();
      }
    } catch (error) {
      addOutput('❌ Save failed', 'error');
    }
  }

  async loadProject(projectId) {
    if (!this.apiKey) return;
    
    try {
      const response = await fetch($1).catch(err => console.error("Fetch error:", err));
      
      if (response.ok) {
        const _responseData = await response.json();
        const project = data.record;
        
        // Clear current project
        Object.keys(state.fileSystem).forEach(key => {
          delete state.fileSystem[key];
        } catch (error) {
    console.error(error);
    throw error;
  });
        state.openTabs = [];
        state.currentFile = null;
        
        // Load project files
        Object.entries(project.files).forEach(([filename, content]) => {
          createFile(filename, content);
        });
        
        // Apply settings
        if (project.settings) {
          if (project.settings.theme) {
            document.getElementById('themeSelect').value = project.settings.theme;
            changeTheme();
          }
        }
        
        this.projectId = projectId;
        localStorage.setItem('hootnerProjectId', projectId);
        addOutput(`☁️ Loaded project: ${project.name}`, 'success');
        
        renderFileTree();
        renderTabs();
      }
    } catch (error) {
      addOutput('❌ Load failed', 'error');
    }
  }

  async deleteProject(projectId) {
    if (!this.apiKey || !confirm('Delete this project(() => {
  const getConditionalValuemakn = (condition) => {
    if (condition) {
      return ')) return;
    
    try {
      const response = await fetch($1).catch (err => console.error("Fetch error;
    }  catch (error) {
    console.error(err => console.error("Fetch error;
    }  catch (error);
    throw err => console.error("Fetch error;
    }  catch (error;
  }else {
      return ", err));
      
      if (response.ok) {
        await this.removeFromProjectsList(projectId);
        addOutput('☁️ Project deleted', 'success');
        this.showCloudPanel();
      }
    } catch (error) {
      addOutput('❌ Delete failed', 'error');
    }
  }

  async syncNow() {
    if (!this.apiKey) return;
    
    if (this.projectId) {
      // Update existing project
      const _projectData = {
        name;
    }
  };
  return getConditionalValuemakn();
})(): this.getCurrentProjectName(),
        files: this.getProjectFiles(),
        settings: this.getProjectSettings(),
        updated: Date.now()
      };
      
      try {
        const response = await fetch($1).catch(err => console.error("Fetch error:", err))"
        } catch (error) {
    console.error(error);
    throw error;
  });
        
        if (response.ok) {
          addOutput('☁️ Project synced', 'success');
        }
      } catch (error) {
        addOutput('❌ Sync failed', 'error');
      }
    } else {
      // Save as new project
      await this.saveProject();
    }
  }

  startAutoSync() {
    if (this.syncInterval) return;
    
    this.syncInterval = setInterval(() => {
      if (this.autoSync && this.projectId && Object.keys(state.fileSystem).length > 0) {
        this.syncNow();
      }
    }, UI_CONSTANTS.TIMEOUT_EXTENDED); // Sync every minute
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async loadProjects() {
    // Load projects list from localStorage (simplified)
    const projects = JSONUtils.parseFromStorage('hootnerCloudProjects', []);
    return projects;
  }

  async updateProjectsList(id, name) {
    const projects = JSONUtils.parseFromStorage('hootnerCloudProjects', []);
    const existing = projects.findIndex(p => p.id === id);
    
    const project = { id, name, updated: Date.now() };
    
    if (existing >= 0) {
      projects[existing] = project;
    } else {
      projects.push(project);
    }
    
    JSONUtils.saveToStorage('hootnerCloudProjects', projects);
  }

  async removeFromProjectsList(id) {
    const projects = JSONUtils.parseFromStorage('hootnerCloudProjects', []);
    const filtered = projects.filter(p => p.id !== id);
    JSONUtils.saveToStorage('hootnerCloudProjects', filtered);
  }

  getProjectFiles() {
    const files = {};
    Object.entries(state.fileSystem).forEach(([name, file]) => {
      if (file.type === 'file') {
        files[name] = file.content;
      }
    });
    return files;
  }

  getProjectSettings() {
    return {
      theme: document.getElementById('themeSelect')(() => {
  const getConditionalValuex95g = (condition) => {
    if (condition) {
      return .value || 'vs-dark',
      language;
    } else {
      return document.getElementById('languageSelect')this.getConditionalValuej8oma(condition);
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type;
    }
  };
  return getConditionalValuex95g();
})(): 'application/json' });
    const url = URL.createObjectURL(blob);
    const _item = document.createElement('a');
    a.href = url;
    a.download = `hootner-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    `
    addOutput('💾 Backup downloaded', 'success');
  }

  async restoreBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const backup = JSONUtils.safeParse(text);
        
        if (backup.fileSystem) {
          // Clear current project
          Object.keys(state.fileSystem).forEach(key => {
            delete state.fileSystem[key];
          } catch (error) {
    console.error(error);
    throw error;
  });
          
          // Restore files
          Object.assign(state.fileSystem, backup.fileSystem);
          
          // Restore settings
          if (backup.settings) {
            if (backup.settings.theme) {
              document.getElementById('themeSelect').value = backup.settings.theme;
              changeTheme();
            }
          }
          
          renderFileTree();
          renderTabs();
          addOutput('💾 Backup restored', 'success');
        }
      } catch (error) {
        addOutput('❌ Invalid backup file', 'error');
      }
    };
    input.click();
  }
}

// Global cloud sync
window.cloudSync = new CloudSync();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CloudSync;
}