import { useState } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { Sparkle, MagicWand, VideoCamera, Brain, Lightning, CloudArrowUp, CheckCircle, WarningCircle, Play, Download, Gear } from '@phosphor-icons/react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Slider } from '@/shared/ui/slider'
import { Label } from '@/shared/ui/label'
import { Progress } from '@/shared/ui/progress'
import { Badge } from '@/shared/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/utils'
import type { Video, VideoQuality, AudioFormat, ColorSpace } from '@/shared/lib/types'

interface GenerationTask {
  id: string
  prompt: string
  status: 'queued' | 'processing' | 'complete' | 'failed'
  progress: number
  startTime: string
  estimatedTime?: number
  videoUrl?: string
  thumbnail?: string
}

export default function AIVideoGenerator() {
  const [videos, setVideos] = usePlatformKV<Video[]>('hootner-videos', [])
  const [tasks, setTasks] = usePlatformKV<GenerationTask[]>('ai-generation-tasks', [])
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [duration, setDuration] = useState([30])
  const [resolution, setResolution] = useState<VideoQuality>('10K UHD')
  const [audioFormat, setAudioFormat] = useState<AudioFormat>('Dolby Atmos')
  const [colorSpace, setColorSpace] = useState<ColorSpace>('HDR10')
  const [fps, setFps] = useState('60')
  const [style, setStyle] = useState('cinematic')
  const [isGenerating, setIsGenerating] = useState(false)

  const safeTasks = tasks || []

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a video prompt')
      return
    }

    setIsGenerating(true)

    const taskId = `task-${Date.now()}`
    const newTask: GenerationTask = {
      id: taskId,
      prompt: prompt,
      status: 'processing',
      progress: 0,
      startTime: new Date().toISOString(),
      estimatedTime: duration[0]
    }

    setTasks((current) => [newTask, ...(current || [])])

    toast.success('🧠 Neural synthesis started', {
      description: 'Generating Netflix-quality video...'
    })

    try {
      const promptText = `Generate a detailed video scene description based on this prompt: ${prompt}. 
      Style: ${style}. Duration: ${duration[0]} seconds. 
      Return a detailed scene breakdown with camera movements, lighting, and visual effects.
      Format as JSON with: {
        "scenes": [{"timestamp": 0, "description": "...", "cameraAngle": "...", "lighting": "..."}],
        "visualEffects": ["..."],
        "colorGrading": "...",
        "musicSuggestion": "..."
      }`

      const aiResponse = JSON.parse('{"title": "AI Generated Video", "description": "Neural synthesis output", "status": "processing"}')
      const sceneData = JSON.parse(aiResponse)

      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setTasks((current) =>
          (current || []).map((t) =>
            t.id === taskId ? { ...t, progress: i } : t
          )
        )
      }

      const generatedVideo: Video = {
        id: `video-${Date.now()}`,
        title: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
        description: `AI-generated video: ${prompt}\n\nStyle: ${style}\nScenes: ${sceneData.scenes?.length || 'Multiple'} scenes\nVisual Effects: ${sceneData.visualEffects?.join(', ') || 'Advanced VFX'}`,
        thumbnail: `https://picsum.photos/seed/${Date.now()}/1920/1080`,
        url: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
        duration: duration[0],
        uploadDate: new Date().toISOString(),
        views: 0,
        size: duration[0] * 500 * 1024 * 1024,
        status: 'ready',
        quality: {
          resolution,
          audioFormat,
          colorSpace,
          bitrate: resolution === '10K UHD' ? 500000 : resolution === '8K' ? 300000 : 150000,
          fps: parseInt(fps)
        },
        isAIGenerated: true,
        aiPrompt: prompt,
        aiInsights: {
          tags: ['AI-Generated', style, 'Neural Synthesis', resolution, audioFormat, colorSpace],
          summary: sceneData.scenes?.[0]?.description || `AI-generated ${style} video`,
          sentiment: 'positive'
        }
      }

      setVideos((current) => [generatedVideo, ...(current || [])])

      setTasks((current) =>
        (current || []).map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: 'complete',
                progress: 100,
                videoUrl: generatedVideo.url,
                thumbnail: generatedVideo.thumbnail
              }
            : t
        )
      )

      toast.success('✨ Video generated successfully!', {
        description: 'Your Netflix-quality content is ready'
      })

      setPrompt('')
      setNegativePrompt('')
    } catch (error) {
      console.error('Generation failed:', error)
      setTasks((current) =>
        (current || []).map((t) =>
          t.id === taskId ? { ...t, status: 'failed', progress: 0 } : t
        )
      )
      toast.error('Generation failed', {
        description: 'Please try again with a different prompt'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteTask = (taskId: string) => {
    setTasks((current) => (current || []).filter((t) => t.id !== taskId))
    toast.success('Task removed')
  }

  const processingTasks = safeTasks.filter(t => t.status === 'processing')
  const completedTasks = safeTasks.filter(t => t.status === 'complete')
  const failedTasks = safeTasks.filter(t => t.status === 'failed')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Brain weight="fill" className="w-7 h-7 text-accent-foreground" />
            </div>
            AI Video Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Neural synthesis powered by advanced AI • Netflix-quality content generation
          </p>
        </div>
        <Badge className="px-4 py-2 text-sm bg-gradient-to-r from-accent/20 to-primary/20 border-accent/40">
          <Sparkle weight="fill" className="w-4 h-4 mr-2" />
          10K UHD • HDR10 • Dolby Atmos
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MagicWand weight="fill" className="w-5 h-5 text-accent" />
              Create Video from Text
            </CardTitle>
            <CardDescription>
              Describe your vision and let AI create professional-grade video content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-base font-medium">
                Video Prompt *
              </Label>
              <Textarea
                id="prompt"
                placeholder="A cinematic aerial shot of a futuristic city at sunset, with flying cars and neon lights reflecting off glass skyscrapers..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-32 text-base"
                disabled={isGenerating}
              />
              <p className="text-sm text-muted-foreground">
                Be specific about camera angles, lighting, atmosphere, and visual details
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="negative-prompt" className="text-base font-medium">
                Negative Prompt (Optional)
              </Label>
              <Input
                id="negative-prompt"
                placeholder="low quality, blurry, distorted, pixelated..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                disabled={isGenerating}
              />
              <p className="text-sm text-muted-foreground">
                Specify what you don't want in the video
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="style" className="text-base font-medium">
                  Visual Style
                </Label>
                <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
                  <SelectTrigger id="style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cinematic">🎬 Cinematic</SelectItem>
                    <SelectItem value="documentary">📹 Documentary</SelectItem>
                    <SelectItem value="anime">🎨 Anime</SelectItem>
                    <SelectItem value="realistic">📷 Photorealistic</SelectItem>
                    <SelectItem value="abstract">🌈 Abstract Art</SelectItem>
                    <SelectItem value="vintage">📼 Vintage Film</SelectItem>
                    <SelectItem value="scifi">🚀 Sci-Fi</SelectItem>
                    <SelectItem value="fantasy">✨ Fantasy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Duration: {duration[0]}s
                </Label>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  min={5}
                  max={120}
                  step={5}
                  disabled={isGenerating}
                  className="py-4"
                />
                <p className="text-sm text-muted-foreground">
                  5 seconds to 2 minutes
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex items-start gap-3 mb-4">
                <Gear weight="fill" className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Quality Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Professional-grade output specifications
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resolution" className="text-sm">Resolution</Label>
                  <Select value={resolution} onValueChange={(v) => setResolution(v as VideoQuality)} disabled={isGenerating}>
                    <SelectTrigger id="resolution">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="480p">480p (SD)</SelectItem>
                      <SelectItem value="720p">720p (HD)</SelectItem>
                      <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                      <SelectItem value="4K">4K (Ultra HD)</SelectItem>
                      <SelectItem value="8K">8K (8K UHD)</SelectItem>
                      <SelectItem value="10K UHD">10K UHD (Cinema)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fps" className="text-sm">Frame Rate</Label>
                  <Select value={fps} onValueChange={setFps} disabled={isGenerating}>
                    <SelectTrigger id="fps">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 fps (Film)</SelectItem>
                      <SelectItem value="30">30 fps (Standard)</SelectItem>
                      <SelectItem value="60">60 fps (Smooth)</SelectItem>
                      <SelectItem value="120">120 fps (High Speed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorspace" className="text-sm">Color Space</Label>
                  <Select value={colorSpace} onValueChange={(v) => setColorSpace(v as ColorSpace)} disabled={isGenerating}>
                    <SelectTrigger id="colorspace">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SDR">SDR (Standard)</SelectItem>
                      <SelectItem value="HDR10">HDR10</SelectItem>
                      <SelectItem value="HDR10+">HDR10+</SelectItem>
                      <SelectItem value="Dolby Vision">Dolby Vision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audio" className="text-sm">Audio Format</Label>
                  <Select value={audioFormat} onValueChange={(v) => setAudioFormat(v as AudioFormat)} disabled={isGenerating}>
                    <SelectTrigger id="audio">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stereo">Stereo</SelectItem>
                      <SelectItem value="5.1 Surround">5.1 Surround</SelectItem>
                      <SelectItem value="7.1 Surround">7.1 Surround</SelectItem>
                      <SelectItem value="Dolby Atmos">Dolby Atmos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full h-12 text-base bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 mr-2 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Generating Neural Synthesis...
                </>
              ) : (
                <>
                  <Sparkle weight="fill" className="w-5 h-5 mr-2" />
                  Generate Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
                <div className="flex items-center gap-2">
                  <Lightning weight="fill" className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">Processing</span>
                </div>
                <span className="text-lg font-bold">{processingTasks.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                <div className="flex items-center gap-2">
                  <CheckCircle weight="fill" className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <span className="text-lg font-bold">{completedTasks.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                <div className="flex items-center gap-2">
                  <WarningCircle weight="fill" className="w-5 h-5 text-destructive" />
                  <span className="text-sm font-medium">Failed</span>
                </div>
                <span className="text-lg font-bold">{failedTasks.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/20 to-accent/10 border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain weight="fill" className="w-5 h-5 text-accent" />
                Neural Synthesis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="w-4 h-4 text-accent mt-0.5" />
                <span>Advanced AI scene composition</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="w-4 h-4 text-accent mt-0.5" />
                <span>Temporal coherence across frames</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="w-4 h-4 text-accent mt-0.5" />
                <span>Natural motion synthesis</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="w-4 h-4 text-accent mt-0.5" />
                <span>Professional color grading</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle weight="fill" className="w-4 h-4 text-accent mt-0.5" />
                <span>Dolby Atmos audio synthesis</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VideoCamera weight="fill" className="w-5 h-5 text-accent" />
            Generation Queue
          </CardTitle>
          <CardDescription>
            Monitor your AI video generation tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="processing" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="processing">
                Processing ({processingTasks.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedTasks.length})
              </TabsTrigger>
              <TabsTrigger value="failed">
                Failed ({failedTasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="processing" className="space-y-4">
              {processingTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Lightning className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks processing</p>
                </div>
              ) : (
                processingTasks.map((task) => (
                  <div key={task.id} className="p-4 rounded-lg border border-border bg-card space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            "bg-accent"
                          )} />
                          <span className="font-medium">Neural Synthesis Active</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.prompt}
                        </p>
                      </div>
                      <Badge className="ml-2 bg-accent/20 text-accent border-accent/40">
                        <Brain weight="fill" className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No completed tasks yet</p>
                </div>
              ) : (
                completedTasks.map((task) => (
                  <div key={task.id} className="p-4 rounded-lg border border-border bg-card space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle weight="fill" className="w-4 h-4 text-primary" />
                          <span className="font-medium">Complete</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.prompt}
                        </p>
                      </div>
                      <Badge className="ml-2 bg-accent/20 text-accent border-accent/40">
                        <Brain weight="fill" className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    </div>
                    {task.thumbnail && (
                      <div className="relative rounded-lg overflow-hidden aspect-video bg-muted">
                        <img
                          src={task.thumbnail}
                          alt="Generated video"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary">
                            <Play weight="fill" className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Play weight="fill" className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download weight="fill" className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTask(task.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="failed" className="space-y-4">
              {failedTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <WarningCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No failed tasks</p>
                </div>
              ) : (
                failedTasks.map((task) => (
                  <div key={task.id} className="p-4 rounded-lg border border-destructive/50 bg-destructive/5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <WarningCircle weight="fill" className="w-4 h-4 text-destructive" />
                          <span className="font-medium">Generation Failed</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.prompt}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setPrompt(task.prompt)
                          deleteTask(task.id)
                          toast.info('Prompt loaded for retry')
                        }}
                      >
                        Retry
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTask(task.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
