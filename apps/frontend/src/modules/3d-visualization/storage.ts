export interface HologramProject {
  id: string
  name: string
  description?: string
  thumbnail?: string
  config: {
    object: string
    speed: number
    scale: number
    wireframe: boolean
    glow: number
    colors: string
    animation: string
    ambientLight?: number
    pointLight?: number
    particleDensity?: number
    fog?: boolean
    fogDensity?: number
    materialPreset?: string
    particleEffect?: string
    audioReactivity?: number
    bloom?: boolean
    bloomIntensity?: number
    chromaticAberration?: number
    glitchIntensity?: number
    materialAnimation?: string
    shapeMorph?: string
    environmentPreset?: string
    timeOfDay?: string
    ambientMusic?: string
    musicReactivity?: number
    vertexTrails?: boolean
    trailLength?: number
    trailOpacity?: number
  }
  createdAt: number
  updatedAt: number
  tags?: string[]
  viewCount?: number
  lastViewedAt?: number
}

export interface SessionData {
  id: string
  startTime: number
  endTime?: number
  duration?: number
  projectsViewed: string[]
  screenshotsTaken: number
  recordingsMade: number
  totalInteractions: number
  featuresUsed: string[]
}

export interface ViewHistory {
  projectId: string
  timestamp: number
  duration: number
  actions: string[]
}

export interface StorageStats {
  totalProjects: number
  totalSessions: number
  totalScreenshots: number
  totalRecordings: number
  storageUsed: number
  mostUsedFeature: string
  favoriteObject: string
  averageSessionDuration: number
}

export interface DataExport {
  version: string
  exportDate: number
  projects: HologramProject[]
  sessions: SessionData[]
  history: ViewHistory[]
  screenshots: string[]
  favorites: any[]
  settings: Record<string, any>
}

export const STORAGE_KEYS = {
  PROJECTS: 'hologram-projects',
  SESSIONS: 'hologram-sessions',
  CURRENT_SESSION: 'hologram-current-session',
  HISTORY: 'hologram-history',
  ANALYTICS: 'hologram-analytics',
  PREFERENCES: 'hologram-preferences',
  BACKUPS: 'hologram-backups',
} as const

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function calculateStorageSize(data: any): number {
  return new Blob([JSON.stringify(data)]).size
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function exportData(data: DataExport): Blob {
  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
}

export function sanitizeProjectName(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9\s-_]/g, '').substring(0, 100)
}
