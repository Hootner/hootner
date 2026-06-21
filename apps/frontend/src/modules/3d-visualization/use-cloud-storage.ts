import { useState, useEffect, useCallback } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { cloudStorage, CloudProject, CloudSyncStatus } from './cloud-storage'
import { toast } from 'sonner'

export function useCloudStorage() {
  const [cloudProjects, setCloudProjects] = useState<CloudProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = usePlatformKV<CloudSyncStatus>('cloud-sync-status', {
    isSyncing: false,
    pendingChanges: 0
  })
  const [autoSyncEnabled, setAutoSyncEnabled] = usePlatformKV<boolean>('cloud-auto-sync-enabled', true)

  const loadCloudProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      const projects = await cloudStorage.getUserProjects()
      setCloudProjects(projects)
    } catch (error) {
      console.error('Failed to load cloud projects:', error)
      toast.error('Failed to load cloud projects')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCloudProjects()
  }, [loadCloudProjects])

  useEffect(() => {
    if (autoSyncEnabled) {
      cloudStorage.startAutoSync(30000)
    } else {
      cloudStorage.stopAutoSync()
    }

    return () => {
      cloudStorage.stopAutoSync()
    }
  }, [autoSyncEnabled])

  const uploadProject = useCallback(async (project: any) => {
    try {
      setSyncStatus((prev) => ({ 
        isSyncing: true,
        pendingChanges: prev?.pendingChanges || 0,
        lastSyncTime: prev?.lastSyncTime,
        syncError: prev?.syncError
      }))
      
      const cloudProject = await cloudStorage.saveProjectToCloud({
        ...project,
        isPublic: false,
        createdAt: project.createdAt || Date.now(),
        updatedAt: Date.now(),
        version: 1
      })

      setCloudProjects((prev) => {
        const index = prev.findIndex(p => p.id === cloudProject.id)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = cloudProject
          return updated
        }
        return [...prev, cloudProject]
      })

      setSyncStatus((prev) => ({ 
        isSyncing: false,
        lastSyncTime: Date.now(),
        pendingChanges: Math.max(0, (prev?.pendingChanges || 0) - 1),
        syncError: undefined
      }))

      return cloudProject
    } catch (error) {
      setSyncStatus((prev) => ({ 
        isSyncing: false,
        lastSyncTime: prev?.lastSyncTime,
        pendingChanges: prev?.pendingChanges || 0,
        syncError: error instanceof Error ? error.message : 'Sync failed'
      }))
      throw error
    }
  }, [setSyncStatus])

  const downloadProject = useCallback(async (projectId: string) => {
    try {
      const project = await cloudStorage.getProjectFromCloud(projectId)
      return project
    } catch (error) {
      console.error('Failed to download project:', error)
      toast.error('Failed to download project')
      return null
    }
  }, [])

  const deleteFromCloud = useCallback(async (projectId: string) => {
    try {
      await cloudStorage.deleteProjectFromCloud(projectId)
      setCloudProjects((prev) => prev.filter(p => p.id !== projectId))
    } catch (error) {
      console.error('Failed to delete from cloud:', error)
      throw error
    }
  }, [])

  const syncProject = useCallback(async (localProject: any) => {
    try {
      setSyncStatus((prev) => ({ 
        isSyncing: true,
        pendingChanges: prev?.pendingChanges || 0,
        lastSyncTime: prev?.lastSyncTime,
        syncError: prev?.syncError
      }))
      
      const result = await cloudStorage.syncProject(localProject)
      
      if ('localVersion' in result) {
        setSyncStatus((prev) => ({ 
          isSyncing: false,
          pendingChanges: prev?.pendingChanges || 0,
          lastSyncTime: prev?.lastSyncTime,
          syncError: prev?.syncError
        }))
        return { conflict: result }
      }

      setCloudProjects((prev) => {
        const index = prev.findIndex(p => p.id === result.id)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = result
          return updated
        }
        return [...prev, result]
      })

      setSyncStatus((prev) => ({ 
        isSyncing: false,
        lastSyncTime: Date.now(),
        pendingChanges: prev?.pendingChanges || 0,
        syncError: undefined
      }))

      return { project: result }
    } catch (error) {
      setSyncStatus((prev) => ({ 
        isSyncing: false,
        lastSyncTime: prev?.lastSyncTime,
        pendingChanges: prev?.pendingChanges || 0,
        syncError: error instanceof Error ? error.message : 'Sync failed'
      }))
      throw error
    }
  }, [setSyncStatus])

  const shareProject = useCallback(async (projectId: string) => {
    try {
      const token = await cloudStorage.shareProject(projectId)
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${token}`
      
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied to clipboard!')
      
      return shareUrl
    } catch (error) {
      console.error('Failed to share project:', error)
      toast.error('Failed to create share link')
      throw error
    }
  }, [])

  const loadSharedProject = useCallback(async (token: string) => {
    try {
      const project = await cloudStorage.getSharedProject(token)
      if (project) {
        toast.success(`Loaded shared project: ${project.name}`)
      } else {
        toast.error('Shared project not found')
      }
      return project
    } catch (error) {
      console.error('Failed to load shared project:', error)
      toast.error('Failed to load shared project')
      return null
    }
  }, [])

  const getPublicProjects = useCallback(async () => {
    try {
      const projects = await cloudStorage.getPublicProjects()
      return projects
    } catch (error) {
      console.error('Failed to get public projects:', error)
      return []
    }
  }, [])

  const exportCloudData = useCallback(async () => {
    try {
      const data = await cloudStorage.exportCloudData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hologram-cloud-backup-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Cloud data exported')
    } catch (error) {
      console.error('Failed to export cloud data:', error)
      toast.error('Failed to export cloud data')
    }
  }, [])

  const importCloudData = useCallback(async () => {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
          try {
            const data = event.target?.result as string
            await cloudStorage.importCloudData(data)
            await loadCloudProjects()
          } catch (error) {
            console.error('Failed to import cloud data:', error)
            toast.error('Failed to import cloud data')
          }
        }
        reader.readAsText(file)
      }

      input.click()
    } catch (error) {
      console.error('Failed to import cloud data:', error)
      toast.error('Failed to import cloud data')
    }
  }, [loadCloudProjects])

  const markForSync = useCallback((projectId: string) => {
    cloudStorage.markForSync(projectId)
    setSyncStatus((prev) => ({ 
      isSyncing: prev?.isSyncing || false,
      lastSyncTime: prev?.lastSyncTime,
      pendingChanges: (prev?.pendingChanges || 0) + 1,
      syncError: prev?.syncError
    }))
  }, [setSyncStatus])

  return {
    cloudProjects,
    isLoading,
    syncStatus,
    autoSyncEnabled,
    setAutoSyncEnabled,
    uploadProject,
    downloadProject,
    deleteFromCloud,
    syncProject,
    shareProject,
    loadSharedProject,
    getPublicProjects,
    exportCloudData,
    importCloudData,
    markForSync,
    refreshProjects: loadCloudProjects
  }
}
