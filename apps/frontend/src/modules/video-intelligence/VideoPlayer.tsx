import { useState, useRef, useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { X, ArrowsOut, ArrowsIn, Play, Pause, SpeakerHigh, Lightning, Sparkle, VideoCamera, ArrowLeft } from '@phosphor-icons/react'
import { Slider } from '@/shared/ui/slider'
import { Switch } from '@/shared/ui/switch'
import { Label } from '@/shared/ui/label'
import { Progress } from '@/shared/ui/progress'
import { toast } from 'sonner'

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  hasHDR: boolean
  hasDolbyAtmos: boolean
  genre: string
  duration: string
  metadata: {
    codec: string
    resolution: string
    bitrate: string
    colorSpace: string
    colorDepth: string
    peakBrightness: string
    audioCodec?: string
    audioChannels?: string
  }
}

interface VideoPlayerProps {
  video: Video
  onClose: () => void
}

export default function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hdrEnabled, setHdrEnabled] = useState(true)
  const [volume, setVolume] = useState([75])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [buffering, setBuffering] = useState(false)
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume[0] / 100
    }
  }, [volume])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      toast.error('Fullscreen not supported')
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleHdrToggle = (enabled: boolean) => {
    setHdrEnabled(enabled)
    toast.success(enabled ? 'HDR10 Enabled' : 'SDR Mode Enabled')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  const handleWaiting = () => setBuffering(true)
  const handleCanPlay = () => setBuffering(false)

  return (
    <div 
      ref={containerRef}
      className="relative bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className={`w-full h-full object-contain ${hdrEnabled ? 'brightness-110 contrast-110' : 'brightness-100 contrast-100'} transition-all duration-300`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onWaiting={handleWaiting}
          onCanPlay={handleCanPlay}
          onEnded={() => setIsPlaying(false)}
          loop
          playsInline
        >
          <source 
            src={`https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`} 
            type="video/mp4" 
          />
        </video>

        {buffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          </div>
        )}

        <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-start justify-between">
            <div className="flex flex-wrap gap-2">
              {video.hasHDR && (
                <Badge className="bg-accent/90 text-accent-foreground backdrop-blur-sm">
                  <Lightning className="w-3 h-3 mr-1" weight="fill" />
                  HDR10 {hdrEnabled ? 'ON' : 'OFF'}
                </Badge>
              )}
              {video.hasDolbyAtmos && (
                <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
                  Dolby Atmos
                </Badge>
              )}
              <Badge variant="secondary" className="backdrop-blur-sm">
                <Sparkle className="w-3 h-3 mr-1" weight="fill" />
                {video.metadata.resolution}
              </Badge>
              <Badge variant="secondary" className="backdrop-blur-sm font-mono text-xs">
                {video.metadata.bitrate}
              </Badge>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20 pointer-events-auto"
              onClick={onClose}
            >
              <X className="w-5 h-5" weight="bold" />
            </Button>
          </div>
        </div>

        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showControls && !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            size="icon"
            className="w-20 h-20 rounded-full bg-accent/90 hover:bg-accent text-accent-foreground shadow-2xl pointer-events-auto"
            onClick={togglePlay}
          >
            <Play className="w-10 h-10" weight="fill" />
          </Button>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-white min-w-[5ch]">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-xs font-mono text-white min-w-[5ch]">
                {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" weight="fill" />
                  ) : (
                    <Play className="w-5 h-5" weight="fill" />
                  )}
                </Button>

                <div className="flex items-center gap-2 ml-2">
                  <SpeakerHigh className="w-4 h-4 text-white" />
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    className="w-24"
                  />
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <ArrowsIn className="w-5 h-5" weight="bold" />
                ) : (
                  <ArrowsOut className="w-5 h-5" weight="bold" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-card/90 backdrop-blur-xl border-t border-border">
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-1">{video.title}</h3>
          <p className="text-sm text-muted-foreground">{video.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-lg bg-background/50 border border-border/50">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <VideoCamera className="w-4 h-4 text-accent" weight="duotone" />
              Video Specifications
            </h4>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Codec</dt>
                <dd className="font-mono font-medium">{video.metadata.codec}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Resolution</dt>
                <dd className="font-mono font-medium">{video.metadata.resolution}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Bitrate</dt>
                <dd className="font-mono font-medium">{video.metadata.bitrate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Color Space</dt>
                <dd className="font-mono font-medium">{video.metadata.colorSpace}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Color Depth</dt>
                <dd className="font-mono font-medium">{video.metadata.colorDepth}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Peak Brightness</dt>
                <dd className="font-mono font-medium">{video.metadata.peakBrightness}</dd>
              </div>
            </dl>
          </div>

          {video.hasDolbyAtmos && (
            <div className="p-4 rounded-lg bg-background/50 border border-border/50">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <SpeakerHigh className="w-4 h-4 text-primary" weight="duotone" />
                Audio Specifications
              </h4>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Codec</dt>
                  <dd className="font-mono font-medium">{video.metadata.audioCodec}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Channels</dt>
                  <dd className="font-mono font-medium">{video.metadata.audioChannels}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Format</dt>
                  <dd className="font-mono font-medium">Dolby Atmos</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sample Rate</dt>
                  <dd className="font-mono font-medium">48 kHz</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Bit Depth</dt>
                  <dd className="font-mono font-medium">24-bit</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {video.hasHDR && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
              <div className="flex items-center gap-3">
                <Lightning className="w-5 h-5 text-accent" weight="duotone" />
                <div>
                  <Label htmlFor="hdr-toggle" className="font-medium">HDR10 Mode</Label>
                  <p className="text-xs text-muted-foreground">Toggle high dynamic range display mode</p>
                </div>
              </div>
              <Switch
                id="hdr-toggle"
                checked={hdrEnabled}
                onCheckedChange={handleHdrToggle}
              />
            </div>
          )}
          
          <Button 
            onClick={onClose}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" weight="bold" />
            Back to Videos
          </Button>
        </div>
      </div>
    </div>
  )
}
