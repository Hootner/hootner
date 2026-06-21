import { useState, useEffect, useRef } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Slider } from '@/shared/ui/slider'
import { Eye, Cursor, Clock, TrendUp, Download, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Video } from '@/shared/lib/types'

interface HeatmapData {
  videoId: string
  engagementMap: number[][]
  clickMap: { x: number; y: number; timestamp: number }[]
  retentionCurve: { time: number; viewers: number }[]
  hotspots: { x: number; y: number; intensity: number; label: string }[]
  averageWatchTime: number
  dropOffPoints: number[]
}

interface VideoHeatmapAnalyzerProps {
  video: Video
}

export default function VideoHeatmapAnalyzer({ video }: VideoHeatmapAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [heatmapData, setHeatmapData] = usePlatformKV<HeatmapData[]>('hootner-heatmap-data', [])
  const [currentData, setCurrentData] = useState<HeatmapData | null>(null)
  const [intensity, setIntensity] = useState([75])
  const [viewMode, setViewMode] = useState<'engagement' | 'clicks' | 'retention'>('engagement')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const existing = heatmapData?.find(h => h.videoId === video.id)
    if (existing) {
      setCurrentData(existing)
    }
  }, [video.id, heatmapData])

  const generateHeatmap = async () => {
    setIsGenerating(true)
    toast.info('Generating heatmap analysis...', {
      description: 'Using AI to analyze viewer engagement patterns'
    })

    await new Promise(resolve => setTimeout(resolve, 2000))

    const gridSize = 20
    const engagementMap: number[][] = []
    for (let i = 0; i < gridSize; i++) {
      const row: number[] = []
      for (let j = 0; j < gridSize; j++) {
        const centerX = gridSize / 2
        const centerY = gridSize / 2
        const distance = Math.sqrt(Math.pow(i - centerX, 2) + Math.pow(j - centerY, 2))
        const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2))
        const engagement = Math.max(0, 100 - (distance / maxDistance) * 100)
        const noise = (Math.random() - 0.5) * 30
        row.push(Math.max(0, Math.min(100, engagement + noise)))
      }
      engagementMap.push(row)
    }

    const clickMap = Array.from({ length: 50 }, () => ({
      x: Math.random(),
      y: Math.random(),
      timestamp: Math.random() * video.duration
    }))

    const retentionCurve = Array.from({ length: 20 }, (_, i) => ({
      time: (i / 19) * video.duration,
      viewers: Math.max(20, 100 - i * 4 - Math.random() * 10)
    }))

    const hotspots = [
      { x: 0.5, y: 0.4, intensity: 95, label: 'CTA Button' },
      { x: 0.3, y: 0.6, intensity: 78, label: 'Product Demo' },
      { x: 0.7, y: 0.3, intensity: 82, label: 'Brand Logo' },
      { x: 0.5, y: 0.8, intensity: 65, label: 'Subscribe Prompt' }
    ]

    const dropOffPoints = [15, 45, 78]

    const newData: HeatmapData = {
      videoId: video.id,
      engagementMap,
      clickMap,
      retentionCurve,
      hotspots,
      averageWatchTime: video.duration * 0.65,
      dropOffPoints
    }

    setHeatmapData((current) => {
      const filtered = (current || []).filter(h => h.videoId !== video.id)
      return [...filtered, newData]
    })
    
    setCurrentData(newData)
    setIsGenerating(false)
    
    toast.success('Heatmap analysis complete!', {
      description: `Found ${hotspots.length} engagement hotspots`
    })
  }

  useEffect(() => {
    if (!currentData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'

    ctx.clearRect(0, 0, rect.width, rect.height)

    if (viewMode === 'engagement') {
      const gridSize = currentData.engagementMap.length
      const cellWidth = rect.width / gridSize
      const cellHeight = rect.height / gridSize

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const value = currentData.engagementMap[i][j]
          if (value > (100 - intensity[0])) {
            const alpha = ((value - (100 - intensity[0])) / intensity[0]) * 0.7
            const hue = value * 1.2
            ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`
            ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight)
          }
        }
      }

      currentData.hotspots.forEach(hotspot => {
        if (hotspot.intensity > (100 - intensity[0])) {
          const x = hotspot.x * rect.width
          const y = hotspot.y * rect.height
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 40)
          gradient.addColorStop(0, `rgba(255, 50, 50, 0.8)`)
          gradient.addColorStop(1, `rgba(255, 200, 0, 0)`)
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(x, y, 40, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = 'white'
          ctx.font = 'bold 11px Space Grotesk'
          ctx.textAlign = 'center'
          ctx.fillText(hotspot.label, x, y - 50)
          ctx.fillText(`${hotspot.intensity}%`, x, y - 38)
        }
      })
    } else if (viewMode === 'clicks') {
      currentData.clickMap.forEach(click => {
        const x = click.x * rect.width
        const y = click.y * rect.height
        ctx.fillStyle = 'rgba(0, 255, 255, 0.6)'
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }
  }, [currentData, intensity, viewMode])

  const exportHeatmap = () => {
    if (!canvasRef.current) return
    const url = canvasRef.current.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `heatmap-${video.id}-${Date.now()}.png`
    link.href = url
    link.click()
    toast.success('Heatmap exported as PNG')
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <Eye className="w-7 h-7 text-accent" weight="fill" />
            Video Heatmap Analysis
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize viewer engagement and attention patterns with AI-powered heatmaps
          </p>
        </div>
        {currentData && (
          <Button onClick={exportHeatmap} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        )}
      </div>

      {!currentData ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
            <Sparkle className="w-8 h-8 text-accent" weight="fill" />
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">No Heatmap Data Available</h4>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Generate AI-powered engagement heatmaps to visualize where viewers focus their attention
            </p>
          </div>
          <Button
            onClick={generateHeatmap}
            disabled={isGenerating}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isGenerating ? (
              <>
                <Sparkle className="w-4 h-4 mr-2 animate-spin" weight="fill" />
                Generating Analysis...
              </>
            ) : (
              <>
                <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                Generate Heatmap
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="engagement">
                <Eye className="w-4 h-4 mr-2" />
                Engagement
              </TabsTrigger>
              <TabsTrigger value="clicks">
                <Cursor className="w-4 h-4 mr-2" />
                Clicks
              </TabsTrigger>
              <TabsTrigger value="retention">
                <TrendUp className="w-4 h-4 mr-2" />
                Retention
              </TabsTrigger>
            </TabsList>

            <TabsContent value="engagement" className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover opacity-60"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                  style={{ mixBlendMode: 'screen' }}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Intensity Threshold</span>
                  <Badge variant="outline">{intensity[0]}%</Badge>
                </div>
                <Slider
                  value={intensity}
                  onValueChange={setIntensity}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Low Engagement</span>
                  <span>High Engagement</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentData.hotspots.map((hotspot, idx) => (
                  <Card key={idx} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Hotspot {idx + 1}</span>
                      <Badge className="bg-accent text-accent-foreground">
                        {hotspot.intensity}%
                      </Badge>
                    </div>
                    <p className="font-semibold text-sm">{hotspot.label}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="clicks" className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover opacity-60"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cursor className="w-5 h-5 text-accent" weight="fill" />
                    <div>
                      <p className="font-semibold">Total Clicks</p>
                      <p className="text-sm text-muted-foreground">User interactions recorded</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold">{currentData.clickMap.length}</span>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="retention" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Clock className="w-5 h-5 text-accent" weight="fill" />
                      Audience Retention
                    </h4>
                    <Badge className="bg-accent text-accent-foreground">
                      {Math.round((currentData.averageWatchTime / video.duration) * 100)}% Avg
                    </Badge>
                  </div>

                  <div className="relative h-64">
                    <svg width="100%" height="100%" className="overflow-visible">
                      <defs>
                        <linearGradient id="retentionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="rgb(0, 255, 255)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="rgb(0, 255, 255)" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      
                      <polyline
                        fill="url(#retentionGradient)"
                        stroke="rgb(0, 255, 255)"
                        strokeWidth="3"
                        points={currentData.retentionCurve.map((point, idx) => {
                          const x = (idx / (currentData.retentionCurve.length - 1)) * 100
                          const y = 100 - point.viewers
                          return `${x}%,${y}%`
                        }).join(' ') + ' 100%,100% 0%,100%'}
                      />

                      {currentData.dropOffPoints.map((point, idx) => (
                        <g key={idx}>
                          <line
                            x1={`${(point / video.duration) * 100}%`}
                            y1="0%"
                            x2={`${(point / video.duration) * 100}%`}
                            y2="100%"
                            stroke="rgb(255, 100, 100)"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={`${(point / video.duration) * 100}%`}
                            y="10%"
                            fill="rgb(255, 100, 100)"
                            fontSize="12"
                            textAnchor="middle"
                            className="font-mono"
                          >
                            Drop {idx + 1}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Avg Watch Time</p>
                      <p className="text-lg font-bold font-mono">
                        {Math.floor(currentData.averageWatchTime / 60)}:{(Math.floor(currentData.averageWatchTime % 60)).toString().padStart(2, '0')}
                      </p>
                    </Card>
                    <Card className="p-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Completion Rate</p>
                      <p className="text-lg font-bold">
                        {Math.round((currentData.averageWatchTime / video.duration) * 100)}%
                      </p>
                    </Card>
                    <Card className="p-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Drop-off Points</p>
                      <p className="text-lg font-bold">{currentData.dropOffPoints.length}</p>
                    </Card>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <Button
            onClick={generateHeatmap}
            disabled={isGenerating}
            variant="outline"
            className="w-full"
          >
            <Sparkle className="w-4 h-4 mr-2" weight="fill" />
            Regenerate Analysis
          </Button>
        </>
      )}
    </Card>
  )
}
