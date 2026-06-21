import { useState, useEffect } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { 
  ChartBar, Eye, Clock, TrendUp, TrendDown, 
  Fire, Target, Users, MapPin, Download, Calendar
} from '@phosphor-icons/react'
import { cn } from '@/shared/lib/utils'
import type { Video } from '@/shared/lib/types'

interface HeatmapData {
  videoId: string
  timeSegments: TimeSegment[]
  clickMap: ClickPoint[]
  engagementScore: number
  dropOffPoints: number[]
  rewatchedSegments: number[]
}

interface TimeSegment {
  startTime: number
  endTime: number
  views: number
  engagement: number
  avgWatchTime: number
}

interface ClickPoint {
  x: number
  y: number
  timestamp: number
  action: 'play' | 'pause' | 'seek' | 'click'
}

interface ViewerMetrics {
  totalViewers: number
  avgWatchTime: number
  completionRate: number
  engagementRate: number
  peakViewers: number
  peakTime: string
}

interface GeographicData {
  country: string
  views: number
  avgEngagement: number
}

export default function AdvancedAnalyticsDashboard() {
  const [videos] = usePlatformKV<Video[]>('hootner-videos', [])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [heatmapData, setHeatmapData] = usePlatformKV<Record<string, HeatmapData>>('hootner-heatmap-data', {})
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (videos && videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos[0])
    }
  }, [videos, selectedVideo])

  useEffect(() => {
    if (selectedVideo && heatmapData && !heatmapData[selectedVideo.id]) {
      generateHeatmapData(selectedVideo.id)
    }
  }, [selectedVideo, heatmapData])

  const generateHeatmapData = async (videoId: string) => {
    setIsGenerating(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))

    const segments: TimeSegment[] = []
    const video = videos?.find(v => v.id === videoId)
    if (!video) return

    const segmentCount = Math.floor(video.duration / 10)
    
    for (let i = 0; i < segmentCount; i++) {
      segments.push({
        startTime: i * 10,
        endTime: (i + 1) * 10,
        views: Math.floor(Math.random() * video.views * 0.8) + Math.floor(video.views * 0.2),
        engagement: Math.random() * 100,
        avgWatchTime: Math.random() * 10
      })
    }

    const clickPoints: ClickPoint[] = []
    for (let i = 0; i < 50; i++) {
      clickPoints.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        timestamp: Math.random() * video.duration,
        action: ['play', 'pause', 'seek', 'click'][Math.floor(Math.random() * 4)] as ClickPoint['action']
      })
    }

    const dropOffPoints = [
      video.duration * 0.15,
      video.duration * 0.45,
      video.duration * 0.75
    ]

    const rewatchedSegments = [
      video.duration * 0.25,
      video.duration * 0.60
    ]

    const newHeatmap: HeatmapData = {
      videoId,
      timeSegments: segments,
      clickMap: clickPoints,
      engagementScore: Math.random() * 40 + 60,
      dropOffPoints,
      rewatchedSegments
    }

    setHeatmapData((prev = {}) => ({
      ...prev,
      [videoId]: newHeatmap
    }))

    setIsGenerating(false)
  }

  const calculateMetrics = (): ViewerMetrics => {
    if (!selectedVideo) {
      return {
        totalViewers: 0,
        avgWatchTime: 0,
        completionRate: 0,
        engagementRate: 0,
        peakViewers: 0,
        peakTime: 'N/A'
      }
    }

    const heatmap = heatmapData ? heatmapData[selectedVideo.id] : null
    
    return {
      totalViewers: selectedVideo.views,
      avgWatchTime: heatmap ? 
        heatmap.timeSegments.reduce((acc, seg) => acc + seg.avgWatchTime, 0) / heatmap.timeSegments.length : 
        selectedVideo.duration * 0.65,
      completionRate: Math.random() * 30 + 60,
      engagementRate: heatmap?.engagementScore || Math.random() * 40 + 60,
      peakViewers: Math.floor(selectedVideo.views * 0.15),
      peakTime: '14:30'
    }
  }

  const generateGeographicData = (): GeographicData[] => {
    return [
      { country: 'United States', views: Math.floor(Math.random() * 5000) + 10000, avgEngagement: 78 },
      { country: 'United Kingdom', views: Math.floor(Math.random() * 3000) + 5000, avgEngagement: 82 },
      { country: 'Germany', views: Math.floor(Math.random() * 2000) + 4000, avgEngagement: 75 },
      { country: 'France', views: Math.floor(Math.random() * 2000) + 3500, avgEngagement: 71 },
      { country: 'Canada', views: Math.floor(Math.random() * 1500) + 3000, avgEngagement: 80 },
      { country: 'Australia', views: Math.floor(Math.random() * 1000) + 2500, avgEngagement: 85 },
      { country: 'Japan', views: Math.floor(Math.random() * 1000) + 2000, avgEngagement: 88 },
      { country: 'Brazil', views: Math.floor(Math.random() * 800) + 1800, avgEngagement: 73 },
    ]
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const metrics = calculateMetrics()
  const geoData = generateGeographicData()
  const currentHeatmap = selectedVideo && heatmapData ? heatmapData[selectedVideo.id] : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advanced Analytics</h2>
          <p className="text-muted-foreground">Engagement heatmaps and viewer insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ChartBar className="w-5 h-5 text-accent" />
            Select Video
          </h3>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {!videos || videos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No videos available
                </p>
              ) : (
                videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={cn(
                      'w-full p-3 rounded-lg border transition-all hover:border-accent hover:bg-accent/5 text-left',
                      selectedVideo?.id === video.id && 'border-accent bg-accent/10'
                    )}
                  >
                    <div className="aspect-video bg-muted rounded overflow-hidden mb-2">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-medium truncate mb-1">{video.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      <span>{video.views.toLocaleString()}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-accent" />
                <Badge variant="outline" className="text-xs">
                  <TrendUp className="w-3 h-3 mr-1" />
                  +12%
                </Badge>
              </div>
              <p className="text-3xl font-bold">{metrics.totalViewers.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Viewers</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-accent" />
                <Badge variant="outline" className="text-xs">
                  <TrendUp className="w-3 h-3 mr-1" />
                  +8%
                </Badge>
              </div>
              <p className="text-3xl font-bold">{formatTime(metrics.avgWatchTime)}</p>
              <p className="text-sm text-muted-foreground">Avg Watch Time</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-accent" />
                <Badge variant="outline" className="text-xs">
                  <TrendDown className="w-3 h-3 mr-1" />
                  -3%
                </Badge>
              </div>
              <p className="text-3xl font-bold">{metrics.completionRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </Card>
          </div>

          {!selectedVideo ? (
            <Card className="p-12">
              <div className="text-center">
                <ChartBar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Select a Video</p>
                <p className="text-sm text-muted-foreground">Choose a video to view detailed analytics</p>
              </div>
            </Card>
          ) : (
            <Tabs defaultValue="heatmap" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="heatmap">Engagement Heatmap</TabsTrigger>
                <TabsTrigger value="timeline">Timeline Analysis</TabsTrigger>
                <TabsTrigger value="geography">Geographic Data</TabsTrigger>
                <TabsTrigger value="behavior">Viewer Behavior</TabsTrigger>
              </TabsList>

              <TabsContent value="heatmap" className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Click & Engagement Heatmap</h3>
                    <Badge variant="secondary">
                      Score: {currentHeatmap?.engagementScore.toFixed(1) || 'N/A'}
                    </Badge>
                  </div>
                  
                  {isGenerating ? (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Generating heatmap...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden">
                      {currentHeatmap?.clickMap.map((point, i) => (
                        <div
                          key={i}
                          className="absolute w-3 h-3 rounded-full animate-pulse"
                          style={{
                            left: `${point.x}%`,
                            top: `${point.y}%`,
                            backgroundColor: point.action === 'click' ? 'rgba(255, 100, 100, 0.6)' :
                                           point.action === 'play' ? 'rgba(100, 255, 100, 0.6)' :
                                           point.action === 'pause' ? 'rgba(255, 255, 100, 0.6)' :
                                           'rgba(100, 100, 255, 0.6)',
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-4 text-xs text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/60" />
                            <span>Clicks</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500/60" />
                            <span>Play</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                            <span>Pause</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500/60" />
                            <span>Seek</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-accent">{currentHeatmap?.clickMap.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Total Interactions</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-accent">{metrics.peakViewers}</p>
                      <p className="text-xs text-muted-foreground">Peak Concurrent</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-accent">{metrics.engagementRate.toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Engagement Rate</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Engagement Over Time</h3>
                  
                  {currentHeatmap && (
                    <div className="space-y-2">
                      {currentHeatmap.timeSegments.map((segment, i) => {
                        const maxViews = Math.max(...currentHeatmap.timeSegments.map(s => s.views))
                        const percentage = (segment.views / maxViews) * 100
                        
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground font-mono">
                                {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                              </span>
                              <span className="font-medium">{segment.views} views</span>
                            </div>
                            <div className="h-8 bg-muted rounded-lg overflow-hidden relative">
                              <div
                                className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                                {segment.engagement.toFixed(1)}% engagement
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {currentHeatmap && currentHeatmap.dropOffPoints.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <TrendDown className="w-4 h-4 text-destructive" />
                        Drop-off Points
                      </h4>
                      <div className="space-y-2">
                        {currentHeatmap.dropOffPoints.map((point, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                            <span className="text-sm font-medium">At {formatTime(point)}</span>
                            <Badge variant="destructive">High drop-off</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentHeatmap && currentHeatmap.rewatchedSegments.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Fire className="w-4 h-4 text-accent" />
                        Most Rewatched Segments
                      </h4>
                      <div className="space-y-2">
                        {currentHeatmap.rewatchedSegments.map((point, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20">
                            <span className="text-sm font-medium">Around {formatTime(point)}</span>
                            <Badge className="bg-accent text-accent-foreground">Popular</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="geography" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    Geographic Distribution
                  </h3>
                  
                  <div className="space-y-3">
                    {geoData.map((location, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold">
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-medium">{location.country}</p>
                              <p className="text-xs text-muted-foreground">
                                {location.views.toLocaleString()} views
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">{location.avgEngagement}% engaged</Badge>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-primary"
                            style={{ width: `${(location.views / geoData[0].views) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="behavior" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Viewing Patterns</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Desktop</span>
                          <span className="text-sm font-medium">62%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: '62%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Mobile</span>
                          <span className="text-sm font-medium">28%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: '28%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Tablet</span>
                          <span className="text-sm font-medium">10%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-secondary" style={{ width: '10%' }} />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Peak Viewing Times</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-accent" />
                          <span className="text-sm font-medium">Monday</span>
                        </div>
                        <span className="text-sm text-muted-foreground">14:00 - 16:00</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">Wednesday</span>
                        </div>
                        <span className="text-sm text-muted-foreground">19:00 - 21:00</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">Saturday</span>
                        </div>
                        <span className="text-sm text-muted-foreground">11:00 - 13:00</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
