import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { useState, useCallback, useEffect } from 'react'
import type { HologramProject, SessionData, ViewHistory, StorageStats, DataExport } from './storage'
import { STORAGE_KEYS, generateId, calculateStorageSize } from './storage'

export function useProjects() {
  const [projects, setProjects] = usePlatformKV<HologramProject[]>(STORAGE_KEYS.PROJECTS, [])

  const createProject = useCallback((project: Omit<HologramProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: HologramProject = {
      ...project,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      viewCount: 0,
    }
    setProjects((current) => [...(current || []), newProject])
    return newProject
  }, [setProjects])

  const updateProject = useCallback((id: string, updates: Partial<HologramProject>) => {
    setProjects((current) => 
      (current || []).map(p => 
        p.id === id 
          ? { ...p, ...updates, updatedAt: Date.now() }
          : p
      )
    )
  }, [setProjects])

  const deleteProject = useCallback((id: string) => {
    setProjects((current) => (current || []).filter(p => p.id !== id))
  }, [setProjects])

  const getProject = useCallback((id: string) => {
    return (projects || []).find(p => p.id === id)
  }, [projects])

  const duplicateProject = useCallback((id: string) => {
    const project = (projects || []).find(p => p.id === id)
    if (!project) return null

    const duplicate: HologramProject = {
      ...project,
      id: generateId(),
      name: `${project.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      viewCount: 0,
    }
    setProjects((current) => [...(current || []), duplicate])
    return duplicate
  }, [projects, setProjects])

  const incrementViewCount = useCallback((id: string) => {
    setProjects((current) =>
      (current || []).map(p =>
        p.id === id
          ? { ...p, viewCount: (p.viewCount || 0) + 1, lastViewedAt: Date.now() }
          : p
      )
    )
  }, [setProjects])

  return {
    projects: projects || [],
    createProject,
    updateProject,
    deleteProject,
    getProject,
    duplicateProject,
    incrementViewCount,
  }
}

export function useSessions() {
  const [sessions, setSessions] = usePlatformKV<SessionData[]>(STORAGE_KEYS.SESSIONS, [])
  const [currentSession, setCurrentSession] = usePlatformKV<SessionData | null>(STORAGE_KEYS.CURRENT_SESSION, null)

  const startSession = useCallback(() => {
    const session: SessionData = {
      id: generateId(),
      startTime: Date.now(),
      projectsViewed: [],
      screenshotsTaken: 0,
      recordingsMade: 0,
      totalInteractions: 0,
      featuresUsed: [],
    }
    setCurrentSession(session)
    return session
  }, [setCurrentSession])

  const endSession = useCallback(() => {
    if (!currentSession) return

    const endedSession: SessionData = {
      ...currentSession,
      endTime: Date.now(),
      duration: Date.now() - currentSession.startTime,
    }
    
    setSessions((current) => [...(current || []), endedSession])
    setCurrentSession(null)
  }, [currentSession, setSessions, setCurrentSession])

  const updateCurrentSession = useCallback((updates: Partial<SessionData>) => {
    if (!currentSession) return
    setCurrentSession({ ...currentSession, ...updates })
  }, [currentSession, setCurrentSession])

  const logInteraction = useCallback((feature: string) => {
    if (!currentSession) return
    
    const featuresUsed = currentSession.featuresUsed || []
    if (!featuresUsed.includes(feature)) {
      featuresUsed.push(feature)
    }

    setCurrentSession({
      ...currentSession,
      totalInteractions: (currentSession.totalInteractions || 0) + 1,
      featuresUsed,
    })
  }, [currentSession, setCurrentSession])

  const clearSessions = useCallback(() => {
    setSessions([])
  }, [setSessions])

  return {
    sessions: sessions || [],
    currentSession,
    startSession,
    endSession,
    updateCurrentSession,
    logInteraction,
    clearSessions,
  }
}

export function useViewHistory() {
  const [history, setHistory] = usePlatformKV<ViewHistory[]>(STORAGE_KEYS.HISTORY, [])

  const logView = useCallback((projectId: string, duration: number, actions: string[]) => {
    const view: ViewHistory = {
      projectId,
      timestamp: Date.now(),
      duration,
      actions,
    }
    setHistory((current) => [...(current || []), view])
  }, [setHistory])

  const getProjectHistory = useCallback((projectId: string) => {
    return (history || []).filter(h => h.projectId === projectId)
  }, [history])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [setHistory])

  return {
    history: history || [],
    logView,
    getProjectHistory,
    clearHistory,
  }
}

export function useStorageStats() {
  const { projects } = useProjects()
  const { sessions } = useSessions()
  const [screenshots] = usePlatformKV<string[]>('hologram-screenshot-gallery', [])
  const [favorites] = usePlatformKV<any[]>('hologram-favorites', [])

  const [stats, setStats] = useState<StorageStats>({
    totalProjects: 0,
    totalSessions: 0,
    totalScreenshots: 0,
    totalRecordings: 0,
    storageUsed: 0,
    mostUsedFeature: 'None',
    favoriteObject: 'cube',
    averageSessionDuration: 0,
  })

  useEffect(() => {
    const projectsSize = calculateStorageSize(projects)
    const sessionsSize = calculateStorageSize(sessions)
    const screenshotsSize = calculateStorageSize(screenshots)
    const favoritesSize = calculateStorageSize(favorites)

    const totalSize = projectsSize + sessionsSize + screenshotsSize + favoritesSize

    const objectCounts = projects.reduce((acc, p) => {
      acc[p.config.object] = (acc[p.config.object] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const favoriteObject = Object.entries(objectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'cube'

    const featureCounts = sessions.reduce((acc, s) => {
      s.featuresUsed.forEach(f => {
        acc[f] = (acc[f] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    const mostUsedFeature = Object.entries(featureCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'

    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const averageSessionDuration = sessions.length > 0 ? totalDuration / sessions.length : 0

    setStats({
      totalProjects: projects.length,
      totalSessions: sessions.length,
      totalScreenshots: (screenshots || []).length,
      totalRecordings: 0,
      storageUsed: totalSize,
      mostUsedFeature,
      favoriteObject,
      averageSessionDuration,
    })
  }, [projects, sessions, screenshots, favorites])

  return stats
}

export function useDataExport() {
  const { projects } = useProjects()
  const { sessions } = useSessions()
  const { history } = useViewHistory()
  const [screenshots] = usePlatformKV<string[]>('hologram-screenshot-gallery', [])
  const [favorites] = usePlatformKV<any[]>('hologram-favorites', [])
  const [settings] = usePlatformKV<Record<string, any>>('hologram-all-settings', {})
  
  const [, setProjects] = usePlatformKV<HologramProject[]>(STORAGE_KEYS.PROJECTS, [])
  const [, setSessions] = usePlatformKV<SessionData[]>(STORAGE_KEYS.SESSIONS, [])
  const [, setHistory] = usePlatformKV<ViewHistory[]>(STORAGE_KEYS.HISTORY, [])
  const [, setScreenshots] = usePlatformKV<string[]>('hologram-screenshot-gallery', [])
  const [, setFavorites] = usePlatformKV<any[]>('hologram-favorites', [])

  const exportAllData = useCallback((): DataExport => {
    return {
      version: '1.0.0',
      exportDate: Date.now(),
      projects: projects || [],
      sessions: sessions || [],
      history: history || [],
      screenshots: screenshots || [],
      favorites: favorites || [],
      settings: settings || {},
    }
  }, [projects, sessions, history, screenshots, favorites, settings])

  const importAllData = useCallback((data: DataExport) => {
    setProjects(data.projects || [])
    setSessions(data.sessions || [])
    setHistory(data.history || [])
    setScreenshots(data.screenshots || [])
    setFavorites(data.favorites || [])
  }, [setProjects, setSessions, setHistory, setScreenshots, setFavorites])

  return {
    exportAllData,
    importAllData,
  }
}

export function useAutoBackup(intervalMinutes: number = 30) {
  const { exportAllData } = useDataExport()
  const [backups, setBackups] = usePlatformKV<{ timestamp: number; data: DataExport }[]>(STORAGE_KEYS.BACKUPS, [])
  const [lastBackup, setLastBackup] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const data = exportAllData()
      const backup = {
        timestamp: Date.now(),
        data,
      }
      
      setBackups((current) => {
        const updated = [...(current || []), backup]
        return updated.slice(-10)
      })
      
      setLastBackup(Date.now())
    }, intervalMinutes * 60 * 1000)

    return () => clearInterval(interval)
  }, [intervalMinutes, exportAllData, setBackups])

  const [, setProjectsRestore] = usePlatformKV<HologramProject[]>(STORAGE_KEYS.PROJECTS, [])
  const [, setSessionsRestore] = usePlatformKV<SessionData[]>(STORAGE_KEYS.SESSIONS, [])
  const [, setHistoryRestore] = usePlatformKV<ViewHistory[]>(STORAGE_KEYS.HISTORY, [])
  const [, setScreenshotsRestore] = usePlatformKV<string[]>('hologram-screenshot-gallery', [])
  const [, setFavoritesRestore] = usePlatformKV<any[]>('hologram-favorites', [])

  const restoreBackup = useCallback((timestamp: number) => {
    const backup = (backups || []).find(b => b.timestamp === timestamp)
    if (!backup) return false

    setProjectsRestore(backup.data.projects || [])
    setSessionsRestore(backup.data.sessions || [])
    setHistoryRestore(backup.data.history || [])
    setScreenshotsRestore(backup.data.screenshots || [])
    setFavoritesRestore(backup.data.favorites || [])
    return true
  }, [backups, setProjectsRestore, setSessionsRestore, setHistoryRestore, setScreenshotsRestore, setFavoritesRestore])

  const clearBackups = useCallback(() => {
    setBackups([])
  }, [setBackups])

  return {
    backups: backups || [],
    lastBackup,
    restoreBackup,
    clearBackups,
  }
}
