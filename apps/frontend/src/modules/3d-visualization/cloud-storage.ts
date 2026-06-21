// @ts-nocheck
import { toast } from 'sonner'

export interface CloudProject {
  id: string
  userId: string
  name: string
  description?: string
  config: any
  tags?: string[]
  thumbnail?: string
  isPublic: boolean
  createdAt: number
  updatedAt: number
  syncedAt: number
  version: number
  sharingToken?: string
  collaborators?: string[]
  encryptionEnabled?: boolean
}

export interface CloudSyncStatus {
  isSyncing: boolean
  lastSyncTime?: number
  pendingChanges: number
  syncError?: string
}

export interface SyncConflict {
  localVersion: number
  cloudVersion: number
  localData: any
  cloudData: any
}

export interface CloudAccessKey {
  id: string
  key: string
  name: string
  createdAt: number
  lastUsed?: number
  expiresAt?: number
  permissions: ('read' | 'write' | 'delete')[]
}

export interface CloudSecuritySettings {
  encryptionEnabled: boolean
  requireAccessKey: boolean
  activeAccessKeys: CloudAccessKey[]
  allowPublicSharing: boolean
  twoFactorEnabled: boolean
}

export class CloudStorageService {
  private syncInterval: NodeJS.Timeout | null = null
  private pendingSync: Set<string> = new Set()
  private currentAccessKey: string | null = null

  async getUserInfo() {
    try {
      return { login: 'platform-user' }
    } catch (error) {
      console.error('Failed to get user info:', error)
      return null
    }
  }

  setAccessKey(key: string) {
    this.currentAccessKey = key
  }

  async verifyAccessKey(key: string): Promise<boolean> {
    try {
      const user = await this.getUserInfo()
      if (!user) return false

      const securityKey = `cloud-security-${user.login}`
      const settings = localStorage.getItem<CloudSecuritySettings>(securityKey)

      if (!settings || !settings.requireAccessKey) {
        return true
      }

      const accessKey = settings.activeAccessKeys.find(k => k.key === key)
      if (!accessKey) return false

      if (accessKey.expiresAt && accessKey.expiresAt < Date.now()) {
        return false
      }

      accessKey.lastUsed = Date.now()
      localStorage.setItem(securityKey, settings)

      return true
    } catch (error) {
      console.error('Failed to verify access key:', error)
      return false
    }
  }

  async getSecuritySettings(): Promise<CloudSecuritySettings> {
    try {
      const user = await this.getUserInfo()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const securityKey = `cloud-security-${user.login}`
      const settings = localStorage.getItem<CloudSecuritySettings>(securityKey)

      if (!settings) {
        const masterKey = this.generateSecureKey()
        const masterAccessKey: CloudAccessKey = {
          id: `key-${Date.now()}-master`,
          key: masterKey,
          name: 'Master Access Key',
          createdAt: Date.now(),
          permissions: ['read', 'write', 'delete'],
          expiresAt: undefined
        }

        const defaultSettings: CloudSecuritySettings = {
          encryptionEnabled: true,
          requireAccessKey: false,
          activeAccessKeys: [masterAccessKey],
          allowPublicSharing: true,
          twoFactorEnabled: false
        }
        
        localStorage.setItem(securityKey, defaultSettings)
        
        localStorage.setItem(`master-key-display-${user.login}`, {
          key: masterKey,
          displayUntil: Date.now() + (1000 * 60 * 60 * 24)
        })
        
        return defaultSettings
      }

      return settings
    } catch (error) {
      console.error('Failed to get security settings:', error)
      throw error
    }
  }

  private generateSecureKey(): string {
    const prefix = 'holo'
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let key = ''
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `${prefix}_${key}`
  }

  async updateSecuritySettings(settings: Partial<CloudSecuritySettings>): Promise<void> {
    try {
      const user = await this.getUserInfo()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const securityKey = `cloud-security-${user.login}`
      const currentSettings = await this.getSecuritySettings()
      const updatedSettings = { ...currentSettings, ...settings }
      
      localStorage.setItem(securityKey, updatedSettings)
      toast.success('Security settings updated')
    } catch (error) {
      console.error('Failed to update security settings:', error)
      toast.error('Failed to update security settings')
      throw error
    }
  }

  async generateAccessKey(name: string, permissions: ('read' | 'write' | 'delete')[], expiresInDays?: number): Promise<CloudAccessKey> {
    try {
      const user = await this.getUserInfo()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const key = `holo_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
      const accessKey: CloudAccessKey = {
        id: `key-${Date.now()}`,
        key,
        name,
        createdAt: Date.now(),
        permissions,
        expiresAt: expiresInDays ? Date.now() + (expiresInDays * 24 * 60 * 60 * 1000) : undefined
      }

      const settings = await this.getSecuritySettings()
      settings.activeAccessKeys.push(accessKey)
      await this.updateSecuritySettings(settings)

      toast.success(`Access key "${name}" created`)
      return accessKey
    } catch (error) {
      console.error('Failed to generate access key:', error)
      toast.error('Failed to generate access key')
      throw error
    }
  }

  async revokeAccessKey(keyId: string): Promise<void> {
    try {
      const user = await this.getUserInfo()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const settings = await this.getSecuritySettings()
      settings.activeAccessKeys = settings.activeAccessKeys.filter(k => k.id !== keyId)
      await this.updateSecuritySettings(settings)

      toast.success('Access key revoked')
    } catch (error) {
      console.error('Failed to revoke access key:', error)
      toast.error('Failed to revoke access key')
      throw error
    }
  }

  async rotateAccessKey(oldKeyId: string, newName: string): Promise<CloudAccessKey> {
    try {
      const settings = await this.getSecuritySettings()
      const oldKey = settings.activeAccessKeys.find(k => k.id === oldKeyId)
      
      if (!oldKey) {
        throw new Error('Access key not found')
      }

      const newKey = await this.generateAccessKey(newName, oldKey.permissions, oldKey.expiresAt ? 365 : undefined)
      await this.revokeAccessKey(oldKeyId)

      toast.success('Access key rotated successfully')
      return newKey
    } catch (error) {
      console.error('Failed to rotate access key:', error)
      toast.error('Failed to rotate access key')
      throw error
    }
  }

  private async checkAccess(requiredPermission: 'read' | 'write' | 'delete'): Promise<boolean> {
    try {
      const settings = await this.getSecuritySettings()
      
      if (!settings.requireAccessKey) {
        return true
      }

      if (!this.currentAccessKey) {
        toast.error('Access key required. Please authenticate.')
        return false
      }

      const isValid = await this.verifyAccessKey(this.currentAccessKey)
      if (!isValid) {
        toast.error('Invalid or expired access key')
        return false
      }

      const accessKey = settings.activeAccessKeys.find(k => k.key === this.currentAccessKey)
      if (!accessKey || !accessKey.permissions.includes(requiredPermission)) {
        toast.error(`Permission denied: ${requiredPermission} access required`)
        return false
      }

      return true
    } catch (error) {
      console.error('Access check failed:', error)
      return false
    }
  }

  private encryptData(data: string): string {
    return btoa(data)
  }

  private decryptData(encryptedData: string): string {
    return atob(encryptedData)
  }

  async saveProjectToCloud(project: Omit<CloudProject, 'userId' | 'syncedAt'> & { version?: number }) {
    try {
      if (!await this.checkAccess('write')) {
        throw new Error('Write access denied')
      }

      const user = await this.getUserInfo()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const settings = await this.getSecuritySettings()

      let projectData = {
        ...project,
        userId: user.login,
        syncedAt: Date.now(),
        version: project.version || 1,
        encryptionEnabled: settings.encryptionEnabled
      }

      const key = `cloud-project-${project.id}`
      
      if (settings.encryptionEnabled) {
        const encrypted = this.encryptData(JSON.stringify(projectData.config))
        projectData = { ...projectData, config: encrypted }
      }

      localStorage.setItem(key, projectData)

      const userProjectsKey = `cloud-user-projects-${user.login}`
      const userProjects = localStorage.getItem<string[]>(userProjectsKey) || []
      if (!userProjects.includes(project.id)) {
        userProjects.push(project.id)
        localStorage.setItem(userProjectsKey, userProjects)
      }

      toast.success(`"${project.name}" synced to cloud`)
      return projectData
    } catch (error) {
      console.error('Failed to save project to cloud:', error)
      toast.error('Cloud sync failed')
      throw error
    }
  }

  async getProjectFromCloud(projectId: string): Promise<CloudProject | null> {
    try {
      if (!await this.checkAccess('read')) {
        throw new Error('Read access denied')
      }

      const key = `cloud-project-${projectId}`
      const result = localStorage.getItem<CloudProject>(key)
      
      if (!result) return null

      if (result.encryptionEnabled && typeof result.config === 'string') {
        try {
          result.config = JSON.parse(this.decryptData(result.config))
        } catch (error) {
          console.error('Failed to decrypt project data:', error)
          toast.error('Failed to decrypt project data')
          return null
        }
      }

      return result
    } catch (error) {
      console.error('Failed to get project from cloud:', error)
      return null
    }
  }

  async getUserProjects(): Promise<CloudProject[]> {
    try {
      const user = await this.getUserInfo()
      if (!user) return []

      const userProjectsKey = `cloud-user-projects-${user.login}`
      const projectIds = localStorage.getItem<string[]>(userProjectsKey) || []

      const projects = await Promise.all(
        projectIds.map(id => this.getProjectFromCloud(id))
      )

      return projects.filter((p): p is CloudProject => p !== null)
    } catch (error) {
      console.error('Failed to get user projects:', error)
      return []
    }
  }

  async deleteProjectFromCloud(projectId: string) {
    try {
      if (!await this.checkAccess('delete')) {
        throw new Error('Delete access denied')
      }

      const user = await this.getUserInfo()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const key = `cloud-project-${projectId}`
      localStorage.removeItem(key)

      const userProjectsKey = `cloud-user-projects-${user.login}`
      const userProjects = localStorage.getItem<string[]>(userProjectsKey) || []
      const updatedProjects = userProjects.filter(id => id !== projectId)
      localStorage.setItem(userProjectsKey, updatedProjects)

      toast.success('Project deleted from cloud')
    } catch (error) {
      console.error('Failed to delete project from cloud:', error)
      toast.error('Failed to delete from cloud')
      throw error
    }
  }

  async syncProject(localProject: any): Promise<CloudProject | SyncConflict> {
    try {
      const cloudProject = await this.getProjectFromCloud(localProject.id)

      if (!cloudProject) {
        return await this.saveProjectToCloud(localProject)
      }

      if (cloudProject.version > localProject.version) {
        return {
          localVersion: localProject.version,
          cloudVersion: cloudProject.version,
          localData: localProject,
          cloudData: cloudProject
        }
      }

      if (localProject.updatedAt > cloudProject.updatedAt) {
        return await this.saveProjectToCloud({
          ...localProject,
          version: cloudProject.version + 1
        })
      }

      return cloudProject
    } catch (error) {
      console.error('Failed to sync project:', error)
      throw error
    }
  }

  async shareProject(projectId: string): Promise<string> {
    try {
      const project = await this.getProjectFromCloud(projectId)
      if (!project) {
        throw new Error('Project not found')
      }

      const user = await this.getUserInfo()
      if (user && project.userId !== user.login) {
        throw new Error('Not authorized to share this project')
      }

      if (project.sharingToken) {
        return project.sharingToken
      }

      const sharingToken = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      await this.saveProjectToCloud({
        ...project,
        sharingToken,
        isPublic: true,
        updatedAt: Date.now()
      })

      const shareKey = `cloud-share-${sharingToken}`
      localStorage.setItem(shareKey, projectId)

      return sharingToken
    } catch (error) {
      console.error('Failed to share project:', error)
      toast.error('Failed to create share link')
      throw error
    }
  }

  async getSharedProject(sharingToken: string): Promise<CloudProject | null> {
    try {
      const shareKey = `cloud-share-${sharingToken}`
      const projectId = localStorage.getItem<string>(shareKey)
      
      if (!projectId) {
        return null
      }

      return await this.getProjectFromCloud(projectId)
    } catch (error) {
      console.error('Failed to get shared project:', error)
      return null
    }
  }

  async getPublicProjects(): Promise<CloudProject[]> {
    try {
      const allKeys = Object.keys(localStorage)
      const projectKeys = allKeys.filter(key => key.startsWith('cloud-project-'))
      
      const projects = await Promise.all(
        projectKeys.map(key => Promise.resolve(JSON.parse(localStorage.getItem(key) || 'null')))
      )

      return projects.filter((p): p is CloudProject => p !== null && p !== undefined && p.isPublic)
    } catch (error) {
      console.error('Failed to get public projects:', error)
      return []
    }
  }

  async addCollaborator(projectId: string, collaboratorId: string) {
    try {
      const project = await this.getProjectFromCloud(projectId)
      if (!project) {
        throw new Error('Project not found')
      }

      const user = await this.getUserInfo()
      if (user && project.userId !== user.login) {
        throw new Error('Not authorized to add collaborators')
      }

      const collaborators = project.collaborators || []
      if (!collaborators.includes(collaboratorId)) {
        collaborators.push(collaboratorId)
      }

      await this.saveProjectToCloud({
        ...project,
        collaborators,
        updatedAt: Date.now()
      })

      toast.success('Collaborator added')
    } catch (error) {
      console.error('Failed to add collaborator:', error)
      toast.error('Failed to add collaborator')
      throw error
    }
  }

  startAutoSync(syncInterval: number = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(async () => {
      if (this.pendingSync.size === 0) return

      console.log(`Auto-syncing ${this.pendingSync.size} projects...`)
      
      for (const projectId of this.pendingSync) {
        try {
          const localProject = localStorage.getItem(`hologram-project-${projectId}`)
          if (localProject) {
            await this.syncProject(localProject)
            this.pendingSync.delete(projectId)
          }
        } catch (error) {
          console.error(`Failed to auto-sync project ${projectId}:`, error)
        }
      }
    }, syncInterval)
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  markForSync(projectId: string) {
    this.pendingSync.add(projectId)
  }

  async exportCloudData(): Promise<string> {
    try {
      const projects = await this.getUserProjects()
      const data = {
        version: '1.0',
        exportDate: Date.now(),
        projects
      }
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('Failed to export cloud data:', error)
      throw error
    }
  }

  async importCloudData(jsonData: string) {
    try {
      const data = JSON.parse(jsonData)
      
      if (!data.projects || !Array.isArray(data.projects)) {
        throw new Error('Invalid data format')
      }

      const user = await this.getUserInfo()
      if (!user) {
        throw new Error('User not authenticated')
      }

      let importedCount = 0
      for (const project of data.projects) {
        try {
          await this.saveProjectToCloud({
            ...project,
            id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            updatedAt: Date.now()
          })
          importedCount++
        } catch (error) {
          console.error('Failed to import project:', error)
        }
      }

      toast.success(`Imported ${importedCount} projects to cloud`)
    } catch (error) {
      console.error('Failed to import cloud data:', error)
      toast.error('Failed to import data')
      throw error
    }
  }
}

export const cloudStorage = new CloudStorageService()
