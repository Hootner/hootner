// @ts-nocheck
import { useState } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { UploadSimple, MagnifyingGlass, Sparkle, SortAscending, Funnel, VideoCamera, SlidersHorizontal, X, SquaresFour, ListBullets, Trash, FolderPlus, CheckSquare, Square, DownloadSimple, Copy } from '@phosphor-icons/react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Label } from '@/shared/ui/label'
import { Slider } from '@/shared/ui/slider'
import { Badge } from '@/shared/ui/badge'
import { Switch } from '@/shared/ui/switch'
import { toast } from 'sonner'
import VideoUpload from '@/modules/video-intelligence/VideoUpload'
import VideoGrid from '@/modules/video-intelligence/VideoGrid'
import VideoPlayer from '@/modules/video-intelligence/VideoPlayer'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import type { Video, User, VideoQuality, ColorSpace, Collection } from '@/shared/lib/types'

interface VideosProps {
  currentUser: User
}

interface AdvancedFilters {
  minViews: number
  maxDuration: number
  quality: VideoQuality | 'all'
  colorSpace: ColorSpace | 'all'
  aiGenerated: 'all' | 'yes' | 'no'
  sentiment: 'all' | 'positive' | 'neutral' | 'negative'
}

export default function Videos({ currentUser }: VideosProps) {
  const [videos, setVideos] = usePlatformKV<Video[]>('hootner-videos', [])
  const [collections, setCollections] = usePlatformKV<Collection[]>('hootner-collections', [])
  const [showUpload, setShowUpload] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'title' | 'duration'>('date')
  const [filterStatus, setFilterStatus] = useState<'all' | 'ready' | 'processing'>('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())
  const [showAddToCollection, setShowAddToCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('')
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    minViews: 0,
    maxDuration: 3600,
    quality: 'all',
    colorSpace: 'all',
    aiGenerated: 'all',
    sentiment: 'all'
  })

  const safeVideos = videos || []

  const hasActiveAdvancedFilters = 
    advancedFilters.minViews > 0 ||
    advancedFilters.maxDuration < 3600 ||
    advancedFilters.quality !== 'all' ||
    advancedFilters.colorSpace !== 'all' ||
    advancedFilters.aiGenerated !== 'all' ||
    advancedFilters.sentiment !== 'all'

  const filteredAndSortedVideos = safeVideos
    .filter((video) => {
      const matchesSearch =
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.aiInsights?.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      const matchesFilter = filterStatus === 'all' || video.status === filterStatus
      
      const matchesViews = video.views >= advancedFilters.minViews
      const matchesDuration = video.duration <= advancedFilters.maxDuration
      const matchesQuality = advancedFilters.quality === 'all' || video.quality?.resolution === advancedFilters.quality
      const matchesColorSpace = advancedFilters.colorSpace === 'all' || video.quality?.colorSpace === advancedFilters.colorSpace
      const matchesAIGenerated = 
        advancedFilters.aiGenerated === 'all' ||
        (advancedFilters.aiGenerated === 'yes' && video.isAIGenerated) ||
        (advancedFilters.aiGenerated === 'no' && !video.isAIGenerated)
      const matchesSentiment = 
        advancedFilters.sentiment === 'all' ||
        video.aiInsights?.sentiment === advancedFilters.sentiment
      
      return matchesSearch && matchesFilter && matchesViews && matchesDuration && 
             matchesQuality && matchesColorSpace && matchesAIGenerated && matchesSentiment
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.views - a.views
        case 'title':
          return a.title.localeCompare(b.title)
        case 'duration':
          return b.duration - a.duration
        case 'date':
        default:
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      }
    })

  const resetAdvancedFilters = () => {
    setAdvancedFilters({
      minViews: 0,
      maxDuration: 3600,
      quality: 'all',
      colorSpace: 'all',
      aiGenerated: 'all',
      sentiment: 'all'
    })
  }

  const handleVideoUploaded = (video: Video) => {
    const videoWithUser = { ...video, uploadedBy: currentUser.username }
    setVideos((current) => [videoWithUser, ...(current || [])])
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
  }

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos((current) => {
      const newSet = new Set(current)
      if (newSet.has(videoId)) {
        newSet.delete(videoId)
      } else {
        newSet.add(videoId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedVideos.size === filteredAndSortedVideos.length) {
      setSelectedVideos(new Set())
    } else {
      setSelectedVideos(new Set(filteredAndSortedVideos.map((v) => v.id)))
    }
  }

  const handleBulkDelete = () => {
    if (selectedVideos.size === 0) return
    
    const count = selectedVideos.size
    setVideos((current) => 
      (current || []).filter((v) => !selectedVideos.has(v.id))
    )
    setSelectedVideos(new Set())
    toast.success(`Deleted ${count} video${count > 1 ? 's' : ''}`)
  }

  const handleBulkDownload = async () => {
    if (selectedVideos.size === 0) return
    
    const videosToDownload = safeVideos.filter((v) => selectedVideos.has(v.id))
    toast.success(`Starting download of ${videosToDownload.length} video${videosToDownload.length > 1 ? 's' : ''}`)
    
    for (const video of videosToDownload) {
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
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        console.error('Download failed:', error)
      }
    }
  }

  const handleDuplicateVideo = (videoId: string) => {
    const videoToDuplicate = safeVideos.find((v) => v.id === videoId)
    if (!videoToDuplicate) return

    const duplicatedVideo: Video = {
      ...videoToDuplicate,
      id: `${videoToDuplicate.id}-copy-${Date.now()}`,
      title: `${videoToDuplicate.title} (Copy)`,
      uploadDate: new Date().toISOString(),
      views: 0,
      uploadedBy: currentUser.username
    }

    setVideos((current) => [duplicatedVideo, ...(current || [])])
    toast.success('Video duplicated successfully', {
      description: duplicatedVideo.title
    })
  }

  const handleAddToCollection = () => {
    if (selectedVideos.size === 0) {
      toast.error('No videos selected')
      return
    }

    if (selectedCollectionId === 'new') {
      if (!newCollectionName.trim()) {
        toast.error('Please enter a collection name')
        return
      }

      const newCollection: Collection = {
        id: `collection-${Date.now()}`,
        name: newCollectionName,
        description: '',
        videoIds: Array.from(selectedVideos),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.username
      }

      setCollections((current) => [...(current || []), newCollection])
      
      setVideos((current) =>
        (current || []).map((video) =>
          selectedVideos.has(video.id)
            ? { ...video, collectionIds: [...(video.collectionIds || []), newCollection.id] }
            : video
        )
      )

      toast.success(`Added ${selectedVideos.size} video${selectedVideos.size > 1 ? 's' : ''} to new collection "${newCollectionName}"`)
      setNewCollectionName('')
    } else if (selectedCollectionId) {
      setCollections((current) =>
        (current || []).map((col) =>
          col.id === selectedCollectionId
            ? {
                ...col,
                videoIds: [...new Set([...col.videoIds, ...Array.from(selectedVideos)])],
                updatedAt: new Date().toISOString()
              }
            : col
        )
      )

      setVideos((current) =>
        (current || []).map((video) =>
          selectedVideos.has(video.id)
            ? { ...video, collectionIds: [...new Set([...(video.collectionIds || []), selectedCollectionId])] }
            : video
        )
      )

      const collection = (collections || []).find((c) => c.id === selectedCollectionId)
      toast.success(`Added ${selectedVideos.size} video${selectedVideos.size > 1 ? 's' : ''} to "${collection?.name}"`)
    }

    setShowAddToCollection(false)
    setSelectedVideos(new Set())
    setSelectedCollectionId('')
  }

  const stats = {
    total: safeVideos.length,
    ready: safeVideos.filter((v) => v.status === 'ready').length,
    processing: safeVideos.filter((v) => v.status === 'processing').length,
    totalViews: safeVideos.reduce((sum, v) => sum + v.views, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Video Library</h2>
          <p className="text-muted-foreground">
            Browse, search, and manage all your video content
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setShowUpload(true)}
          className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20"
        >
          <UploadSimple weight="bold" className="w-5 h-5 mr-2" />
          Upload Video
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Videos</p>
            <VideoCamera weight="fill" className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.total}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Ready</p>
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.ready}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Processing</p>
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.processing}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Views</p>
            <Sparkle weight="fill" className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.totalViews.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search videos, tags, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-input"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex border border-border rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-none h-10 w-10 ${viewMode === 'grid' ? 'bg-accent/10 text-accent' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <SquaresFour className="w-5 h-5" weight={viewMode === 'grid' ? 'fill' : 'regular'} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-none h-10 w-10 ${viewMode === 'list' ? 'bg-accent/10 text-accent' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <ListBullets className="w-5 h-5" weight={viewMode === 'list' ? 'fill' : 'regular'} />
            </Button>
          </div>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[140px]">
              <SortAscending className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Latest</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-[140px]">
              <Funnel className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
            </SelectContent>
          </Select>
          <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {hasActiveAdvancedFilters && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Advanced Filters</h4>
                  {hasActiveAdvancedFilters && (
                    <Button variant="ghost" size="sm" onClick={resetAdvancedFilters}>
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Minimum Views</Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[advancedFilters.minViews]}
                      onValueChange={([value]) =>
                        setAdvancedFilters({ ...advancedFilters, minViews: value })
                      }
                      min={0}
                      max={1000}
                      step={10}
                      className="flex-1"
                    />
                    <Badge variant="secondary" className="font-mono w-16 justify-center">
                      {advancedFilters.minViews}+
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Max Duration (seconds)</Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[advancedFilters.maxDuration]}
                      onValueChange={([value]) =>
                        setAdvancedFilters({ ...advancedFilters, maxDuration: value })
                      }
                      min={60}
                      max={3600}
                      step={60}
                      className="flex-1"
                    />
                    <Badge variant="secondary" className="font-mono w-16 justify-center">
                      {Math.floor(advancedFilters.maxDuration / 60)}m
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Quality</Label>
                  <Select
                    value={advancedFilters.quality}
                    onValueChange={(value: any) =>
                      setAdvancedFilters({ ...advancedFilters, quality: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Qualities</SelectItem>
                      <SelectItem value="480p">480p</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="4K">4K</SelectItem>
                      <SelectItem value="8K">8K</SelectItem>
                      <SelectItem value="10K UHD">10K UHD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color Space</Label>
                  <Select
                    value={advancedFilters.colorSpace}
                    onValueChange={(value: any) =>
                      setAdvancedFilters({ ...advancedFilters, colorSpace: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Formats</SelectItem>
                      <SelectItem value="SDR">SDR</SelectItem>
                      <SelectItem value="HDR10">HDR10</SelectItem>
                      <SelectItem value="HDR10+">HDR10+</SelectItem>
                      <SelectItem value="Dolby Vision">Dolby Vision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>AI Generated</Label>
                  <Select
                    value={advancedFilters.aiGenerated}
                    onValueChange={(value: any) =>
                      setAdvancedFilters({ ...advancedFilters, aiGenerated: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Videos</SelectItem>
                      <SelectItem value="yes">AI Generated Only</SelectItem>
                      <SelectItem value="no">User Uploaded Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sentiment</Label>
                  <Select
                    value={advancedFilters.sentiment}
                    onValueChange={(value: any) =>
                      setAdvancedFilters({ ...advancedFilters, sentiment: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sentiments</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {hasActiveAdvancedFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {advancedFilters.minViews > 0 && (
            <Badge variant="secondary">
              Views: {advancedFilters.minViews}+
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => setAdvancedFilters({ ...advancedFilters, minViews: 0 })}
              />
            </Badge>
          )}
          {advancedFilters.maxDuration < 3600 && (
            <Badge variant="secondary">
              Duration: ≤{Math.floor(advancedFilters.maxDuration / 60)}m
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => setAdvancedFilters({ ...advancedFilters, maxDuration: 3600 })}
              />
            </Badge>
          )}
          {advancedFilters.quality !== 'all' && (
            <Badge variant="secondary">
              {advancedFilters.quality}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => setAdvancedFilters({ ...advancedFilters, quality: 'all' })}
              />
            </Badge>
          )}
          {advancedFilters.colorSpace !== 'all' && (
            <Badge variant="secondary">
              {advancedFilters.colorSpace}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => setAdvancedFilters({ ...advancedFilters, colorSpace: 'all' })}
              />
            </Badge>
          )}
          {advancedFilters.aiGenerated !== 'all' && (
            <Badge variant="secondary">
              {advancedFilters.aiGenerated === 'yes' ? 'AI Generated' : 'User Uploaded'}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => setAdvancedFilters({ ...advancedFilters, aiGenerated: 'all' })}
              />
            </Badge>
          )}
          {advancedFilters.sentiment !== 'all' && (
            <Badge variant="secondary">
              {advancedFilters.sentiment} sentiment
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => setAdvancedFilters({ ...advancedFilters, sentiment: 'all' })}
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={resetAdvancedFilters}>
            Clear all
          </Button>
        </div>
      )}

      {selectedVideos.size > 0 && (
        <div className="bg-accent/10 border border-accent rounded-lg p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedVideos(new Set())}
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <span className="text-sm font-medium">
              {selectedVideos.size} video{selectedVideos.size > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddToCollection(true)}
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Add to Collection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDownload}
            >
              <DownloadSimple className="w-4 h-4 mr-2" />
              Download Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {safeVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-6">
            <VideoCamera className="w-10 h-10 text-accent" />
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
      ) : filteredAndSortedVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center mb-6">
            <MagnifyingGlass className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No videos found</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Try adjusting your search or filter criteria
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('')
              setFilterStatus('all')
              resetAdvancedFilters()
            }}
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <>
          {filteredAndSortedVideos.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="text-sm"
                >
                  {selectedVideos.size === filteredAndSortedVideos.length ? (
                    <>
                      <CheckSquare className="w-4 h-4 mr-2" weight="fill" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Select All
                    </>
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {filteredAndSortedVideos.length} video{filteredAndSortedVideos.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
          <VideoGrid
            videos={filteredAndSortedVideos}
            viewMode={viewMode}
            selectedVideos={selectedVideos}
            onVideoClick={handleVideoClick}
            onVideoDelete={handleVideoDeleted}
            onVideoSelect={toggleVideoSelection}
            onVideoDuplicate={handleDuplicateVideo}
          />
        </>
      )}

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

      <Dialog open={showAddToCollection} onOpenChange={setShowAddToCollection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Collection</DialogTitle>
            <DialogDescription>
              Add {selectedVideos.size} selected video{selectedVideos.size > 1 ? 's' : ''} to a collection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collection-select">Choose Collection</Label>
              <Select value={selectedCollectionId} onValueChange={setSelectedCollectionId}>
                <SelectTrigger id="collection-select">
                  <SelectValue placeholder="Select a collection..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">+ Create New Collection</SelectItem>
                  {(collections || []).map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name} ({collection.videoIds.length} videos)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCollectionId === 'new' && (
              <div className="space-y-2">
                <Label htmlFor="new-collection-name">New Collection Name</Label>
                <Input
                  id="new-collection-name"
                  placeholder="Enter collection name..."
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddToCollection(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToCollection} disabled={!selectedCollectionId}>
              Add to Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
