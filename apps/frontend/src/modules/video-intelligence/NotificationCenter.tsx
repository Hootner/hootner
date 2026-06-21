import { useState, useEffect } from 'react'
import { Bell, X, Sparkle, UploadSimple, CheckCircle } from '@phosphor-icons/react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: 'upload' | 'insight' | 'success' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const mockNotifications: Notification[] = [
          {
            id: Date.now().toString(),
            type: 'insight',
            title: 'New AI Insights',
            message: 'Video analysis complete for your recent upload',
            timestamp: new Date().toISOString(),
            read: false
          },
          {
            id: Date.now().toString(),
            type: 'upload',
            title: 'Upload Complete',
            message: 'Your video has been processed successfully',
            timestamp: new Date().toISOString(),
            read: false
          },
          {
            id: Date.now().toString(),
            type: 'success',
            title: 'Milestone Reached',
            message: 'Your videos have reached 1,000 views!',
            timestamp: new Date().toISOString(),
            read: false
          }
        ]

        const randomNotif = mockNotifications[Math.floor(Math.random() * mockNotifications.length)]
        setNotifications(prev => [randomNotif, ...prev].slice(0, 20))
        
        toast(randomNotif.title, {
          description: randomNotif.message,
          duration: 3000
        })
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'upload':
        return <UploadSimple weight="fill" className="w-4 h-4 text-blue-400" />
      case 'insight':
        return <Sparkle weight="fill" className="w-4 h-4 text-yellow-400" />
      case 'success':
        return <CheckCircle weight="fill" className="w-4 h-4 text-green-400" />
      default:
        return <Bell weight="fill" className="w-4 h-4 text-accent" />
    }
  }

  const formatTimeAgo = (isoDate: string) => {
    const date = new Date(isoDate)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)

    if (diffSecs < 60) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell weight={unreadCount > 0 ? 'fill' : 'regular'} className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-4 border-b border-border hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-accent/5' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
