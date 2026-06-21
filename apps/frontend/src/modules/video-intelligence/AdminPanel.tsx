import { useState } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { Trash, CheckSquare, Square, VideoCamera, Download, Shield } from '@phosphor-icons/react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import { Badge } from '@/shared/ui/badge'
import { toast } from 'sonner'
import type { Video } from '@/shared/lib/types'

export default function AdminPanel() {
  const [videos, setVideos] = usePlatformKV<Video[]>('hootner-videos', [])
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set())
  
  const safeVideos = videos || []

  const toggleSelection = (videoId: string) => {
    setSelectedVideoIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(videoId)) {
        newSet.delete(videoId)
      } else {
        newSet.add(videoId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedVideoIds.size === safeVideos.length) {
      setSelectedVideoIds(new Set())
    } else {
      setSelectedVideoIds(new Set(safeVideos.map(v => v.id)))
    }
  }

  const handleBulkDelete = () => {
    if (selectedVideoIds.size === 0) {
      toast.error('No videos selected')
      return
    }

    const count = selectedVideoIds.size
    setVideos((current) => {
      const filtered = (current || []).filter(v => !selectedVideoIds.has(v.id))
      return filtered
    })
    
    setSelectedVideoIds(new Set())
    toast.success(`Deleted ${count} video${count > 1 ? 's' : ''}`)
  }

  const handleExportMetadata = () => {
    if (selectedVideoIds.size === 0) {
      toast.error('No videos selected')
      return
    }

    const selectedVideos = safeVideos.filter(v => selectedVideoIds.has(v.id))
    const metadata = selectedVideos.map(v => ({
      title: v.title,
      description: v.description,
      duration: v.duration,
      views: v.views,
      uploadDate: v.uploadDate,
      uploadedBy: v.uploadedBy || 'Unknown',
      tags: v.aiInsights?.tags || []
    }))

    const dataStr = JSON.stringify(metadata, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `hootner-metadata-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast.success(`Exported metadata for ${selectedVideoIds.size} videos`)
  }

  const getTotalSize = () => {
    return safeVideos
      .filter(v => selectedVideoIds.has(v.id))
      .reduce((sum, v) => sum + v.size, 0)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const allSelected = safeVideos.length > 0 && selectedVideoIds.size === safeVideos.length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Shield weight="fill" className="w-7 h-7 text-accent-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">Manage videos and perform bulk operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{safeVideos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{selectedVideoIds.size}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Selected Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{formatBytes(getTotalSize())}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bulk Operations</CardTitle>
              <CardDescription>Select videos to perform actions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                className="gap-2"
              >
                {allSelected ? (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4" />
                    Select All
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportMetadata}
                disabled={selectedVideoIds.size === 0}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export Metadata
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={selectedVideoIds.size === 0}
                className="gap-2"
              >
                <Trash className="w-4 h-4" />
                Delete Selected
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {safeVideos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <VideoCamera className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No videos available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {safeVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedVideoIds.has(video.id)}
                    onCheckedChange={() => toggleSelection(video.id)}
                  />
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-24 h-14 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{video.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{formatBytes(video.size)}</span>
                      <span>•</span>
                      <span>{video.views} views</span>
                      {video.uploadedBy && (
                        <>
                          <span>•</span>
                          <span>by {video.uploadedBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant={video.status === 'ready' ? 'default' : 'secondary'}>
                    {video.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
