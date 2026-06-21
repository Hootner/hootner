import { useState, useEffect } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { Users, Plus, VideoCamera, Chat, Cursor, CheckCircle, Clock, UserCircle, Pencil, Trash, Share } from '@phosphor-icons/react'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Avatar } from '@/shared/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Separator } from '@/shared/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { Video, User } from '@/shared/lib/types'

interface CollaborationProject {
  id: string
  name: string
  description: string
  videoIds: string[]
  members: ProjectMember[]
  createdAt: string
  updatedAt: string
  status: 'active' | 'archived'
}

interface ProjectMember {
  username: string
  role: 'owner' | 'editor' | 'viewer'
  joinedAt: string
  isOnline: boolean
  currentActivity?: string
}

interface Comment {
  id: string
  videoId: string
  projectId: string
  author: string
  text: string
  timestamp: number
  replies: Comment[]
  resolved: boolean
}

interface CursorPosition {
  username: string
  x: number
  y: number
  color: string
}

const mockCollaborators: ProjectMember[] = [
  {
    username: 'sarah_m',
    role: 'editor',
    joinedAt: new Date(Date.now() - 86400000).toISOString(),
    isOnline: true,
    currentActivity: 'Reviewing Product Demo'
  },
  {
    username: 'john_d',
    role: 'editor',
    joinedAt: new Date(Date.now() - 172800000).toISOString(),
    isOnline: true,
    currentActivity: 'Editing Marketing Campaign'
  },
  {
    username: 'emily_r',
    role: 'viewer',
    joinedAt: new Date(Date.now() - 259200000).toISOString(),
    isOnline: false
  }
]

export default function CollaborativeWorkspace({ currentUser }: { currentUser: User }) {
  const [projects, setProjects] = usePlatformKV<CollaborationProject[]>('hootner-collab-projects', [])
  const [comments, setComments] = usePlatformKV<Comment[]>('hootner-collab-comments', [])
  const [videos] = usePlatformKV<Video[]>('hootner-videos', [])
  
  const [selectedProject, setSelectedProject] = useState<CollaborationProject | null>(null)
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newComment, setNewComment] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [cursors, setCursors] = useState<CursorPosition[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const newCursors: CursorPosition[] = mockCollaborators
        .filter(m => m.isOnline && Math.random() > 0.3)
        .map(m => ({
          username: m.username,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: `hsl(${Math.random() * 360}, 70%, 60%)`
        }))
      setCursors(newCursors)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const createProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name')
      return
    }

    const newProject: CollaborationProject = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDescription,
      videoIds: [],
      members: [
        {
          username: currentUser.username,
          role: 'owner',
          joinedAt: new Date().toISOString(),
          isOnline: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    }

    setProjects((current = []) => [...current, newProject])
    setNewProjectName('')
    setNewProjectDescription('')
    setShowNewProjectDialog(false)
    toast.success('Project created successfully')
  }

  const addVideoToProject = (projectId: string, videoId: string) => {
    setProjects((current = []) =>
      current.map(p =>
        p.id === projectId
          ? { ...p, videoIds: [...p.videoIds, videoId], updatedAt: new Date().toISOString() }
          : p
      )
    )
    toast.success('Video added to project')
  }

  const removeVideoFromProject = (projectId: string, videoId: string) => {
    setProjects((current = []) =>
      current.map(p =>
        p.id === projectId
          ? { ...p, videoIds: p.videoIds.filter(id => id !== videoId), updatedAt: new Date().toISOString() }
          : p
      )
    )
    toast.success('Video removed from project')
  }

  const addComment = (projectId: string, videoId: string) => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      videoId,
      projectId,
      author: currentUser.username,
      text: newComment,
      timestamp: Date.now(),
      replies: [],
      resolved: false
    }

    setComments((current = []) => [...current, comment])
    setNewComment('')
    toast.success('Comment added')
  }

  const inviteMember = () => {
    if (!inviteEmail.trim() || !selectedProject) {
      toast.error('Please enter an email address')
      return
    }

    toast.success(`Invitation sent to ${inviteEmail}`)
    setInviteEmail('')
    setShowInviteDialog(false)
  }

  const projectComments = selectedProject
    ? (comments ?? []).filter(c => c.projectId === selectedProject.id)
    : []

  const activeProjects = (projects ?? []).filter(p => p.status === 'active')
  const projectVideos = selectedProject
    ? (videos ?? []).filter(v => selectedProject.videoIds.includes(v.id))
    : []

  const unassignedVideos = (videos ?? []).filter(v =>
    !selectedProject?.videoIds.includes(v.id)
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-accent" weight="fill" />
            Collaborative Workspace
          </h1>
          <p className="text-muted-foreground mt-1">
            Work together on video projects in real-time
          </p>
        </div>
        
        <Button onClick={() => setShowNewProjectDialog(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="w-5 h-5 mr-2" />
          New Project
        </Button>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/20 to-accent/10 border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-6 h-6 text-accent" weight="fill" />
              Active Collaborators
            </h3>
            <p className="text-sm text-muted-foreground">
              {mockCollaborators.filter(m => m.isOnline).length} people online now
            </p>
          </div>
          <div className="flex -space-x-2">
            {mockCollaborators.map((member, index) => (
              <motion.div
                key={member.username}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Avatar className={`w-10 h-10 border-2 ${member.isOnline ? 'border-green-500' : 'border-muted'} bg-primary`}>
                  <div className="w-full h-full flex items-center justify-center text-sm font-semibold">
                    {member.username.substring(0, 2).toUpperCase()}
                  </div>
                </Avatar>
                {member.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Projects</h3>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-2">
                {activeProjects.map((project) => {
                  const isSelected = selectedProject?.id === project.id
                  const onlineMembers = project.members.filter(m => m.isOnline).length

                  return (
                    <Card
                      key={project.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'bg-accent/20 border-accent' : ''
                      }`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium line-clamp-1">{project.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {project.videoIds.length}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {project.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{onlineMembers} online</span>
                        </div>
                      </div>
                    </Card>
                  )
                })}

                {activeProjects.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No projects yet</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowNewProjectDialog(true)}
                      className="mt-2"
                    >
                      Create one
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {selectedProject ? (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{selectedProject.name}</h2>
                    <p className="text-muted-foreground mb-4">{selectedProject.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        <VideoCamera className="w-3 h-3 mr-1" />
                        {selectedProject.videoIds.length} videos
                      </Badge>
                      <Badge variant="secondary">
                        <Users className="w-3 h-3 mr-1" />
                        {selectedProject.members.length} members
                      </Badge>
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Updated {new Date(selectedProject.updatedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                  <Button onClick={() => setShowInviteDialog(true)} variant="outline">
                    <Share className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                </div>

                <Separator className="my-6" />

                <Tabs defaultValue="videos" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>

                  <TabsContent value="videos" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Project Videos</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projectVideos.map((video) => (
                        <Card key={video.id} className="overflow-hidden group">
                          <div className="relative aspect-video bg-muted">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="p-3 space-y-2">
                            <h4 className="font-medium line-clamp-1">{video.title}</h4>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {video.views} views
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeVideoFromProject(selectedProject.id, video.id)}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {projectVideos.length === 0 && (
                      <Card className="p-8 text-center">
                        <VideoCamera className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No videos in this project</p>
                      </Card>
                    )}

                    {unassignedVideos.length > 0 && (
                      <div className="space-y-3 mt-6">
                        <h4 className="font-semibold text-sm">Add Videos</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {unassignedVideos.slice(0, 4).map((video) => (
                            <Card
                              key={video.id}
                              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => addVideoToProject(selectedProject.id, video.id)}
                            >
                              <div className="relative aspect-video bg-muted">
                                <img
                                  src={video.thumbnail}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-background/80 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Plus className="w-8 h-8 text-accent" />
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="members" className="space-y-4">
                    <div className="space-y-3">
                      {[...selectedProject.members, ...mockCollaborators].slice(0, 6).map((member) => (
                        <Card key={member.username} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="w-10 h-10 bg-primary">
                                  <div className="w-full h-full flex items-center justify-center text-sm font-semibold">
                                    {member.username.substring(0, 2).toUpperCase()}
                                  </div>
                                </Avatar>
                                {member.isOnline && (
                                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{member.username}</p>
                                <p className="text-xs text-muted-foreground">
                                  {member.isOnline ? member.currentActivity || 'Online' : 'Offline'}
                                </p>
                              </div>
                            </div>
                            <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                              {member.role}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-4">
                    <div className="space-y-3">
                      {projectComments.map((comment) => (
                        <Card key={comment.id} className="p-4">
                          <div className="flex gap-3">
                            <Avatar className="w-8 h-8 bg-primary shrink-0">
                              <div className="w-full h-full flex items-center justify-center text-xs font-semibold">
                                {comment.author.substring(0, 2).toUpperCase()}
                              </div>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{comment.author}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{comment.text}</p>
                            </div>
                          </div>
                        </Card>
                      ))}

                      {projectComments.length === 0 && (
                        <Card className="p-8 text-center">
                          <Chat className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No activity yet</p>
                        </Card>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1"
                        rows={2}
                      />
                      <Button
                        onClick={() => addComment(selectedProject.id, projectVideos[0]?.id || '')}
                        disabled={!newComment.trim()}
                      >
                        Post
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>

              <AnimatePresence>
                {cursors.map((cursor) => (
                  <motion.div
                    key={cursor.username}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1, x: `${cursor.x}%`, y: `${cursor.y}%` }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="fixed pointer-events-none z-50"
                  >
                    <Cursor weight="fill" className="w-6 h-6" style={{ color: cursor.color }} />
                    <Badge
                      className="ml-6 -mt-4 text-xs"
                      style={{ backgroundColor: cursor.color }}
                    >
                      {cursor.username}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Select a project</h3>
              <p className="text-muted-foreground mb-4">
                Choose a project from the sidebar to start collaborating
              </p>
              <Button onClick={() => setShowNewProjectDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Project
              </Button>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Start a collaborative workspace for your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input
                placeholder="Marketing Campaign Q1"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe what this project is about..."
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to collaborate on {selectedProject?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={inviteMember}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
