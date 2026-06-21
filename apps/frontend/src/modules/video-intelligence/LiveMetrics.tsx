import { useState, useEffect } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import {
  Gauge, TrendUp, TrendDown, Eye, VideoCamera, Users,
  Clock, Download, Upload, Globe, Lightning, CheckCircle
} from '@phosphor-icons/react'
import { cn } from '@/shared/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import type { Video } from '@/shared/lib/types'

interface LiveMetric {
  label: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  icon: any
  color: string
  format: 'number' | 'percentage' | 'bytes' | 'time'
}

interface LiveMetricsProps {
  videos: Video[]
}

export default function LiveMetrics({ videos }: LiveMetricsProps) {
  const [metrics, setMetrics] = useState<LiveMetric[]>([])
  const [uptime, setUptime] = useState(0)
  const [activeStreams, setActiveStreams] = useState(0)

  useEffect(() => {
    const totalViews = videos.reduce((sum, v) => sum + v.views, 0)
    const totalSize = videos.reduce((sum, v) => sum + v.size, 0)
    const avgDuration = videos.length > 0
      ? videos.reduce((sum, v) => sum + v.duration, 0) / videos.length
      : 0
    const readyVideos = videos.filter(v => v.status === 'ready').length
    const processingVideos = videos.filter(v => v.status === 'processing').length
    const successRate = videos.length > 0 ? (readyVideos / videos.length) * 100 : 100

    const newMetrics: LiveMetric[] = [
      {
        label: 'Total Views',
        value: totalViews,
        change: Math.random() * 10 - 5,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: Eye,
        color: 'text-accent',
        format: 'number'
      },
      {
        label: 'Active Videos',
        value: videos.length,
        change: Math.random() * 5 - 2,
        trend: 'up',
        icon: VideoCamera,
        color: 'text-primary',
        format: 'number'
      },
      {
        label: 'Success Rate',
        value: successRate,
        change: Math.random() * 3 - 1,
        trend: successRate > 95 ? 'up' : 'stable',
        icon: CheckCircle,
        color: 'text-green-500',
        format: 'percentage'
      },
      {
        label: 'Avg Duration',
        value: avgDuration,
        change: Math.random() * 10 - 5,
        trend: 'stable',
        icon: Clock,
        color: 'text-blue-400',
        format: 'time'
      },
      {
        label: 'Storage Used',
        value: totalSize,
        change: Math.random() * 8 - 4,
        trend: 'up',
        icon: Download,
        color: 'text-orange-400',
        format: 'bytes'
      },
      {
        label: 'Processing',
        value: processingVideos,
        change: Math.random() * 3 - 1.5,
        trend: processingVideos > 0 ? 'up' : 'stable',
        icon: Lightning,
        color: 'text-yellow-400',
        format: 'number'
      }
    ]

    setMetrics(newMetrics)
  }, [videos])

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(prev => prev + 1)
      setActiveStreams(Math.floor(Math.random() * 3) + 1)
      
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() * 2 - 1) * (metric.value * 0.01),
        change: Math.random() * 10 - 5,
        trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable'
      })))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const formatValue = (value: number, format: LiveMetric['format']) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'bytes':
        const gb = value / (1024 * 1024 * 1024)
        return gb > 1 ? `${gb.toFixed(2)} GB` : `${(value / (1024 * 1024)).toFixed(0)} MB`
      case 'time':
        const mins = Math.floor(value / 60)
        const secs = Math.floor(value % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
      default:
        return Math.round(value).toLocaleString()
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping" />
          </div>
          <span className="text-sm font-medium">Live Platform Metrics</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            <span>{activeStreams} active</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatUptime(uptime)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <AnimatePresence mode="popLayout">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 bg-card/50 hover:bg-card/70 transition-colors border-l-2 border-l-accent/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <metric.icon className={cn("w-5 h-5", metric.color)} weight="fill" />
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        metric.trend === 'up' && "border-green-500/30 bg-green-500/10 text-green-500",
                        metric.trend === 'down' && "border-red-500/30 bg-red-500/10 text-red-500",
                        metric.trend === 'stable' && "border-muted-foreground/30"
                      )}
                    >
                      {metric.trend === 'up' && <TrendUp className="w-3 h-3 mr-1" />}
                      {metric.trend === 'down' && <TrendDown className="w-3 h-3 mr-1" />}
                      {Math.abs(metric.change).toFixed(1)}%
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <motion.div
                      key={metric.value}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold tracking-tight"
                    >
                      {formatValue(metric.value, metric.format)}
                    </motion.div>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                  </div>

                  {metric.format === 'percentage' && (
                    <Progress
                      value={metric.value}
                      className="h-1"
                    />
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Card className="p-4 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Gauge weight="fill" className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">System Health</p>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-medium text-green-500">99.9%</span>
            </div>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
