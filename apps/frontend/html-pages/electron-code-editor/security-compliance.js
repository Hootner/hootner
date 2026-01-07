/* global state, UI_CONSTANTS */

class SecurityCompliance { 
  constructor() { 
    this.auditLogs = this.loadAuditLogs();
    this.encryptionKey = null; 
  }

  async deriveKey(password, salt = null) { 
    try {
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);
      if (!salt) salt = crypto.getRandomValues(new Uint8Array(16));
      const keyMaterial = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, ['deriveBits', 'deriveKey']);
      const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      return { key, salt };
    } catch (error) {
      console.error('Derive key failed:', error);
      throw error;
    }
  }

  async encrypt(data, password) { 
    try {
      const { key, salt } = await this.deriveKey(password);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(data));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, dataBuffer);
      return { 
        encrypted: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv),
        salt: Array.from(salt) 
      };
    } catch (error) {
      console.error('Encrypt failed:', error);
      throw error;
    }
  }

  async decrypt(encryptedData, password) { 
    try {
      const salt = new Uint8Array(encryptedData.salt);
      const { key } = await this.deriveKey(password, salt);
      const iv = new Uint8Array(encryptedData.iv);
      const data = new Uint8Array(encryptedData.encrypted);
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decrypted));
    } catch (error) {
      throw new Error('Decryption failed: Invalid password');
    }
  }

  async encryptBackup(password) { 
    try {
      const stateData = { 
        fileSystem: (typeof state !== 'undefined' && state.fileSystem) ? state.fileSystem : {},
        currentFile: (typeof state !== 'undefined') ? state.currentFile : null,
        openTabs: (typeof state !== 'undefined' && state.openTabs) ? state.openTabs : [],
        timestamp: Date.now() 
      };
      const encrypted = await this.encrypt(stateData, password);
      localStorage.setItem('hootnerEncryptedBackup', JSON.stringify(encrypted));
      this.logAudit('backupEncrypted', { files: Object.keys(stateData.fileSystem).length });
      return encrypted;
    } catch (error) {
      console.error('Encrypt backup failed:', error);
      throw error;
    }
  }

  async decryptBackup(password) { 
    try {
      const encrypted = localStorage.getItem('hootnerEncryptedBackup');
      if (!encrypted) throw new Error('No encrypted backup found');
      const data = await this.decrypt(JSON.parse(encrypted), password);
      this.logAudit('backupDecrypted', { files: Object.keys(data.fileSystem).length });
      return data;
    } catch (error) {
      console.error('Decrypt backup failed:', error);
      throw error;
    }
  }

  logAudit(action, details = {}) { 
    try {
      const log = { 
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        action,
        user: this.getCurrentUser(),
        details,
        ip: 'localhost' 
      };
      this.auditLogs.push(log);
      if (this.auditLogs.length > 1000) this.auditLogs = this.auditLogs.slice(-1000);
      this.saveAuditLogs();
      return log;
    } catch (error) {
      console.error('Log audit failed:', error);
    }
  }

  loadAuditLogs() { 
    try {
      const saved = localStorage.getItem('hootnerAuditLogs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveAuditLogs() { 
    try {
      localStorage.setItem('hootnerAuditLogs', JSON.stringify(this.auditLogs));
    } catch (error) {
      console.error('Save audit logs failed:', error);
    }
  }

  exportLogsCSV(filters = {}) { 
    try {
      const logs = this.filterLogs(filters);
      const headers = ['Timestamp', 'Action', 'User', 'Details', 'IP'];
      const rows = logs.map(log => [log.timestamp, log.action, log.user, JSON.stringify(log.details), log.ip]);
      const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      this.downloadFile(csv, `audit-logs-${Date.now()}.csv`, 'text/csv');
      return csv;
    } catch (error) {
      console.error('Export CSV failed:', error);
    }
  }

  exportLogsJSON(filters = {}) { 
    try {
      const logs = this.filterLogs(filters);
      const json = JSON.stringify(logs, null, 2);
      this.downloadFile(json, `audit-logs-${Date.now()}.json`, 'application/json');
      return json;
    } catch (error) {
      console.error('Export JSON failed:', error);
    }
  }

  filterLogs(filters) { 
    let logs = [...this.auditLogs];
    if (filters.startDate) logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    if (filters.endDate) logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    if (filters.user) logs = logs.filter(log => log.user === filters.user);
    if (filters.action) logs = logs.filter(log => log.action === filters.action);
    return logs;
  }

  async sendToSplunk(logs, config) { 
    try {
      const { url, token } = config;
      const response = await fetch(url, { 
        method: 'POST',
        headers: { 
          'Authorization': `Splunk ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          event: logs,
          sourcetype: 'hootner:audit',
          index: 'main' 
        })
      });
      if (response.ok) { 
        this.logAudit('splunkExport', { count: logs.length });
        return { success: true, count: logs.length }; 
      } else { 
        throw new Error(`Splunk error: ${response.status}`); 
      }
    } catch (error) { 
      console.error('Splunk integration error:', error);
      return { success: false, error: error.message }; 
    }
  }

  getRoles() { 
    return { 
      admin: { permissions: ['read', 'write', 'delete', 'audit', 'admin'], description: 'Full access' },
      editor: { permissions: ['read', 'write'], description: 'Can read and edit' },
      viewer: { permissions: ['read'], description: 'View only' },
      guest: { permissions: ['read', 'preview'], description: 'Preview access' } 
    }; 
  }

  setUserRole(role) { 
    try {
      const roles = this.getRoles();
      if (!roles[role]) throw new Error(`Invalid role: ${role}`);
      localStorage.setItem('hootnerUserRole', role);
      localStorage.setItem('hootnerPermissions', JSON.stringify(roles[role].permissions));
      this.logAudit('roleChanged', { role });
      this.applyRoleRestrictions(role);
      return roles[role];
    } catch (error) {
      console.error('Set user role failed:', error);
      throw error;
    }
  }

  getCurrentRole() { 
    return localStorage.getItem('hootnerUserRole') || 'viewer'; 
  }

  hasPermission(action) { 
    try {
      const perms = JSON.parse(localStorage.getItem('hootnerPermissions') || '["read"]');
      return perms.includes(action);
    } catch {
      return false;
    }
  }

  applyRoleRestrictions(role) { 
    try {
      const isReadOnly = role === 'viewer' || role === 'guest';
      if (window.editor && isReadOnly) {
        window.editor.updateOptions({ readOnly: true });
        const writeButtons = document.querySelectorAll('[onclick*="save"], [onclick*="create"], [onclick*="delete"]');
        writeButtons.forEach(btn => { 
          btn.disabled = true;
          btn.style.opacity = '0.5';
          btn.style.cursor = 'not-allowed'; 
        });
      }
      if (role === 'guest') { 
        document.querySelectorAll('.activity-icon').forEach(icon => { 
          if (!icon.title.includes('Preview')) icon.style.display = 'none'; 
        }); 
      }
    } catch (error) {
      console.error('Apply role restrictions failed:', error);
    }
  }

  getCurrentUser() { 
    return localStorage.getItem('hootnerUsername') || 'anonymous'; 
  }

  downloadFile(content, filename, type) { 
    try {
      const blob = new Blob([content], { type });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
    } catch (error) {
      console.error('Download file failed:', error);
    }
  }

  getSecurityStatus() { 
    return { 
      encryptionEnabled: !!localStorage.getItem('hootnerEncryptedBackup'),
      auditLogsCount: this.auditLogs.length,
      currentRole: this.getCurrentRole(),
      lastBackup: this.getLastBackupTime(),
      recentActions: this.auditLogs.slice(-10).map(log => ({ action: log.action, timestamp: log.timestamp })) 
    }; 
  }

  getLastBackupTime() { 
    try {
      const backup = localStorage.getItem('hootnerEncryptedBackup');
      if (!backup) return null;
      const data = JSON.parse(backup);
      return new Date(data.timestamp || 0).toISOString();
    } catch {
      return null;
    }
  }

  clearSecurityData() { 
    try {
      localStorage.removeItem('hootnerEncryptedBackup');
      localStorage.removeItem('hootnerAuditLogs');
      this.auditLogs = [];
      this.logAudit('securityDataCleared', {});
    } catch (error) {
      console.error('Clear security data failed:', error);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) { module.exports = SecurityCompliance; }
