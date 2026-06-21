import { useState, useEffect } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { UploadSimple, Eye, Sparkle, TrendUp, Clock } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'

interface Activity {
  id: string
  type: 'upload' | 'view' | 'insight' | 'trending'
  videoTitle: string
  timestamp: string
  details?: string
}

export default function ActivityFeed() {
  const [activities, setActivities] = usePlatformKV<Activity[]>('hootner-activities', [])
  const [liveUpdate, setLiveUpdate] = useState<Activity | null>(null)

  const safeActivities = activities || []

  useEffect(() => {
    const interval = setInterval(() => {
      if (safeActivities.length > 0 && Math.random() > 0.7) {
        const randomActivity = safeActivities[Math.floor(Math.random() * safeActivities.length)]
        const simulatedActivity: Activity = {
          ...randomActivity,
          id: Date.now().toString(),
          timestamp: new Date().toISOString()
        }
        setLiveUpdate(simulatedActivity)
        setTimeout(() => setLiveUpdate(null), 3000)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [safeActivities])

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'upload':
        return <UploadSimple weight="fill" className="w-4 h-4 text-accent" />
      case 'view':
        return <Eye weight="fill" className="w-4 h-4 text-blue-400" />
      case 'insight':
        return <Sparkle weight="fill" className="w-4 h-4 text-yellow-400" />
      case 'trending':
        return <TrendUp weight="fill" className="w-4 h-4 text-green-400" />
    }
  }

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'upload':
        return 'New video uploaded'
      case 'view':
        return 'Video viewed'
      case 'insight':
        return 'AI insights generated'
      case 'trending':
        return 'Video trending'
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
    <Card className="bg-card border-border h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock weight="fill" className="w-5 h-5" />
          Live Activity
        </CardTitle>
        <CardDescription>Real-time platform updates</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6">
          <AnimatePresence>
            {liveUpdate && (
              <motion.div
                key={liveUpdate.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/30"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    {getActivityIcon(liveUpdate.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{getActivityText(liveUpdate)}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {liveUpdate.videoTitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Live
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(liveUpdate.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4 pb-4">
            {safeActivities.slice(0, 10).map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{getActivityText(activity)}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.videoTitle}
                  </p>
                  {activity.details && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.details}
                    </p>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {safeActivities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload videos to see live updates
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
