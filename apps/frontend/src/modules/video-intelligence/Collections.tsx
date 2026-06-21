import { useState } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { FolderOpen, Plus, Trash, PlayCircle, Calendar, Video as VideoIcon, Pencil } from '@phosphor-icons/react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Badge } from '@/shared/ui/badge'
import { toast } from 'sonner'
import type { Collection, Video } from '@/shared/lib/types'
import { cn } from '@/shared/lib/utils'

export default function Collections() {
  const [collections, setCollections] = usePlatformKV<Collection[]>('hootner-collections', [])
  const [videos] = usePlatformKV<Video[]>('hootner-videos', [])
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [newCollection, setNewCollection] = useState({ name: '', description: '' })
  const [editCollection, setEditCollection] = useState<Collection | null>(null)

  const handleCreateCollection = () => {
    if (!newCollection.name.trim()) {
      toast.error('Collection name is required')
      return
    }

    const collection: Collection = {
      id: `col-${Date.now()}`,
      name: newCollection.name,
      description: newCollection.description,
      videoIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user'
    }

    setCollections((current) => [...(current || []), collection])
    setNewCollection({ name: '', description: '' })
    setIsCreateOpen(false)
    toast.success(`Collection "${collection.name}" created`)
  }

  const handleEditCollection = () => {
    if (!editCollection) return

    setCollections((current) =>
      (current || []).map((col) =>
        col.id === editCollection.id
          ? { ...editCollection, updatedAt: new Date().toISOString() }
          : col
      )
    )
    setIsEditOpen(false)
    toast.success('Collection updated')
    if (selectedCollection?.id === editCollection.id) {
      setSelectedCollection(editCollection)
    }
  }

  const handleDeleteCollection = (collectionId: string) => {
    const collection = (collections || []).find((c) => c.id === collectionId)
    if (!collection) return

    if (window.confirm(`Delete collection "${collection.name}"? This will not delete the videos.`)) {
      setCollections((current) => (current || []).filter((c) => c.id !== collectionId))
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(null)
      }
      toast.success('Collection deleted')
    }
  }

  const handleAddVideoToCollection = (videoId: string, collectionId: string) => {
    setCollections((current) =>
      (current || []).map((col) =>
        col.id === collectionId
          ? {
              ...col,
              videoIds: col.videoIds.includes(videoId)
                ? col.videoIds
                : [...col.videoIds, videoId],
              updatedAt: new Date().toISOString()
            }
          : col
      )
    )
  }

  const handleRemoveVideoFromCollection = (videoId: string, collectionId: string) => {
    setCollections((current) =>
      (current || []).map((col) =>
        col.id === collectionId
          ? {
              ...col,
              videoIds: col.videoIds.filter((id) => id !== videoId),
              updatedAt: new Date().toISOString()
            }
          : col
      )
    )
    toast.success('Video removed from collection')
  }

  const getCollectionVideos = (collection: Collection): Video[] => {
    return collection.videoIds
      .map((id) => (videos || []).find((v) => v.id === id))
      .filter((v): v is Video => v !== undefined)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (selectedCollection) {
    const collectionVideos = getCollectionVideos(selectedCollection)

    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCollection(null)}
              className="mb-2"
            >
              ← Back to Collections
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">{selectedCollection.name}</h2>
            {selectedCollection.description && (
              <p className="text-muted-foreground">{selectedCollection.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
              <span className="flex items-center gap-1">
                <VideoIcon className="w-4 h-4" />
                {collectionVideos.length} videos
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Updated {formatDate(selectedCollection.updatedAt)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditCollection(selectedCollection)
                setIsEditOpen(true)
              }}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteCollection(selectedCollection.id)}
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {collectionVideos.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No videos in this collection</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add videos from your library to organize them here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collectionVideos.map((video) => (
              <Card key={video.id} className="group hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <PlayCircle weight="fill" className="w-16 h-16 text-white" />
                  </div>
                  {video.isAIGenerated && (
                    <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                      AI Generated
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{video.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{video.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatDuration(video.duration)}</span>
                    <span>{video.views} views</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleRemoveVideoFromCollection(video.id, selectedCollection.id)}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Remove from Collection
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Collection</DialogTitle>
              <DialogDescription>Update collection details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editCollection?.name || ''}
                  onChange={(e) =>
                    setEditCollection((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  placeholder="My Collection"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editCollection?.description || ''}
                  onChange={(e) =>
                    setEditCollection((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  placeholder="Describe this collection..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditCollection}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Collections</h2>
          <p className="text-muted-foreground">Organize your videos into collections</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Collection</DialogTitle>
              <DialogDescription>Create a new collection to organize your videos</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                  placeholder="My Collection"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCollection.description}
                  onChange={(e) =>
                    setNewCollection({ ...newCollection, description: e.target.value })
                  }
                  placeholder="Describe this collection..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCollection}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {(collections || []).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No collections yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first collection to organize videos
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Collection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(collections || []).map((collection) => {
            const videoCount = collection.videoIds.length
            const collectionVideos = getCollectionVideos(collection)
            const firstVideo = collectionVideos[0]

            return (
              <Card
                key={collection.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedCollection(collection)}
              >
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                  {firstVideo ? (
                    <img
                      src={firstVideo.thumbnail}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      <VideoIcon className="w-3 h-3 mr-1" />
                      {videoCount} {videoCount === 1 ? 'video' : 'videos'}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{collection.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {collection.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Updated {formatDate(collection.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
