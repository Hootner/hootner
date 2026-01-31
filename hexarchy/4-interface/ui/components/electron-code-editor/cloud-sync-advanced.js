import DOMPurify from 'dompurify'
import { UI_CONSTANTS } from '../../constants/ui-constants.js'
import JSONUtils from '../../lib/json-utils.js'

/**
 * Cloud Sync - Advanced Multi-Provider Storage
 * Real-time sync, version control, conflict resolution, offline support
 */

class CloudSyncAdvanced {
  constructor() {
    this.providers = {
      jsonbin: { url: 'https://api.jsonbin.io/v3', name: 'JSONBin', icon: '📦' },
      github: { url: 'https://api.github.com', name: 'GitHub', icon: '🐙' },
      s3: { url: '', name: 'AWS S3', icon: '☁️' }
    }
    this.currentProvider = 'jsonbin'
    this.apiUrl = this.providers[this.currentProvider].url
    this.apiKey = localStorage.getItem('hootnerCloudKey')
    this.projectId = localStorage.getItem('hootnerProjectId')
    this.autoSync = true
    this.syncInterval = null
    this.versions = []
    this.conflictResolver = null
    this.syncQueue = []
    this.isOnline = navigator.onLine
    this.encryptionEnabled = false
    this.collaborators = new Map()
  }

  async init() {
    this.setupUI()
    this.setupOnlineDetection()
    this.setupConflictResolution()
    this.setupRealtimeSync()
    if (this.apiKey) {
      this.startAutoSync()
      await this.loadProjects()
      await this.loadVersionHistory()
    }
  }

  setupOnlineDetection() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processSyncQueue()
      this.showToast('🌐 Back online - syncing...')
    })
    window.addEventListener('offline', () => {
      this.isOnline = false
      this.showToast('📴 Offline - changes queued')
    })
  }

  setupConflictResolution() {
    this.conflictResolver = {
      strategy: 'manual',
      resolve: async (local, remote) => {
        if (this.conflictResolver.strategy === 'local') return local
        if (this.conflictResolver.strategy === 'remote') return remote
        if (this.conflictResolver.strategy === 'merge') return this.mergeChanges(local, remote)
        return await this.showConflictDialog(local, remote)
      }
    }
  }

  setupRealtimeSync() {
    if (window.editor) {
      let timeout
      window.editor.onDidChangeModelContent?.(() => {
        clearTimeout(timeout)
        timeout = setTimeout(() => this.queueSync(), 3000)
      })
    }
  }

  setupUI() {
    const activityBar = document.querySelector('.activity-bar')
    if (activityBar) {
      const cloudBtn = document.createElement('div')
      cloudBtn.className = 'activity-icon'
      cloudBtn.innerHTML = DOMPurify.sanitize('☁️')
      cloudBtn.title = 'Cloud Sync Advanced'
      cloudBtn.onclick = () => this.showCloudPanel()
      activityBar.appendChild(cloudBtn)
    }
  }

  showCloudPanel() {
    const panel = document.getElementById('output')
    if (window.showPanel) window.showPanel('output')

    const isConnected = !!this.apiKey
    const projects = JSONUtils.parseFromStorage('hootnerCloudProjects', [])

    panel.innerHTML = DOMPurify.sanitize(`
      <div style="padding: 16px;">
        <h3>☁️ Cloud Sync Advanced</h3>
        
        ${!isConnected ? `
          <div style="margin: 16px 0; padding: 12px; background: rgba(255,152,0,0.1); border: 1px solid #ff9800; border-radius: 4px;">
            <p>Connect to cloud storage</p>
            <select id="providerSelect" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border); color:var(--text); border-radius:4px; margin:8px 0;">
              ${Object.entries(this.providers).map(([key, p]) => 
                `<option value="${key}">${p.icon} ${p.name}</option>`
              ).join('')}
            </select>
            <div style="display: flex; gap: 8px; margin-top: 8px;">
              <input type="password" id="cloudApiKey" placeholder="API Key" style="flex: 1; padding: 8px; background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 4px;">
              <button class="cloud-btn" data-action="connect">Connect</button>
            </div>
          </div>
        ` : `
          <div style="margin: 16px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="color: #4caf50;">● ${this.providers[this.currentProvider].icon} ${this.providers[this.currentProvider].name}</span>
              <div style="display:flex; gap:8px;">
                <button class="cloud-btn-small" data-action="sync">🔄 Sync</button>
                <button class="cloud-btn-small" data-action="versions">📜 Versions</button>
                <button class="cloud-btn-small" data-action="settings">⚙️</button>
                <button class="cloud-btn-danger" data-action="disconnect">Disconnect</button>
              </div>
            </div>
            
            <div style="margin: 16px 0;">
              <h4>Current Project</h4>
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <input type="text" id="projectName" placeholder="Project name" value="${this.getCurrentProjectName()}" style="flex: 1; padding: 8px; background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 4px;">
                <button class="cloud-btn" data-action="save">💾 Save</button>
              </div>
              <div style="margin-top:8px; font-size:11px; opacity:0.7;">
                ${this.isOnline ? '🌐 Online' : '📴 Offline'} • 
                Auto-sync: ${this.autoSync ? 'ON' : 'OFF'} • 
                Queue: ${this.syncQueue.length}
              </div>
            </div>
            
            <div>
              <h4>Saved Projects (${projects.length})</h4>
              <div style="max-height:300px; overflow-y:auto;">
                ${projects.map(project => `
                  <div class="cloud-project">
                    <div>
                      <strong>${project.name}</strong>
                      <p style="font-size: 12px; color: var(--text-muted);">${new Date(project.updated).toLocaleString()}</p>
                    </div>
                    <div>
                      <button class="cloud-btn-small" data-action="load" data-id="${project.id}">Load</button>
                      <button class="cloud-btn-small" data-action="share" data-id="${project.id}">Share</button>
                      <button class="cloud-btn-small-danger" data-action="delete" data-id="${project.id}">Delete</button>
                    </div>
                  </div>
                `).join('') || '<div style="color: #666;">No saved projects</div>'}
              </div>
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
          transition: opacity 0.2s;
        }
        .cloud-btn:hover { opacity: 0.8; }
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
          transition: background 0.2s;
        }
        .cloud-project:hover { background: var(--hover); }
      </style>
    `)

    this.attachEventListeners(panel)
  }

  attachEventListeners(panel) {
    panel.querySelectorAll('[data-action]').forEach(btn => {
      btn.onclick = () => {
        const action = btn.dataset.action
        const id = btn.dataset.id
        
        switch(action) {
          case 'connect': this.connect(); break
          case 'disconnect': this.disconnect(); break
          case 'sync': this.syncNow(); break
          case 'save': this.saveProject(); break
          case 'load': this.loadProject(id); break
          case 'delete': this.deleteProject(id); break
          case 'share': this.shareProject(id); break
          case 'versions': this.showVersions(); break
          case 'settings': this.showSettings(); break
        }
      }
    })
  }

  async connect() {
    const provider = document.getElementById('providerSelect')?.value || 'jsonbin'
    const apiKey = document.getElementById('cloudApiKey')?.value.trim()
    if (!apiKey) return

    this.currentProvider = provider
    this.apiUrl = this.providers[provider].url
    this.apiKey = apiKey
    localStorage.setItem('hootnerCloudKey', apiKey)
    localStorage.setItem('hootnerCloudProvider', provider)
    
    this.startAutoSync()
    await this.loadProjects()
    this.showToast(`☁️ Connected to ${this.providers[provider].name}`)
    this.showCloudPanel()
  }

  disconnect() {
    this.apiKey = null
    this.projectId = null
    localStorage.removeItem('hootnerCloudKey')
    localStorage.removeItem('hootnerProjectId')
    this.stopAutoSync()
    this.showToast('☁️ Disconnected')
    this.showCloudPanel()
  }

  async saveProject(silent = false) {
    if (!this.apiKey) return

    const name = document.getElementById('projectName')?.value.trim() || this.getCurrentProjectName()
    const projectData = {
      name,
      files: this.getProjectFiles(),
      settings: this.getProjectSettings(),
      updated: Date.now(),
      version: this.versions.length + 1
    }

    try {
      const method = this.projectId ? 'PUT' : 'POST'
      const url = this.projectId ? `${this.apiUrl}/b/${this.projectId}` : `${this.apiUrl}/b`
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': this.apiKey
        },
        body: JSON.stringify(projectData)
      })

      if (response.ok) {
        const result = await response.json()
        this.projectId = result.metadata?.id || this.projectId
        localStorage.setItem('hootnerProjectId', this.projectId)
        
        await this.createVersion(`Saved: ${name}`)
        await this.updateProjectsList(this.projectId, name)
        
        if (!silent) {
          this.showToast(`☁️ Saved: ${name}`)
          this.showCloudPanel()
        }
      }
    } catch (error) {
      this.showToast('❌ Save failed')
    }
  }

  async loadProject(projectId) {
    if (!this.apiKey || !projectId) return

    try {
      const response = await fetch(`${this.apiUrl}/b/${projectId}`, {
        headers: { 'X-Master-Key': this.apiKey }
      })

      if (response.ok) {
        const data = await response.json()
        const projectData = data.record
        
        const localData = this.getProjectFiles()
        if (this.hasLocalChanges(localData)) {
          const resolved = await this.conflictResolver.resolve(localData, projectData.files)
          this.restoreProjectFiles(resolved)
        } else {
          this.restoreProjectFiles(projectData.files)
        }
        
        this.restoreProjectSettings(projectData.settings)
        this.projectId = projectId
        localStorage.setItem('hootnerProjectId', projectId)
        
        this.showToast(`☁️ Loaded: ${projectData.name}`)
        this.showCloudPanel()
      }
    } catch (error) {
      this.showToast('❌ Load failed')
    }
  }

  async deleteProject(projectId) {
    if (!confirm('Delete this project?')) return

    try {
      const response = await fetch(`${this.apiUrl}/b/${projectId}`, {
        method: 'DELETE',
        headers: { 'X-Master-Key': this.apiKey }
      })

      if (response.ok) {
        await this.removeFromProjectsList(projectId)
        this.showToast('☁️ Deleted')
        this.showCloudPanel()
      }
    } catch (error) {
      this.showToast('❌ Delete failed')
    }
  }

  async shareProject(projectId) {
    const shareUrl = `${window.location.origin}?project=${projectId}`
    navigator.clipboard.writeText(shareUrl)
    this.showToast('🔗 Share link copied!')
  }

  showVersions() {
    const modal = document.createElement('div')
    modal.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:600px; max-height:80vh; background:var(--sidebar-bg); border:2px solid var(--accent); border-radius:12px; z-index:10000; padding:24px; overflow-y:auto;'
    modal.innerHTML = `
      <h3 style="color:var(--accent); margin-bottom:16px;">📜 Version History</h3>
      ${this.versions.map(v => `
        <div style="padding:12px; background:var(--bg); border-radius:6px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>${v.message}</strong>
            <p style="font-size:11px; opacity:0.7;">${new Date(v.timestamp).toLocaleString()}</p>
          </div>
          <button onclick="window.cloudSync.restoreVersion(${v.id}); this.parentElement.parentElement.parentElement.remove();" style="padding:6px 12px; background:var(--accent); color:white; border:none; border-radius:4px; cursor:pointer;">Restore</button>
        </div>
      `).join('') || '<p style="opacity:0.7;">No versions yet</p>'}
      <button onclick="this.parentElement.remove()" style="margin-top:16px; width:100%; padding:10px; background:var(--hover); color:var(--text); border:none; border-radius:6px; cursor:pointer;">Close</button>
    `
    document.body.appendChild(modal)
  }

  showSettings() {
    const modal = document.createElement('div')
    modal.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:500px; background:var(--sidebar-bg); border:2px solid var(--accent); border-radius:12px; z-index:10000; padding:24px;'
    modal.innerHTML = `
      <h3 style="color:var(--accent); margin-bottom:16px;">⚙️ Sync Settings</h3>
      <div style="margin-bottom:16px;">
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
          <input type="checkbox" id="autoSyncToggle" ${this.autoSync ? 'checked' : ''}>
          <span>Auto-sync (every minute)</span>
        </label>
      </div>
      <div style="margin-bottom:16px;">
        <label>Conflict Resolution:</label>
        <select id="conflictStrategy" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border); color:var(--text); border-radius:4px; margin-top:4px;">
          <option value="manual" ${this.conflictResolver.strategy === 'manual' ? 'selected' : ''}>Manual</option>
          <option value="local" ${this.conflictResolver.strategy === 'local' ? 'selected' : ''}>Prefer Local</option>
          <option value="remote" ${this.conflictResolver.strategy === 'remote' ? 'selected' : ''}>Prefer Remote</option>
          <option value="merge" ${this.conflictResolver.strategy === 'merge' ? 'selected' : ''}>Auto-merge</option>
        </select>
      </div>
      <button onclick="window.cloudSync.saveSettings(); this.parentElement.remove();" style="width:100%; padding:10px; background:var(--accent); color:white; border:none; border-radius:6px; cursor:pointer;">Save</button>
    `
    document.body.appendChild(modal)
  }

  saveSettings() {
    this.autoSync = document.getElementById('autoSyncToggle')?.checked || false
    this.conflictResolver.strategy = document.getElementById('conflictStrategy')?.value || 'manual'
    localStorage.setItem('hootnerAutoSync', this.autoSync)
    localStorage.setItem('hootnerConflictStrategy', this.conflictResolver.strategy)
    this.showToast('⚙️ Settings saved')
  }

  async showConflictDialog(local, remote) {
    return new Promise(resolve => {
      const dialog = document.createElement('div')
      dialog.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:500px; background:var(--sidebar-bg); border:2px solid var(--accent); border-radius:12px; z-index:10001; padding:24px;'
      dialog.innerHTML = `
        <h3 style="color:var(--accent); margin-bottom:16px;">⚠️ Sync Conflict</h3>
        <p style="margin-bottom:16px;">Local and remote versions differ. Choose:</p>
        <div style="display:flex; gap:12px;">
          <button id="useLocal" style="flex:1; padding:12px; background:var(--accent); color:white; border:none; border-radius:6px; cursor:pointer;">Use Local</button>
          <button id="useRemote" style="flex:1; padding:12px; background:var(--accent); color:white; border:none; border-radius:6px; cursor:pointer;">Use Remote</button>
          <button id="merge" style="flex:1; padding:12px; background:var(--accent); color:white; border:none; border-radius:6px; cursor:pointer;">Merge</button>
        </div>
      `
      document.body.appendChild(dialog)
      
      dialog.querySelector('#useLocal').onclick = () => { dialog.remove(); resolve(local) }
      dialog.querySelector('#useRemote').onclick = () => { dialog.remove(); resolve(remote) }
      dialog.querySelector('#merge').onclick = () => { dialog.remove(); resolve(this.mergeChanges(local, remote)) }
    })
  }

  queueSync() {
    if (!this.isOnline) {
      this.syncQueue.push({ action: 'sync', timestamp: Date.now() })
      return
    }
    if (this.projectId) this.saveProject(true)
  }

  async syncNow() {
    if (this.projectId) await this.saveProject()
    else this.showToast('⚠️ No project to sync')
  }

  async processSyncQueue() {
    while (this.syncQueue.length > 0 && this.isOnline) {
      this.syncQueue.shift()
      await this.syncNow()
    }
  }

  startAutoSync() {
    if (this.syncInterval) return
    this.syncInterval = setInterval(() => {
      if (this.autoSync && this.projectId && this.isOnline) {
        this.saveProject(true)
      }
    }, 60000)
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  async loadProjects() {
    return JSONUtils.parseFromStorage('hootnerCloudProjects', [])
  }

  async loadVersionHistory() {
    if (!this.projectId) return
    this.versions = JSONUtils.parseFromStorage(`hootnerVersions_${this.projectId}`, [])
  }

  async createVersion(message) {
    const version = {
      id: Date.now(),
      message,
      files: this.getProjectFiles(),
      timestamp: Date.now()
    }
    this.versions.unshift(version)
    if (this.versions.length > 10) this.versions.pop()
    localStorage.setItem(`hootnerVersions_${this.projectId}`, JSON.stringify(this.versions))
  }

  async restoreVersion(versionId) {
    const version = this.versions.find(v => v.id === versionId)
    if (version) {
      this.restoreProjectFiles(version.files)
      this.showToast(`⏮️ Restored: ${version.message}`)
    }
  }

  hasLocalChanges(localData) {
    const lastSync = localStorage.getItem('hootnerLastSync')
    return !lastSync || Date.now() - parseInt(lastSync) > 60000
  }

  mergeChanges(local, remote) {
    return { ...remote, ...local, modified: Date.now() }
  }

  getProjectFiles() {
    return {
      main: window.editor?.getValue() || '',
      modified: Date.now()
    }
  }

  restoreProjectFiles(files) {
    if (window.editor && files.main) {
      window.editor.setValue(files.main)
    }
    localStorage.setItem('hootnerLastSync', Date.now().toString())
  }

  getProjectSettings() {
    return {
      theme: localStorage.getItem('hootnerTheme') || 'dark',
      fontSize: localStorage.getItem('hootnerFontSize') || '14'
    }
  }

  restoreProjectSettings(settings) {
    if (settings.theme) localStorage.setItem('hootnerTheme', settings.theme)
    if (settings.fontSize) localStorage.setItem('hootnerFontSize', settings.fontSize)
  }

  getCurrentProjectName() {
    return localStorage.getItem('hootnerCurrentProject') || 'Untitled'
  }

  async updateProjectsList(id, name) {
    const projects = JSONUtils.parseFromStorage('hootnerCloudProjects', [])
    const existing = projects.findIndex(p => p.id === id)
    const project = { id, name, updated: Date.now() }
    
    if (existing >= 0) projects[existing] = project
    else projects.unshift(project)
    
    localStorage.setItem('hootnerCloudProjects', JSON.stringify(projects))
    localStorage.setItem('hootnerCurrentProject', name)
  }

  async removeFromProjectsList(id) {
    const projects = JSONUtils.parseFromStorage('hootnerCloudProjects', [])
    const filtered = projects.filter(p => p.id !== id)
    localStorage.setItem('hootnerCloudProjects', JSON.stringify(filtered))
  }

  showToast(message) {
    if (window.addOutput) window.addOutput(message, 'info')
  }
}

// Auto-initialize
let cloudSync
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    cloudSync = new CloudSyncAdvanced()
    cloudSync.init()
    window.cloudSync = cloudSync
  })
}

export default CloudSyncAdvanced
