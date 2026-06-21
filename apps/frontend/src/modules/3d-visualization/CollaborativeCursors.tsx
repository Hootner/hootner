import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'

interface CursorPosition {
  x: number
  y: number
  userId: string
  userName: string
  color: string
  timestamp: number
}

interface CollaborativeCursorsProps {
  enabled: boolean
  sessionId: string
}

export function CollaborativeCursors({ enabled, sessionId }: CollaborativeCursorsProps) {
  const [localPosition, setLocalPosition] = useState({ x: 0, y: 0 })
  const [remoteCursors, setRemoteCursors] = usePlatformKV<Record<string, CursorPosition>>(`cursors-${sessionId}`, {})
  const [userId] = useState(() => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  const [userColor] = useState(() => {
    const colors = ['#00d9ff', '#ff00ff', '#00ff41', '#ffdd00', '#ff6b00', '#ff1493']
    return colors[Math.floor(Math.random() * colors.length)]
  })

  useEffect(() => {
    if (!enabled || !sessionId) return

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
        userId,
        userName: `User ${userId.slice(-4)}`,
        color: userColor,
        timestamp: Date.now()
      }
      setLocalPosition(newPosition)

      setRemoteCursors((current) => ({
        ...current,
        [userId]: newPosition
      }))
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [enabled, sessionId, userId, userColor])

  useEffect(() => {
    if (!enabled) return

    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      setRemoteCursors((current) => {
        const updated = { ...current }
        Object.keys(updated).forEach((key) => {
          if (now - updated[key].timestamp > 10000) {
            delete updated[key]
          }
        })
        return updated
      })
    }, 5000)

    return () => clearInterval(cleanupInterval)
  }, [enabled])

  if (!enabled || !sessionId) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {Object.entries(remoteCursors || {})
          .filter(([id]) => id !== userId)
          .map(([id, cursor]) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                left: `${cursor.x}%`,
                top: `${cursor.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{ filter: `drop-shadow(0 0 4px ${cursor.color})` }}
              >
                <path
                  d="M5.65376 12.3673L10.6538 17.3673C11.0443 17.7578 11.6775 17.7578 12.068 17.3673L17.068 12.3673C17.4585 11.9768 17.4585 11.3436 17.068 10.9531L12.068 5.95312C11.6775 5.56256 11.0443 5.56256 10.6538 5.95312L5.65376 10.9531C5.26323 11.3436 5.26323 11.9768 5.65376 12.3673Z"
                  fill={cursor.color}
                  stroke="white"
                  strokeWidth="2"
                />
              </svg>
              <div
                className="absolute top-6 left-6 px-2 py-1 rounded text-xs font-bold whitespace-nowrap"
                style={{
                  backgroundColor: cursor.color,
                  color: 'white',
                  boxShadow: `0 0 10px ${cursor.color}`
                }}
              >
                {cursor.userName}
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  )
}
