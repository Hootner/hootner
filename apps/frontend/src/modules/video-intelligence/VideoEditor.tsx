import { useState, useRef, useEffect } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Slider } from '@/shared/ui/slider'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Separator } from '@/shared/ui/separator'
import { 
  Scissors, Play, Pause, SkipBack, SkipForward, 
  Download, Sparkle, MagicWand, FilmSlate, 
  Waveform, Palette, Subtitles, Lightning, X
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/utils'
import type { Video } from '@/shared/lib/types'

interface VideoProject {
  id: string
  videoId: string
  title: string
  clips: VideoClip[]
  transitions: Transition[]
  effects: Effect[]
  createdAt: string
  lastModified: string
}

interface VideoClip {
  id: string
  startTime: number
  endTime: number
  duration: number
  position: number
}

interface Transition {
  id: string
  type: 'fade' | 'dissolve' | 'wipe' | 'slide'
  duration: number
  position: number
}

interface Effect {
  id: string
  type: 'blur' | 'brightness' | 'contrast' | 'saturation' | 'vignette' | 'grain'
  intensity: number
  startTime: number
  endTime: number
}

export default function VideoEditor() {
  const [videos] = usePlatformKV<Video[]>('hootner-videos', [])
  const [projects, setProjects] = usePlatformKV<VideoProject[]>('hootner-video-projects', [])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [currentProject, setCurrentProject] = useState<VideoProject | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [selectedClip, setSelectedClip] = useState<VideoClip | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)

  const availableEffects = [
    { type: 'blur', name: 'Blur', icon: Sparkle },
    { type: 'brightness', name: 'Brightness', icon: Lightning },
    { type: 'contrast', name: 'Contrast', icon: Palette },
    { type: 'saturation', name: 'Saturation', icon: Palette },
    { type: 'vignette', name: 'Vignette', icon: MagicWand },
    { type: 'grain', name: 'Film Grain', icon: FilmSlate },
  ]

  const availableTransitions = [
    { type: 'fade', name: 'Fade', duration: 0.5 },
    { type: 'dissolve', name: 'Dissolve', duration: 0.8 },
    { type: 'wipe', name: 'Wipe', duration: 0.6 },
    { type: 'slide', name: 'Slide', duration: 0.7 },
  ]

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    
    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    
    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [selectedVideo])

  const createNewProject = (video: Video) => {
    const newProject: VideoProject = {
      id: `project-${Date.now()}`,
      videoId: video.id,
      title: `${video.title} - Edit`,
      clips: [{
        id: `clip-${Date.now()}`,
        startTime: 0,
        endTime: video.duration,
        duration: video.duration,
        position: 0
      }],
      transitions: [],
      effects: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    
    setProjects((prev = []) => [...prev, newProject])
    setCurrentProject(newProject)
    setSelectedVideo(video)
    toast.success('Project created')
  }

  const togglePlayPause = () => {
    if (!videoRef.current) return
    
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const skipBackward = () => {
    seekTo(Math.max(0, currentTime - 5))
  }

  const skipForward = () => {
    seekTo(Math.min(duration, currentTime + 5))
  }

  const splitClip = () => {
    if (!currentProject || !selectedClip) return

    const newClip1: VideoClip = {
      ...selectedClip,
      id: `clip-${Date.now()}-1`,
      endTime: currentTime,
      duration: currentTime - selectedClip.startTime
    }

    const newClip2: VideoClip = {
      id: `clip-${Date.now()}-2`,
      startTime: currentTime,
      endTime: selectedClip.endTime,
      duration: selectedClip.endTime - currentTime,
      position: selectedClip.position + newClip1.duration
    }

    const updatedProject = {
      ...currentProject,
      clips: [
        ...currentProject.clips.filter(c => c.id !== selectedClip.id),
        newClip1,
        newClip2
      ],
      lastModified: new Date().toISOString()
    }

    setProjects((prev = []) => prev.map(p => p.id === currentProject.id ? updatedProject : p))
    setCurrentProject(updatedProject)
    setSelectedClip(newClip1)
    toast.success('Clip split successfully')
  }

  const addEffect = (effectType: string) => {
    if (!currentProject || !selectedClip) {
      toast.error('Select a clip first')
      return
    }

    const newEffect: Effect = {
      id: `effect-${Date.now()}`,
      type: effectType as Effect['type'],
      intensity: 50,
      startTime: selectedClip.startTime,
      endTime: selectedClip.endTime
    }

    const updatedProject = {
      ...currentProject,
      effects: [...currentProject.effects, newEffect],
      lastModified: new Date().toISOString()
    }

    setProjects((prev = []) => prev.map(p => p.id === currentProject.id ? updatedProject : p))
    setCurrentProject(updatedProject)
    toast.success(`${effectType} effect added`)
  }

  const addTransition = (transitionType: string, transitionDuration: number) => {
    if (!currentProject || currentProject.clips.length < 2) {
      toast.error('Need at least 2 clips for transitions')
      return
    }

    const newTransition: Transition = {
      id: `transition-${Date.now()}`,
      type: transitionType as Transition['type'],
      duration: transitionDuration,
      position: currentProject.clips[0].duration
    }

    const updatedProject = {
      ...currentProject,
      transitions: [...currentProject.transitions, newTransition],
      lastModified: new Date().toISOString()
    }

    setProjects((prev = []) => prev.map(p => p.id === currentProject.id ? updatedProject : p))
    setCurrentProject(updatedProject)
    toast.success(`${transitionType} transition added`)
  }

  const exportVideo = async () => {
    if (!currentProject) return

    setIsProcessing(true)
    toast.loading('Exporting video...', { id: 'export' })

    await new Promise(resolve => setTimeout(resolve, 3000))

    toast.success('Video exported successfully!', { id: 'export' })
    setIsProcessing(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Video Editor</h2>
          <p className="text-muted-foreground">Professional timeline-based editing</p>
        </div>
        {currentProject && (
          <Button onClick={exportVideo} disabled={isProcessing} className="gap-2">
            <Download className="w-4 h-4" />
            Export Video
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FilmSlate className="w-5 h-5 text-accent" />
            Video Library
          </h3>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {!videos || videos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No videos available
                </p>
              ) : (
                videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => createNewProject(video)}
                    className={cn(
                      'w-full p-3 rounded-lg border transition-all hover:border-accent hover:bg-accent/5',
                      selectedVideo?.id === video.id && 'border-accent bg-accent/10'
                    )}
                  >
                    <div className="aspect-video bg-muted rounded overflow-hidden mb-2">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-medium truncate">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(video.duration)}</p>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card className="lg:col-span-3 p-6">
          {!currentProject ? (
            <div className="flex items-center justify-center h-[600px] border-2 border-dashed border-border rounded-lg">
              <div className="text-center">
                <FilmSlate className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No Project Selected</p>
                <p className="text-sm text-muted-foreground mb-4">Select a video to start editing</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
                {selectedVideo && (
                  <video
                    ref={videoRef}
                    src={selectedVideo.url}
                    className="w-full h-full"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                )}
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={skipBackward}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipBack className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={togglePlayPause}
                      className="text-white"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={skipForward}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipForward className="w-5 h-5" />
                    </Button>
                    <span className="text-white text-sm font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  
                  <Slider
                    value={[currentTime]}
                    max={duration}
                    step={0.1}
                    onValueChange={([value]) => seekTo(value)}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="effects">Effects</TabsTrigger>
                  <TabsTrigger value="transitions">Transitions</TabsTrigger>
                  <TabsTrigger value="export">Export</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Button onClick={splitClip} disabled={!selectedClip} className="gap-2">
                      <Scissors className="w-4 h-4" />
                      Split at Playhead
                    </Button>
                    <Badge variant="outline">{currentProject.clips.length} clips</Badge>
                  </div>

                  <Card className="p-4 bg-muted/50">
                    <div className="space-y-2">
                      {currentProject.clips.map((clip) => (
                        <button
                          key={clip.id}
                          onClick={() => setSelectedClip(clip)}
                          className={cn(
                            'w-full p-3 rounded border transition-all hover:border-accent',
                            selectedClip?.id === clip.id && 'border-accent bg-accent/10'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FilmSlate className="w-5 h-5 text-accent" />
                              <div className="text-left">
                                <p className="text-sm font-medium">Clip {currentProject.clips.indexOf(clip) + 1}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary">{formatTime(clip.duration)}</Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="effects" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableEffects.map((effect) => (
                      <Button
                        key={effect.type}
                        onClick={() => addEffect(effect.type)}
                        variant="outline"
                        className="h-auto flex-col gap-2 p-4"
                      >
                        <effect.icon className="w-6 h-6 text-accent" />
                        <span className="text-sm">{effect.name}</span>
                      </Button>
                    ))}
                  </div>

                  {currentProject.effects.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Applied Effects</h4>
                        {currentProject.effects.map((effect) => (
                          <Card key={effect.id} className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium capitalize">{effect.type}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatTime(effect.startTime)} - {formatTime(effect.endTime)}
                                </p>
                              </div>
                              <Badge variant="secondary">{effect.intensity}%</Badge>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="transitions" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableTransitions.map((transition) => (
                      <Button
                        key={transition.type}
                        onClick={() => addTransition(transition.type, transition.duration)}
                        variant="outline"
                        className="h-auto flex-col gap-2 p-4"
                      >
                        <Waveform className="w-6 h-6 text-accent" />
                        <span className="text-sm capitalize">{transition.name}</span>
                        <span className="text-xs text-muted-foreground">{transition.duration}s</span>
                      </Button>
                    ))}
                  </div>

                  {currentProject.transitions.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Applied Transitions</h4>
                        {currentProject.transitions.map((transition) => (
                          <Card key={transition.id} className="p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium capitalize">{transition.type}</p>
                              <Badge variant="secondary">{transition.duration}s</Badge>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="export" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Project Name</Label>
                      <Input
                        value={currentProject.title}
                        onChange={(e) => {
                          const updated = { ...currentProject, title: e.target.value }
                          setCurrentProject(updated)
                          setProjects((prev = []) => prev.map(p => p.id === updated.id ? updated : p))
                        }}
                      />
                    </div>

                    <Card className="p-4 bg-muted/50">
                      <h4 className="font-medium mb-3">Project Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Clips</p>
                          <p className="font-medium">{currentProject.clips.length}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Effects</p>
                          <p className="font-medium">{currentProject.effects.length}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Transitions</p>
                          <p className="font-medium">{currentProject.transitions.length}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{formatTime(duration)}</p>
                        </div>
                      </div>
                    </Card>

                    <Button onClick={exportVideo} className="w-full gap-2" disabled={isProcessing}>
                      <Download className="w-4 h-4" />
                      {isProcessing ? 'Exporting...' : 'Export Video'}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
