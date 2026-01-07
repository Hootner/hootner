/* cSpell:ignore hootner jsonbin */
/* global renderTabs, renderFileTree, changeTheme, createFile, state, addOutput, showPanel */
import DOMPurify from 'dompurify';
import { UI_CONSTANTS } from '../../constants/ui-constants.js';
import JSONUtils from '../../lib/json-utils.js';

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
    try {
      const activityBar = document.querySelector('.activity-bar');
      if (!activityBar) return;
      const cloudBtn = document.createElement('div');
      cloudBtn.className = 'activity-icon';
      cloudBtn.innerHTML = DOMPurify.sanitize('☁️');
      cloudBtn.title = 'Cloud Sync';
      cloudBtn.onclick = () => this.showCloudPanel();
      activityBar.appendChild(cloudBtn);
    } catch (error) {
      console.error('Setup UI failed:', error);
    }
  }

  showCloudPanel() { 
    try {
      const panel = document.getElementById('output');
      if (!panel) return;
      if (typeof showPanel === 'function') showPanel('output');
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
                <button onclick="cloudSync.connect()" class="cloud-btn">Connect</button>
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
                  <button onclick="cloudSync.syncNow()" class="cloud-btn">Sync Now</button>
                  <button onclick="cloudSync.disconnect()" class="cloud-btn-danger">Disconnect</button>
                </div>
              </div>
              <div style="margin: 16px 0;">
                <h4>Current Project</h4>
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                  <input type="text" id="projectName" placeholder="Project name" value="${this.getCurrentProjectName()}" style="flex: 1; padding: 8px; background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 4px;">
                  <button onclick="cloudSync.saveProject()" class="cloud-btn">Save</button>
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
                      <button onclick="cloudSync.loadProject('${project.id}')" class="cloud-btn-small">Load</button>
                      <button onclick="cloudSync.deleteProject('${project.id}')" class="cloud-btn-small-danger">Delete</button>
                    </div>
                  </div>
                `).join('') || '<div style="color: #666;">No saved projects</div>'}
              </div>
            </div>
          `}
        </div>
        <style>
          .cloud-btn { padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer; }
          .cloud-btn-danger { padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; }
          .cloud-btn-small { padding: 4px 8px; background: var(--accent); color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px; margin-left: 4px; }
          .cloud-btn-small-danger { padding: 4px 8px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px; margin-left: 4px; }
          .cloud-project { display: flex; justify-content: space-between; align-items: center; padding: 8px; border: 1px solid var(--border); margin: 4px 0; border-radius: 4px; }
        </style>
      `);
    } catch (error) {
      console.error('Show cloud panel failed:', error);
    }
  }

  async connect() { 
    try {
      const apiKeyEl = document.getElementById('cloudApiKey');
      if (!apiKeyEl) return;
      const apiKey = apiKeyEl.value.trim();
      if (!apiKey) return;
      const response = await fetch(`${this.apiUrl}/b`, {
        headers: { 'X-Master-Key': apiKey }
      });
      if (response.ok) { 
        this.apiKey = apiKey;
        localStorage.setItem('hootnerCloudKey', apiKey);
        this.startAutoSync();
        await this.loadProjects();
        if (typeof addOutput === 'function') addOutput('☁️ Connected to cloud', 'success');
        this.showCloudPanel(); 
      } else { 
        if (typeof addOutput === 'function') addOutput('❌ Invalid API key', 'error'); 
      }
    } catch (error) { 
      console.error('Connect error:', error);
      if (typeof addOutput === 'function') addOutput('❌ Connection failed', 'error'); 
    }
  }

  disconnect() { 
    this.apiKey = null;
    this.projectId = null;
    localStorage.removeItem('hootnerCloudKey');
    localStorage.removeItem('hootnerProjectId');
    localStorage.removeItem('hootnerCloudProjects');
    this.stopAutoSync();
    if (typeof addOutput === 'function') addOutput('☁️ Disconnected from cloud', 'info');
    this.showCloudPanel(); 
  }

  async saveProject() { 
    if (!this.apiKey) return;
    try {
      const nameEl = document.getElementById('projectName');
      if (!nameEl) return;
      const name = nameEl.value.trim() || 'Untitled Project';
      const projectData = {
        name,
        files: this.getProjectFiles(),
        settings: this.getProjectSettings(),
        updated: Date.now()
      };
      const response = await fetch(`${this.apiUrl}/b`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': this.apiKey
        },
        body: JSON.stringify(projectData)
      });
      if (response.ok) { 
        const result = await response.json();
        this.projectId = result.metadata.id;
        localStorage.setItem('hootnerProjectId', this.projectId);
        await this.updateProjectsList(result.metadata.id, name);
        if (typeof addOutput === 'function') addOutput(`☁️ Saved project: ${name}`, 'success');
        this.showCloudPanel(); 
      }
    } catch (error) { 
      console.error('Save project error:', error);
      if (typeof addOutput === 'function') addOutput('❌ Save failed', 'error'); 
    }
  }

  async loadProject(projectId) { 
    if (!this.apiKey) return;
    try { 
      const response = await fetch(`${this.apiUrl}/b/${projectId}`, {
        headers: { 'X-Master-Key': this.apiKey }
      });
      if (response.ok) { 
        const data = await response.json();
        const project = data.record;
        if (typeof state !== 'undefined' && state.fileSystem) {
          Object.keys(state.fileSystem).forEach(key => { delete state.fileSystem[key]; });
          state.openTabs = [];
          state.currentFile = null;
        }
        Object.entries(project.files).forEach(([filename, content]) => { 
          if (typeof createFile === 'function') createFile(filename, content); 
        });
        if (project.settings && project.settings.theme) { 
          const themeEl = document.getElementById('themeSelect');
          if (themeEl) {
            themeEl.value = project.settings.theme;
            if (typeof changeTheme === 'function') changeTheme();
          }
        }
        this.projectId = projectId;
        localStorage.setItem('hootnerProjectId', projectId);
        if (typeof addOutput === 'function') addOutput(`☁️ Loaded project: ${project.name}`, 'success');
        if (typeof renderFileTree === 'function') renderFileTree();
        if (typeof renderTabs === 'function') renderTabs(); 
      } 
    } catch (error) { 
      console.error('Load project error:', error);
      if (typeof addOutput === 'function') addOutput('❌ Load failed', 'error'); 
    }
  }

  async deleteProject(projectId) { 
    if (!this.apiKey || !confirm('Delete this project?')) return;
    try { 
      const response = await fetch(`${this.apiUrl}/b/${projectId}`, {
        method: 'DELETE',
        headers: { 'X-Master-Key': this.apiKey }
      });
      if (response.ok) { 
        await this.removeFromProjectsList(projectId);
        if (typeof addOutput === 'function') addOutput('☁️ Project deleted', 'success');
        this.showCloudPanel(); 
      } 
    } catch (error) { 
      console.error('Delete project error:', error);
      if (typeof addOutput === 'function') addOutput('❌ Delete failed', 'error'); 
    }
  }

  async syncNow() { 
    if (!this.apiKey) return;
    try {
      if (this.projectId) { 
        const projectData = { 
          name: this.getCurrentProjectName(),
          files: this.getProjectFiles(),
          settings: this.getProjectSettings(),
          updated: Date.now() 
        };
        const response = await fetch(`${this.apiUrl}/b/${this.projectId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': this.apiKey
          },
          body: JSON.stringify(projectData)
        });
        if (response.ok) { 
          if (typeof addOutput === 'function') addOutput('☁️ Project synced', 'success'); 
        }
      } else { 
        await this.saveProject(); 
      }
    } catch (error) { 
      console.error('Sync error:', error);
      if (typeof addOutput === 'function') addOutput('❌ Sync failed', 'error'); 
    }
  }

  startAutoSync() { 
    if (this.syncInterval) return;
    this.syncInterval = setInterval(() => { 
      if (this.autoSync && this.projectId && typeof state !== 'undefined' && state.fileSystem && Object.keys(state.fileSystem).length > 0) { 
        this.syncNow(); 
      } 
    }, UI_CONSTANTS.TIMEOUT_EXTENDED); 
  }

  stopAutoSync() { 
    if (this.syncInterval) { 
      clearInterval(this.syncInterval);
      this.syncInterval = null; 
    } 
  }

  async loadProjects() { 
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
    if (typeof state !== 'undefined' && state.fileSystem) {
      Object.entries(state.fileSystem).forEach(([name, file]) => { 
        if (file.type === 'file') { 
          files[name] = file.content; 
        } 
      });
    }
    return files; 
  }

  getProjectSettings() { 
    const themeEl = document.getElementById('themeSelect');
    const langEl = document.getElementById('languageSelect');
    return { 
      theme: themeEl ? themeEl.value : 'vs-dark',
      language: langEl ? langEl.value : 'javascript'
    }; 
  }

  getCurrentProjectName() {
    const nameEl = document.getElementById('projectName');
    return nameEl ? nameEl.value.trim() : 'Untitled Project';
  }

  downloadBackup() { 
    try {
      const backup = {
        fileSystem: typeof state !== 'undefined' ? state.fileSystem : {},
        settings: this.getProjectSettings(),
        timestamp: Date.now()
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hootner-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      if (typeof addOutput === 'function') addOutput('💾 Backup downloaded', 'success');
    } catch (error) {
      console.error('Download backup error:', error);
      if (typeof addOutput === 'function') addOutput('❌ Backup download failed', 'error');
    }
  }

  async restoreBackup() { 
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => { 
        const file = e.target.files[0];
        if (!file) return;
        try { 
          const text = await file.text();
          const backup = JSONUtils.safeParse(text);
          if (backup.fileSystem && typeof state !== 'undefined') { 
            Object.keys(state.fileSystem).forEach(key => { delete state.fileSystem[key]; });
            Object.assign(state.fileSystem, backup.fileSystem);
            if (backup.settings && backup.settings.theme) { 
              const themeEl = document.getElementById('themeSelect');
              if (themeEl) {
                themeEl.value = backup.settings.theme;
                if (typeof changeTheme === 'function') changeTheme();
              }
            }
            if (typeof renderFileTree === 'function') renderFileTree();
            if (typeof renderTabs === 'function') renderTabs();
            if (typeof addOutput === 'function') addOutput('💾 Backup restored', 'success'); 
          } 
        } catch (error) { 
          console.error('Restore error:', error);
          if (typeof addOutput === 'function') addOutput('❌ Invalid backup file', 'error'); 
        } 
      };
      input.click();
    } catch (error) {
      console.error('Restore backup error:', error);
      if (typeof addOutput === 'function') addOutput('❌ Restore failed', 'error');
    }
  }
}

window.cloudSync = new CloudSync();

if (typeof module !== 'undefined' && module.exports) { module.exports = CloudSync; }
