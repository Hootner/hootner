// @ts-nocheck
import { useState, useEffect } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { UploadSimple, MagnifyingGlass, Sparkle } from '@phosphor-icons/react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import VideoUpload from '@/modules/video-intelligence/VideoUpload'
import VideoGrid from '@/modules/video-intelligence/VideoGrid'
import VideoPlayer from '@/modules/video-intelligence/VideoPlayer'
import LiveMetrics from '@/modules/video-intelligence/LiveMetrics'
import ActivityFeed from '@/modules/video-intelligence/ActivityFeed'
import PresenceIndicator from '@/modules/video-intelligence/PresenceIndicator'
import { generateSampleVideos } from './videoGenerator'
import type { Video, User } from '@/shared/lib/types'

interface Activity {
  id: string
  type: 'upload' | 'view' | 'insight' | 'trending'
  videoTitle: string
  timestamp: string
  details?: string
}

interface DashboardProps {
  currentUser: User
}

export default function Dashboard({ currentUser }: DashboardProps) {
  const [videos, setVideos] = usePlatformKV<Video[]>('hootner-videos', [])
  const [activities, setActivities] = usePlatformKV<Activity[]>('hootner-activities', [])
  const [showUpload, setShowUpload] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const safeVideos = videos || []
  const safeActivities = activities || []

  useEffect(() => {
    if (safeVideos.length === 0) {
      const sampleVideos = generateSampleVideos(100)
      setVideos(sampleVideos)
    }
  }, [])

  const filteredVideos = safeVideos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.aiInsights?.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const addActivity = (type: Activity['type'], videoTitle: string, details?: string) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      videoTitle,
      timestamp: new Date().toISOString(),
      details
    }
    setActivities((current) => [newActivity, ...(current || [])].slice(0, 50))
  }

  const handleVideoUploaded = (video: Video) => {
    const videoWithUser = { ...video, uploadedBy: currentUser.username }
    setVideos((current) => [videoWithUser, ...(current || [])])
    addActivity('upload', video.title, 'New video uploaded and processed')
    setShowUpload(false)
  }

  const handleVideoDeleted = (videoId: string) => {
    setVideos((current) => (current || []).filter((v) => v.id !== videoId))
  }

  const handleVideoUpdated = (updatedVideo: Video) => {
    setVideos((current) =>
      (current || []).map((v) => (v.id === updatedVideo.id ? updatedVideo : v))
    )
  }

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video)
    addActivity('view', video.title, `Video viewed • ${video.views + 1} total views`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Video Library</h2>
          <p className="text-muted-foreground">
            Manage and analyze your video content with AI-powered insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PresenceIndicator />
          <Button
            size="lg"
            onClick={() => setShowUpload(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20"
          >
            <UploadSimple weight="bold" className="w-5 h-5 mr-2" />
            Upload Video
          </Button>
        </div>
      </div>

      <LiveMetrics videos={videos || []} />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search videos, tags, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-input"
          />
        </div>
        <Button variant="outline" size="icon" className="shrink-0">
          <Sparkle className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {safeVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-6">
                <UploadSimple className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No videos yet</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Upload your first video to start analyzing with AI-powered insights
              </p>
              <Button
                size="lg"
                onClick={() => setShowUpload(true)}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <UploadSimple weight="bold" className="w-5 h-5 mr-2" />
                Upload Your First Video
              </Button>
            </div>
          ) : (
            <VideoGrid
              videos={filteredVideos}
              onVideoClick={handleVideoClick}
              onVideoDelete={handleVideoDeleted}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>

      {showUpload && (
        <VideoUpload onClose={() => setShowUpload(false)} onVideoUploaded={handleVideoUploaded} />
      )}

      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onVideoUpdated={handleVideoUpdated}
          currentUser={currentUser}
        />
      )}
    </div>
  )
}
