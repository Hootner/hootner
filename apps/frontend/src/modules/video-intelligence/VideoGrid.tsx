import { Play, Trash, Clock, Eye, Sparkle, DownloadSimple, Brain, CheckCircle, Copy } from '@phosphor-icons/react'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { Video } from '@/shared/lib/types'

interface VideoGridProps {
  videos: Video[]
  viewMode?: 'grid' | 'list'
  selectedVideos?: Set<string>
  onVideoClick: (video: Video) => void
  onVideoDelete: (videoId: string) => void
  onVideoSelect?: (videoId: string) => void
  onVideoDuplicate?: (videoId: string) => void
}

export default function VideoGrid({ videos, viewMode = 'grid', selectedVideos = new Set(), onVideoClick, onVideoDelete, onVideoSelect, onVideoDuplicate }: VideoGridProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const handleDelete = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation()
    onVideoDelete(videoId)
    toast.success('Video deleted')
  }

  const handleDownload = async (e: React.MouseEvent, video: Video) => {
    e.stopPropagation()
    try {
      const response = await fetch(video.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${video.title}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Video download started', {
        description: video.title
      })
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download video')
    }
  }

  const handleCheckboxClick = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation()
    onVideoSelect?.(videoId)
  }

  const handleDuplicate = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation()
    onVideoDuplicate?.(videoId)
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {videos.map((video, index) => {
          const isSelected = selectedVideos.has(video.id)
          return (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              <Card
                className={`group cursor-pointer overflow-hidden bg-card border transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 ${
                  isSelected ? 'border-accent ring-2 ring-accent/20' : 'border-border hover:border-accent/50'
                }`}
                onClick={() => onVideoClick(video)}
              >
                <div className="flex gap-4 p-4">
                  <div className="flex items-center">
                    <Checkbox
                      checked={isSelected}
                      onClick={(e) => handleCheckboxClick(e, video.id)}
                      className="mr-3"
                    />
                  </div>
                  <div className="relative w-40 aspect-video bg-black rounded overflow-hidden shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="bg-black/80 text-white border-0 backdrop-blur-sm text-xs">
                        <Clock weight="bold" className="w-3 h-3 mr-1" />
                        {formatDuration(video.duration)}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center">
                        <Play weight="fill" className="w-6 h-6 text-accent-foreground ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-base line-clamp-1">{video.title}</h3>
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleDownload(e, video)}
                          title="Download video"
                        >
                          <DownloadSimple className="w-4 h-4 text-accent" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleDuplicate(e, video.id)}
                          title="Duplicate video"
                        >
                          <Copy className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleDelete(e, video.id)}
                          title="Delete video"
                        >
                          <Trash className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {video.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {video.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      {video.isAIGenerated && (
                        <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white border-0 text-xs">
                          <Brain weight="fill" className="w-3 h-3 mr-1" />
                          Neural
                        </Badge>
                      )}
                      {video.aiInsights && !video.isAIGenerated && (
                        <Badge variant="secondary" className="bg-accent/90 text-accent-foreground border-0 text-xs">
                          <Sparkle weight="fill" className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                      {video.quality && (
                        <>
                          <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                            {video.quality.resolution}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-accent/10 border-accent/30">
                            {video.quality.colorSpace}
                          </Badge>
                        </>
                      )}
                      {video.aiInsights?.tags && video.aiInsights.tags.length > 0 && (
                        <>
                          {video.aiInsights.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {video.aiInsights.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{video.aiInsights.tags.length - 2}
                            </Badge>
                          )}
                        </>
                      )}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <Eye weight="bold" className="w-4 h-4" />
                        {video.views.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(video.uploadDate)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video, index) => {
        const isSelected = selectedVideos.has(video.id)
        return (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Card
              className={`group cursor-pointer overflow-hidden bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/10 relative ${
                isSelected ? 'border-accent ring-2 ring-accent/20' : 'border-border hover:border-accent/50'
              }`}
              onClick={() => onVideoClick(video)}
            >
              {isSelected && (
                <div className="absolute top-3 left-3 z-10 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle weight="fill" className="w-5 h-5 text-accent-foreground" />
                </div>
              )}
              <div className="relative aspect-video bg-black overflow-hidden">
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Checkbox
                    checked={isSelected}
                    onClick={(e) => handleCheckboxClick(e, video.id)}
                    className="bg-white/90 border-white"
                  />
                </div>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-black/80 text-white border-0 backdrop-blur-sm">
                    <Clock weight="bold" className="w-3 h-3 mr-1" />
                    {formatDuration(video.duration)}
                  </Badge>
                  {video.isAIGenerated && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white border-0 backdrop-blur-sm animate-pulse">
                      <Brain weight="fill" className="w-3 h-3 mr-1" />
                      Neural
                    </Badge>
                  )}
                  {video.aiInsights && !video.isAIGenerated && (
                    <Badge variant="secondary" className="bg-accent/90 text-accent-foreground border-0 backdrop-blur-sm">
                      <Sparkle weight="fill" className="w-3 h-3 mr-1" />
                      AI
                    </Badge>
                  )}
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center">
                    <Play weight="fill" className="w-8 h-8 text-accent-foreground ml-1" />
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-base line-clamp-2 flex-1">
                    {video.title}
                  </h3>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleDownload(e, video)}
                      title="Download video"
                    >
                      <DownloadSimple className="w-4 h-4 text-accent" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleDuplicate(e, video.id)}
                      title="Duplicate video"
                    >
                      <Copy className="w-4 h-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleDelete(e, video.id)}
                      title="Delete video"
                    >
                      <Trash className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {video.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {video.description}
                  </p>
                )}

                {video.quality && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                      {video.quality.resolution}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-accent/10 border-accent/30">
                      {video.quality.colorSpace}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30">
                      {video.quality.audioFormat}
                    </Badge>
                  </div>
                )}

                {video.aiInsights?.tags && video.aiInsights.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {video.aiInsights.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {video.aiInsights.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{video.aiInsights.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye weight="bold" className="w-4 h-4" />
                      {video.views.toLocaleString()}
                    </span>
                  </div>
                  <span>{formatDate(video.uploadDate)}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
