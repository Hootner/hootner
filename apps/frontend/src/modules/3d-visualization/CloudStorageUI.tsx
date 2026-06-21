import { useState, useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Separator } from '@/shared/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/shared/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { 
  Cloud, 
  CloudArrowUp,
  CloudArrowDown,
  CloudCheck,
  CloudSlash,
  Share,
  Users,
  Globe,
  Lock,
  ArrowsClockwise,
  Download,
  Upload,
  Trash,
  Eye,
  Copy,
  CheckCircle,
  Warning,
  Spinner,
  Info,
  Shield
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useCloudStorage } from './use-cloud-storage'
import { CloudSecurityManager } from './CloudSecurityManager'
import type { HologramProject } from './storage'

interface CloudStorageUIProps {
  currentConfig: any
  onLoadProject: (project: HologramProject) => void
}

export function CloudStorageUI({ currentConfig, onLoadProject }: CloudStorageUIProps) {
  const {
    cloudProjects,
    isLoading,
    syncStatus,
    autoSyncEnabled,
    setAutoSyncEnabled,
    uploadProject,
    downloadProject,
    deleteFromCloud,
    syncProject,
    shareProject,
    loadSharedProject,
    getPublicProjects,
    exportCloudData,
    importCloudData,
    refreshProjects
  } = useCloudStorage()

  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showPublicDialog, setShowPublicDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [makePublic, setMakePublic] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [publicProjects, setPublicProjects] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadUser = async () => {
      const userInfo = { login: 'platform-user' }
      setUser(userInfo)
    }
    loadUser()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shareToken = params.get('share')
    
    if (shareToken) {
      loadSharedProject(shareToken).then(project => {
        if (project) {
          onLoadProject(project as any)
          window.history.replaceState({}, '', window.location.pathname)
        }
      })
    }
  }, [loadSharedProject, onLoadProject])

  const handleUploadProject = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name')
      return
    }

    try {
      await uploadProject({
        id: `cloud-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: projectName.trim(),
        description: projectDescription.trim() || undefined,
        config: currentConfig,
        isPublic: makePublic,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })

      setProjectName('')
      setProjectDescription('')
      setMakePublic(false)
      setShowUploadDialog(false)
      toast.success('Project uploaded to cloud')
    } catch (error) {
      console.error('Failed to upload project:', error)
    }
  }

  const handleShareProject = async (project: any) => {
    try {
      const url = await shareProject(project.id)
      setShareUrl(url)
      setSelectedProject(project)
      setShowShareDialog(true)
    } catch (error) {
      console.error('Failed to share project:', error)
    }
  }

  const handleLoadPublicProjects = async () => {
    try {
      const projects = await getPublicProjects()
      setPublicProjects(projects)
      setShowPublicDialog(true)
    } catch (error) {
      console.error('Failed to load public projects:', error)
    }
  }

  const handleDownloadProject = async (projectId: string) => {
    try {
      const project = await downloadProject(projectId)
      if (project) {
        onLoadProject(project as any)
        toast.success('Project loaded from cloud')
      }
    } catch (error) {
      console.error('Failed to download project:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Delete this project from cloud? This cannot be undone.')) {
      return
    }

    try {
      await deleteFromCloud(projectId)
      toast.success('Project deleted from cloud')
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const handleSyncProject = async (project: any) => {
    try {
      const result = await syncProject(project)
      
      if ('conflict' in result && result.conflict) {
        const useCloud = window.confirm(
          'Sync conflict detected!\n\n' +
          `Cloud version: ${result.conflict.cloudVersion}\n` +
          `Local version: ${result.conflict.localVersion}\n\n` +
          'Click OK to use cloud version, Cancel to keep local version.'
        )
        
        if (useCloud) {
          onLoadProject(result.conflict.cloudData)
          toast.success('Loaded cloud version')
        }
      } else {
        toast.success('Project synced successfully')
      }
    } catch (error) {
      console.error('Failed to sync project:', error)
    }
  }

  if (!user) {
    return (
      <Card className="p-8 text-center bg-secondary/20 border-primary/20">
        <Cloud className="mx-auto mb-4 text-muted-foreground" size={48} />
        <h3 className="text-lg font-semibold mb-2">Cloud Storage</h3>
        <p className="text-sm text-muted-foreground">
          Loading user information...
        </p>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="storage" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="storage" className="flex items-center gap-2">
          <Cloud size={16} />
          Storage
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield size={16} />
          Security
        </TabsTrigger>
      </TabsList>

      <TabsContent value="storage" className="space-y-6 mt-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <Cloud />
              CLOUD STORAGE
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Sync your holograms across devices • Signed in as {user.login}
            </p>
          </div>
        </div>

      <Card className="p-4 bg-secondary/20 border-primary/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {syncStatus?.isSyncing ? (
              <>
                <Spinner className="text-primary animate-spin" size={20} />
                <span className="text-sm font-semibold">Syncing...</span>
              </>
            ) : syncStatus?.syncError ? (
              <>
                <Warning className="text-destructive" size={20} />
                <span className="text-sm font-semibold text-destructive">Sync Error</span>
              </>
            ) : syncStatus?.lastSyncTime ? (
              <>
                <CloudCheck className="text-primary" size={20} />
                <span className="text-sm font-semibold text-primary">Synced</span>
              </>
            ) : (
              <>
                <CloudSlash className="text-muted-foreground" size={20} />
                <span className="text-sm font-semibold">Not Synced</span>
              </>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshProjects}
            disabled={syncStatus?.isSyncing}
            className="hover:bg-primary/10"
          >
            <ArrowsClockwise className={syncStatus?.isSyncing ? 'animate-spin' : ''} size={16} />
          </Button>
        </div>

        <div className="space-y-2 text-xs">
          {syncStatus?.lastSyncTime && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Sync:</span>
              <span>{new Date(syncStatus.lastSyncTime).toLocaleString()}</span>
            </div>
          )}
          {syncStatus && syncStatus.pendingChanges > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pending Changes:</span>
              <Badge variant="secondary">{syncStatus.pendingChanges}</Badge>
            </div>
          )}
          {syncStatus?.syncError && (
            <Alert variant="destructive" className="mt-2">
              <Warning className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {syncStatus.syncError}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator className="my-3 bg-primary/20" />

        <div className="flex items-center justify-between">
          <Label htmlFor="auto-sync" className="text-sm">
            Auto-Sync
          </Label>
          <Switch
            id="auto-sync"
            checked={autoSyncEnabled}
            onCheckedChange={setAutoSyncEnabled}
          />
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-primary/50 hover:border-primary hover:bg-primary/10"
            >
              <CloudArrowUp className="mr-2" size={16} />
              Upload Current
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel border-primary/50">
            <DialogHeader>
              <DialogTitle className="text-primary">Upload to Cloud</DialogTitle>
              <DialogDescription>
                Save your current hologram configuration to the cloud
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="My Awesome Hologram"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="border-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-description">Description (optional)</Label>
                <Input
                  id="project-description"
                  placeholder="A brief description..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="border-primary/30"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="make-public" className="text-sm">
                  Make Public
                </Label>
                <Switch
                  id="make-public"
                  checked={makePublic}
                  onCheckedChange={setMakePublic}
                />
              </div>
              {makePublic && (
                <Alert className="border-accent/50 bg-accent/10">
                  <Globe className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Public projects can be discovered and viewed by anyone
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
                className="border-primary/50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadProject}
                className="bg-primary text-primary-foreground holographic-glow"
              >
                <CloudArrowUp className="mr-2" />
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          onClick={handleLoadPublicProjects}
          className="border-primary/50 hover:border-primary hover:bg-primary/10"
        >
          <Globe className="mr-2" size={16} />
          Browse Public
        </Button>

        <Button
          variant="outline"
          onClick={exportCloudData}
          className="border-primary/50 hover:border-primary hover:bg-primary/10"
        >
          <Download className="mr-2" size={16} />
          Export
        </Button>

        <Button
          variant="outline"
          onClick={importCloudData}
          className="border-primary/50 hover:border-primary hover:bg-primary/10"
        >
          <Upload className="mr-2" size={16} />
          Import
        </Button>
      </div>

      <Separator className="bg-primary/30" />

      <div>
        <h4 className="text-md font-bold text-primary mb-3">Your Cloud Projects</h4>
        
        {isLoading ? (
          <Card className="p-8 text-center bg-secondary/20 border-primary/20">
            <Spinner className="mx-auto mb-3 text-primary animate-spin" size={32} />
            <p className="text-sm text-muted-foreground">
              Loading cloud projects...
            </p>
          </Card>
        ) : cloudProjects.length === 0 ? (
          <Card className="p-8 text-center bg-secondary/20 border-primary/20">
            <CloudSlash className="mx-auto mb-3 text-muted-foreground" size={48} />
            <p className="text-sm text-muted-foreground">
              No cloud projects yet. Upload your first hologram!
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {cloudProjects.map(project => (
              <Card
                key={project.id}
                className="p-4 border-primary/30 bg-secondary/20 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-foreground truncate">
                        {project.name}
                      </h5>
                      {project.isPublic ? (
                        <Badge variant="outline" className="text-xs border-accent/50 text-accent">
                          <Globe className="mr-1" size={12} />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="mr-1" size={12} />
                          Private
                        </Badge>
                      )}
                    </div>

                    {project.description && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                      <span>Version {project.version}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadProject(project.id)}
                      className="hover:bg-primary/20"
                    >
                      <CloudArrowDown className="mr-1" size={14} />
                      Load
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareProject(project)}
                      className="hover:bg-accent/20"
                    >
                      <Share className="mr-1" size={14} />
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="hover:bg-destructive/20 hover:text-destructive"
                    >
                      <Trash className="mr-1" size={14} />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="glass-panel border-primary/50">
          <DialogHeader>
            <DialogTitle className="text-primary">Share Project</DialogTitle>
            <DialogDescription>
              Share "{selectedProject?.name}" with others
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert className="border-accent/50 bg-accent/10">
              <Share className="h-4 w-4" />
              <AlertTitle>Share Link Created</AlertTitle>
              <AlertDescription className="text-xs mt-2">
                Anyone with this link can view and load this hologram configuration
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Share URL</Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-xs border-primary/30"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl)
                    toast.success('Link copied!')
                  }}
                  className="border-primary/50"
                >
                  <Copy size={16} />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowShareDialog(false)}
              className="bg-primary text-primary-foreground"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPublicDialog} onOpenChange={setShowPublicDialog}>
        <DialogContent className="glass-panel border-primary/50 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">Public Holograms</DialogTitle>
            <DialogDescription>
              Discover and load holograms shared by the community
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {publicProjects.length === 0 ? (
              <Card className="p-8 text-center bg-secondary/20 border-primary/20">
                <Globe className="mx-auto mb-3 text-muted-foreground" size={48} />
                <p className="text-sm text-muted-foreground">
                  No public projects available yet
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {publicProjects.map(project => (
                  <Card
                    key={project.id}
                    className="p-4 border-primary/30 bg-secondary/20 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h5 className="font-semibold text-foreground mb-1">
                          {project.name}
                        </h5>
                        {project.description && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {project.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          By {project.userId}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleDownloadProject(project.id)
                          setShowPublicDialog(false)
                        }}
                        className="border-primary/50 hover:border-primary"
                      >
                        <CloudArrowDown className="mr-1" size={14} />
                        Load
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPublicDialog(false)}
              className="border-primary/50"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TabsContent>

    <TabsContent value="security" className="mt-0">
      <CloudSecurityManager />
    </TabsContent>
  </Tabs>
  )
}
