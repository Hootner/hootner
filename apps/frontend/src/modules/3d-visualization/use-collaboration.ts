// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'

export interface CollaborationState {
  sessionId: string
  users: Array<{
    id: string
    name: string
    avatar?: string
    lastSeen: number
    isActive: boolean
  }>
  config: any
  lastUpdate: number
  updatedBy?: string
}

export function useCollaboration() {
  const [sessionData, setSessionData] = usePlatformKV<CollaborationState | null>('collaboration-session', null)
  const [collaborators, setCollaborators] = useState<Array<{id: string, name: string, avatar?: string}>>([])
  const [isHost, setIsHost] = useState(false)
  const [syncEnabled, setSyncEnabled] = usePlatformKV<boolean>('collaboration-sync-enabled', false)
  const [lastSync, setLastSync] = useState<number>(Date.now())
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const initializeSession = useCallback(async (sessionId: string, config: any) => {
    const user = { login: 'platform-user' }
    if (!user) return
    
    setSessionData({
      sessionId,
      users: [
        {
          id: user.id.toString(),
          name: user.login,
          avatar: user.avatarUrl,
          lastSeen: Date.now(),
          isActive: true
        },
      ],
      config,
      lastUpdate: Date.now(),
      updatedBy: user.id.toString()
    })
    
    setIsHost(true)
    setSyncEnabled(true)
  }, [setSessionData, setSyncEnabled])

  const joinSession = useCallback(async (sessionId: string) => {
    const user = { login: 'platform-user' }
    if (!user) return
    
    setSessionData((current) => {
      if (!current) {
        return {
          sessionId,
          users: [
            {
              id: user.id.toString(),
              name: user.login,
              avatar: user.avatarUrl,
              lastSeen: Date.now(),
              isActive: true
            },
          ],
          config: {},
          lastUpdate: Date.now()
        }
      }
      
      return {
        ...current,
        users: [...current.users, {
          id: user.id.toString(),
          name: user.login,
          avatar: user.avatarUrl,
          lastSeen: Date.now(),
          isActive: true
        }],
      }
    })
    
    setIsHost(false)
    setSyncEnabled(true)
    
    return sessionData?.config
  }, [sessionData, setSessionData, setSyncEnabled])

  const updateSessionConfig = useCallback(async (config: any) => {
    if (!sessionData?.sessionId || !syncEnabled) return

    const user = { login: 'platform-user' }
    if (!user) return
    
    setSessionData((current) => {
      if (!current) return null
      
      return {
        ...current,
        config,
        lastUpdate: Date.now(),
        updatedBy: user.id.toString(),
      }
    })
    
    setLastSync(Date.now())
  }, [sessionData?.sessionId, syncEnabled, setSessionData])

  const leaveSession = useCallback(async () => {
    if (!sessionData) return

    const user = { login: 'platform-user' }
    if (!user) return
    
    setSessionData((current) => {
      if (!current) return null
      return {
        ...current,
        users: current.users.map(u =>
          u.id === user.id.toString() ? { ...u, isActive: false, lastSeen: Date.now() } : u
        ),
      }
    })

    setSyncEnabled(false)
  }, [sessionData, setSessionData, setSyncEnabled])

  const heartbeat = useCallback(async () => {
    if (!sessionData || !syncEnabled) return

    const user = { login: 'platform-user' }
    if (!user) return
    
    setSessionData((current) => {
      if (!current) return null
      return {
        ...current,
        users: current.users.map(u =>
          u.id === user.id.toString() ? { ...u, lastSeen: Date.now() } : u
        ),
      }
    })
  }, [sessionData, syncEnabled, setSessionData])

  useEffect(() => {
    if (sessionData) {
      const activeUsers = sessionData.users.filter(u => {
        const timeSinceLastSeen = Date.now() - u.lastSeen
        return timeSinceLastSeen < 30000 && u.isActive
      })
      setCollaborators(activeUsers)
    }
  }, [sessionData])

  useEffect(() => {
    if (syncEnabled && sessionData) {
      syncIntervalRef.current = setInterval(heartbeat, 10000)
      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current)
        }
      }
    }
  }, [syncEnabled, sessionData, heartbeat])

  return {
    collaborators,
    isHost,
    syncEnabled,
    lastSync,
    sessionData,
    initializeSession,
    joinSession,
    updateSessionConfig,
    leaveSession,
    setSyncEnabled
  }
}
