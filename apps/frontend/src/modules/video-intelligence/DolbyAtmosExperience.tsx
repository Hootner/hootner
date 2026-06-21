import { useState, useRef, useEffect } from 'react'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Waveform, Play, Pause, SpeakerHigh } from '@phosphor-icons/react'
import { Slider } from '@/shared/ui/slider'

interface AudioScene {
  id: string
  title: string
  description: string
  channels: string
  duration: number
  type: string
}

export default function DolbyAtmosExperience() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentScene, setCurrentScene] = useState<AudioScene | null>(null)
  const [volume, setVolume] = useState([80])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  const audioScenes: AudioScene[] = [
    {
      id: '1',
      title: 'Helicopter Flyover',
      description: 'Object-based audio with helicopter moving overhead from front to back',
      channels: '7.1.4',
      duration: 15,
      type: 'Demo'
    },
    {
      id: '2',
      title: 'Thunderstorm',
      description: 'Immersive rain with overhead thunder and lightning positioned in 3D space',
      channels: '7.1.4',
      duration: 20,
      type: 'Ambient'
    },
    {
      id: '3',
      title: 'Orchestra Performance',
      description: 'Full symphony orchestra with instruments positioned spatially around listener',
      channels: '7.1.4',
      duration: 30,
      type: 'Music'
    },
    {
      id: '4',
      title: 'City Soundscape',
      description: 'Urban environment with traffic, voices, and ambient sounds from all directions',
      channels: '5.1.2',
      duration: 25,
      type: 'Ambient'
    }
  ]

  useEffect(() => {
    if (!canvasRef.current || !isPlaying) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    let frame = 0

    const animate = () => {
      ctx.fillStyle = 'rgba(8, 8, 8, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const numObjects = 8
      for (let i = 0; i < numObjects; i++) {
        const angle = (frame * 0.02) + (i * Math.PI * 2 / numObjects)
        const radius = 100 + Math.sin(frame * 0.03 + i) * 30
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius
        const size = 5 + Math.sin(frame * 0.05 + i) * 3

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${(i * 45 + frame) % 360}, 70%, 60%, 0.8)`
        ctx.fill()

        ctx.strokeStyle = `hsla(${(i * 45 + frame) % 360}, 70%, 60%, 0.3)`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, size + 10, 0, Math.PI * 2)
        ctx.stroke()
      }

      frame++
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  const handlePlayScene = (scene: AudioScene) => {
    setCurrentScene(scene)
    setIsPlaying(true)
  }

  const handleStopScene = () => {
    setIsPlaying(false)
    setCurrentScene(null)
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 p-8 md:p-12">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
            <Waveform className="w-8 h-8 text-primary-foreground" weight="duotone" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Dolby Atmos Technology</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Object-based spatial audio with height channels creating a fully immersive 3D soundscape
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-accent mb-1">128 Objects</div>
            <div className="text-sm text-muted-foreground">Simultaneously positioned</div>
          </div>
          <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-accent mb-1">360° + Height</div>
            <div className="text-sm text-muted-foreground">Full 3D sound field</div>
          </div>
          <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-accent mb-1">7.1.4 / 5.1.2</div>
            <div className="text-sm text-muted-foreground">Speaker configurations</div>
          </div>
        </div>
      </div>

      {currentScene && (
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-lg">{currentScene.title}</h4>
              <p className="text-sm text-muted-foreground">{currentScene.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-primary/20 text-primary-foreground">{currentScene.channels}</Badge>
              <Badge variant="outline">{currentScene.type}</Badge>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-border bg-background mb-4">
            <canvas 
              ref={canvasRef}
              className="w-full aspect-video"
              style={{ minHeight: '300px' }}
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-accent/90 text-accent-foreground backdrop-blur-sm">
                <SpeakerHigh className="w-3 h-3 mr-1" weight="fill" />
                3D Audio Visualization
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={handleStopScene}
              variant="outline"
              size="sm"
            >
              <Pause className="w-4 h-4 mr-2" />
              Stop
            </Button>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Volume</label>
              <Slider 
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
              />
            </div>
          </div>
        </Card>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-6">Interactive Audio Demos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {audioScenes.map((scene) => (
            <Card 
              key={scene.id}
              className="group overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 border-border/50"
              onClick={() => handlePlayScene(scene)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Waveform className="w-6 h-6 text-primary-foreground" weight="duotone" />
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-primary/20 text-primary-foreground">{scene.channels}</Badge>
                    <Badge variant="outline" className="text-xs">{scene.type}</Badge>
                  </div>
                </div>
                <h4 className="font-semibold text-lg mb-2">{scene.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{scene.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-mono">{scene.duration}s duration</span>
                  <Button 
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlayScene(scene)
                    }}
                  >
                    <Play className="w-4 h-4 mr-1" weight="fill" />
                    Play Demo
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
        <h4 className="font-semibold text-lg mb-4">How Dolby Atmos Works</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium mb-2">Object-Based Audio</h5>
            <p className="text-sm text-muted-foreground">
              Unlike traditional channel-based audio, Dolby Atmos treats sounds as objects that can be precisely positioned and moved in 3D space, creating a more realistic and immersive experience.
            </p>
          </div>
          <div>
            <h5 className="font-medium mb-2">Height Channels</h5>
            <p className="text-sm text-muted-foreground">
              Overhead speakers or upward-firing drivers add a vertical dimension to sound, allowing audio to come from above and creating a true three-dimensional soundscape.
            </p>
          </div>
          <div>
            <h5 className="font-medium mb-2">Dynamic Rendering</h5>
            <p className="text-sm text-muted-foreground">
              The Atmos renderer adapts the audio to your specific speaker configuration, ensuring optimal sound regardless of whether you have a full 7.1.4 system or a basic 5.1.2 setup.
            </p>
          </div>
          <div>
            <h5 className="font-medium mb-2">Spatial Precision</h5>
            <p className="text-sm text-muted-foreground">
              Each audio object can be positioned with pinpoint accuracy, creating realistic directional cues and a sense of space that traditional surround sound cannot achieve.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
