import { useState } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { PlayCircle, Lightning, SunHorizon } from '@phosphor-icons/react'
import { Dialog, DialogContent } from '@/shared/ui/dialog'
import VideoPlayer from '@/modules/video-intelligence/VideoPlayer'

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

export default function HDRShowcase() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [playerOpen, setPlayerOpen] = useState(false)

  const sampleVideos: Video[] = [
    {
      id: '1',
      title: 'Sunset Mountains',
      description: 'Vibrant HDR10 sunset over mountain ranges showcasing peak brightness and color depth',
      thumbnail: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #2a0845 100%)',
      hasHDR: true,
      hasDolbyAtmos: true,
      genre: 'Nature',
      duration: '2:30',
      metadata: {
        codec: 'HEVC (H.265)',
        resolution: '3840 × 2160 (4K)',
        bitrate: '25 Mbps',
        colorSpace: 'Rec. 2020',
        colorDepth: '10-bit',
        peakBrightness: '4000 nits',
        audioCodec: 'Dolby TrueHD',
        audioChannels: '7.1.4 (Atmos)'
      }
    },
    {
      id: '2',
      title: 'Neon Cityscape',
      description: 'Urban night scene with extreme contrast between deep blacks and brilliant neon lights',
      thumbnail: 'linear-gradient(135deg, #0a0a0a 0%, #ff00ff 50%, #00ffff 100%)',
      hasHDR: true,
      hasDolbyAtmos: true,
      genre: 'Urban',
      duration: '1:45',
      metadata: {
        codec: 'HEVC (H.265)',
        resolution: '7680 × 4320 (8K)',
        bitrate: '80 Mbps',
        colorSpace: 'Rec. 2020',
        colorDepth: '10-bit',
        peakBrightness: '5000 nits',
        audioCodec: 'Dolby TrueHD',
        audioChannels: '7.1.4 (Atmos)'
      }
    },
    {
      id: '3',
      title: 'Aurora Borealis',
      description: 'Natural light phenomenon showing the full Rec. 2020 color gamut capabilities',
      thumbnail: 'linear-gradient(135deg, #001a33 0%, #00ff88 50%, #8844ff 100%)',
      hasHDR: true,
      hasDolbyAtmos: false,
      genre: 'Nature',
      duration: '3:15',
      metadata: {
        codec: 'HEVC (H.265)',
        resolution: '3840 × 2160 (4K)',
        bitrate: '22 Mbps',
        colorSpace: 'Rec. 2020',
        colorDepth: '10-bit',
        peakBrightness: '3500 nits'
      }
    },
    {
      id: '4',
      title: 'Fireworks Display',
      description: 'Explosive colors and peak brightness moments perfect for HDR demonstration',
      thumbnail: 'linear-gradient(135deg, #0a0614 0%, #ff0066 40%, #ffaa00 60%, #00ffff 100%)',
      hasHDR: true,
      hasDolbyAtmos: true,
      genre: 'Action',
      duration: '2:00',
      metadata: {
        codec: 'HEVC (H.265)',
        resolution: '10240 × 4320 (10K)',
        bitrate: '120 Mbps',
        colorSpace: 'Rec. 2020',
        colorDepth: '10-bit',
        peakBrightness: '6000 nits',
        audioCodec: 'Dolby TrueHD',
        audioChannels: '7.1.4 (Atmos)'
      }
    },
    {
      id: '5',
      title: 'Ocean Depths',
      description: 'Deep underwater scenes testing shadow detail and blue color accuracy',
      thumbnail: 'linear-gradient(135deg, #000814 0%, #001d3d 50%, #003566 100%)',
      hasHDR: true,
      hasDolbyAtmos: true,
      genre: 'Nature',
      duration: '3:45',
      metadata: {
        codec: 'HEVC (H.265)',
        resolution: '7680 × 4320 (8K)',
        bitrate: '75 Mbps',
        colorSpace: 'Rec. 2020',
        colorDepth: '10-bit',
        peakBrightness: '3000 nits',
        audioCodec: 'Dolby TrueHD',
        audioChannels: '7.1.4 (Atmos)'
      }
    },
    {
      id: '6',
      title: 'Concert Stage',
      description: 'Dynamic lighting with spotlights, lasers, and stage effects in HDR',
      thumbnail: 'linear-gradient(135deg, #1a0033 0%, #ff006e 50%, #ffbe0b 100%)',
      hasHDR: true,
      hasDolbyAtmos: true,
      genre: 'Music',
      duration: '2:20',
      metadata: {
        codec: 'HEVC (H.265)',
        resolution: '3840 × 2160 (4K)',
        bitrate: '26 Mbps',
        colorSpace: 'Rec. 2020',
        colorDepth: '10-bit',
        peakBrightness: '4500 nits',
        audioCodec: 'Dolby TrueHD',
        audioChannels: '7.1.4 (Atmos)'
      }
    },
    {
      id: '7',
      title: 'Cosmic Nebula',
      description: 'Deep space imagery in stunning 10K resolution revealing incredible detail',
      thumbnail: 'linear-gradient(135deg, #000000 0%, #4a148c 40%, #ff6090 80%, #ffd700 100%)',
      hasHDR: true,
      hasDolbyAtmos: true,
      genre: 'Space',
      duration: '4:10',
      metadata: {
        codec: 'HEVC (H.265)',
        resolution: '10240 × 4320 (10K)',
        bitrate: '140 Mbps',
        colorSpace: 'Rec. 2020',
        colorDepth: '10-bit',
        peakBrightness: '7000 nits',
        audioCodec: 'Dolby TrueHD',
        audioChannels: '7.1.4 (Atmos)'
      }
    },
    {
      id: '8',
      title: 'Rainforest Canopy',
      description: 'Lush tropical ecosystem captured in pristine 8K HDR quality',
      thumbnail: 'linear-gradient(135deg, #004d00 0%, #00b300 50%, #80ff80 100%)',
      hasHDR: true,
      hasDolbyAtmos: true,
      genre: 'Nature',
      duration: '3:30',
      metadata: {
        codec: 'HEVC (H.265)',
        resolution: '7680 × 4320 (8K)',
        bitrate: '85 Mbps',
        colorSpace: 'Rec. 2020',
        colorDepth: '10-bit',
        peakBrightness: '4200 nits',
        audioCodec: 'Dolby TrueHD',
        audioChannels: '7.1.4 (Atmos)'
      }
    },
    {
      id: '9',
      title: 'Tokyo Nightlife',
      description: 'Ultra-high resolution 10K capture of vibrant city lights and neon signs',
      thumbnail: 'linear-gradient(135deg, #0d0221 0%, #e01a4f 30%, #f15bb5 60%, #00f5ff 100%)',
      hasHDR: true,
      hasDolbyAtmos: true,
      genre: 'Urban',
      duration: '2:50',
      metadata: {
        codec: 'HEVC (H.265)',
        resolution: '10240 × 4320 (10K)',
        bitrate: '135 Mbps',
        colorSpace: 'Rec. 2020',
        colorDepth: '10-bit',
        peakBrightness: '8000 nits',
        audioCodec: 'Dolby TrueHD',
        audioChannels: '7.1.4 (Atmos)'
      }
    }
  ]

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video)
    setPlayerOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 p-8 md:p-12">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-xl bg-accent/20 border border-accent/30">
            <SunHorizon className="w-8 h-8 text-accent" weight="duotone" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">HDR10 Technology</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              High Dynamic Range video with 10-bit color depth, Rec. 2020 color space, and peak brightness up to 10,000 nits
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-accent mb-1">10-bit</div>
            <div className="text-sm text-muted-foreground">1.07 billion colors</div>
          </div>
          <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-accent mb-1">10,000 nits</div>
            <div className="text-sm text-muted-foreground">Peak brightness</div>
          </div>
          <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-accent mb-1">Rec. 2020</div>
            <div className="text-sm text-muted-foreground">Wide color gamut</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-6">Featured HDR10 Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleVideos.map((video) => (
            <Card 
              key={video.id} 
              className="group overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/20 border-border/50"
              onClick={() => handlePlayVideo(video)}
            >
              <div 
                className="aspect-video relative overflow-hidden"
                style={{ background: video.thumbnail }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-4 rounded-full bg-accent/90 backdrop-blur-sm">
                    <PlayCircle className="w-12 h-12 text-accent-foreground" weight="fill" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {video.hasHDR && (
                    <Badge className="bg-accent/90 text-accent-foreground backdrop-blur-sm">
                      <Lightning className="w-3 h-3 mr-1" weight="fill" />
                      HDR10
                    </Badge>
                  )}
                  {video.hasDolbyAtmos && (
                    <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
                      Dolby Atmos
                    </Badge>
                  )}
                  <Badge className="bg-foreground/90 text-background backdrop-blur-sm font-mono text-xs">
                    {video.metadata.resolution.includes('10K') ? '10K' : video.metadata.resolution.includes('8K') ? '8K' : '4K'}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3">
                  <Badge variant="secondary" className="backdrop-blur-sm font-mono text-xs">
                    {video.duration}
                  </Badge>
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-semibold text-lg mb-2">{video.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                <div className="mt-3">
                  <Badge variant="outline" className="text-xs">{video.genre}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={playerOpen} onOpenChange={setPlayerOpen}>
        <DialogContent className="max-w-6xl p-0 bg-black border-0">
          {selectedVideo && (
            <VideoPlayer 
              video={selectedVideo} 
              onClose={() => setPlayerOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
