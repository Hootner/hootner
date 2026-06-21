import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Separator } from '@/shared/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/ui/dialog'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { 
  Database, 
  Download, 
  Upload, 
  Trash, 
  Copy, 
  Clock,
  HardDrive,
  ChartLine,
  FileArchive,
  Plus,
  FolderOpen,
  PencilSimple,
  FloppyDisk,
  Eye,
  ArrowsClockwise,
  CheckCircle,
  Warning,
  Package,
  Cloud
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useProjects, useSessions, useStorageStats, useDataExport, useAutoBackup } from './use-storage'
import { formatBytes, exportData, sanitizeProjectName } from './storage'
import type { HologramProject } from './storage'
import { CloudStorageUI } from './CloudStorageUI'

interface StorageManagerProps {
  currentConfig: any
  onLoadProject: (project: HologramProject) => void
}

export function StorageManager({ currentConfig, onLoadProject }: StorageManagerProps) {
  const { 
    projects, 
    createProject, 
    updateProject, 
    deleteProject, 
    duplicateProject,
    incrementViewCount 
  } = useProjects()
  
  const { sessions, clearSessions } = useSessions()
  const stats = useStorageStats()
  const { exportAllData, importAllData } = useDataExport()
  const { backups, lastBackup, restoreBackup, clearBackups } = useAutoBackup(30)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<HologramProject | null>(null)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectTags, setProjectTags] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState<string | null>(null)

  const allTags = Array.from(
    new Set(projects.flatMap(p => p.tags || []))
  ).sort()

  const filteredProjects = projects.filter(p => {
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesTag = !filterTag || (p.tags && p.tags.includes(filterTag))
    
    return matchesSearch && matchesTag
  })

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name')
      return
    }

    const tags = projectTags.split(',').map(t => t.trim()).filter(Boolean)
    
    const project = createProject({
      name: sanitizeProjectName(projectName),
      description: projectDescription.trim() || undefined,
      config: currentConfig,
      tags: tags.length > 0 ? tags : undefined,
    })

    toast.success(`Project "${project.name}" created successfully`)
    setProjectName('')
    setProjectDescription('')
    setProjectTags('')
    setShowCreateDialog(false)
  }

  const handleEditProject = () => {
    if (!selectedProject || !projectName.trim()) return

    const tags = projectTags.split(',').map(t => t.trim()).filter(Boolean)
    
    updateProject(selectedProject.id, {
      name: sanitizeProjectName(projectName),
      description: projectDescription.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    })

    toast.success('Project updated successfully')
    setShowEditDialog(false)
    setSelectedProject(null)
    setProjectName('')
    setProjectDescription('')
    setProjectTags('')
  }

  const handleLoadProject = (project: HologramProject) => {
    onLoadProject(project)
    incrementViewCount(project.id)
    toast.success(`Loaded project "${project.name}"`)
  }

  const handleDuplicateProject = (project: HologramProject) => {
    const duplicate = duplicateProject(project.id)
    if (duplicate) {
      toast.success(`Duplicated project as "${duplicate.name}"`)
    }
  }

  const handleDeleteProject = () => {
    if (!selectedProject) return
    deleteProject(selectedProject.id)
    toast.success('Project deleted successfully')
    setShowDeleteConfirm(false)
    setSelectedProject(null)
  }

  const handleExportAll = () => {
    const data = exportAllData()
    const blob = exportData(data)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `hologram-data-export-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('All data exported successfully')
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)
          importAllData(data)
          toast.success('Data imported successfully')
        } catch (error) {
          toast.error('Invalid data file')
        }
      }
      reader.readAsText(file)
    }

    input.click()
  }

  const handleRestoreBackup = (timestamp: number) => {
    const success = restoreBackup(timestamp)
    if (success) {
      toast.success('Backup restored successfully')
    } else {
      toast.error('Failed to restore backup')
    }
  }

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
      clearSessions()
      projects.forEach(p => deleteProject(p.id))
      toast.success('All data cleared')
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="projects">
            <FolderOpen className="mr-2" size={16} />
            Projects
          </TabsTrigger>
          <TabsTrigger value="cloud">
            <Cloud className="mr-2" size={16} />
            Cloud
          </TabsTrigger>
          <TabsTrigger value="stats">
            <ChartLine className="mr-2" size={16} />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="backups">
            <FileArchive className="mr-2" size={16} />
            Backups
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="mr-2" size={16} />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <FolderOpen />
              SAVED PROJECTS
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="border-primary/50 hover:border-primary hover:bg-primary/10"
            >
              <Plus className="mr-2" size={16} />
              Save Current
            </Button>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-primary/30"
            />

            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterTag === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterTag(null)}
                  className="text-xs"
                >
                  All
                </Button>
                {allTags.map(tag => (
                  <Button
                    key={tag}
                    variant={filterTag === tag ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterTag(tag)}
                    className="text-xs"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {filteredProjects.length === 0 ? (
            <Card className="p-8 text-center bg-secondary/20 border-primary/20">
              <Package className="mx-auto mb-3 text-muted-foreground" size={48} />
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterTag 
                  ? 'No projects match your search'
                  : 'No projects saved yet. Save your current configuration to get started!'}
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map(project => (
                <Card
                  key={project.id}
                  className="p-4 border-primary/30 bg-secondary/20 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground truncate">
                          {project.name}
                        </h4>
                        {project.viewCount && project.viewCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Eye className="mr-1" size={12} />
                            {project.viewCount}
                          </Badge>
                        )}
                      </div>
                      
                      {project.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                        {project.tags && project.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex gap-1 flex-wrap">
                              {project.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoadProject(project)}
                        className="border-primary/50 hover:border-primary hover:bg-primary/10"
                      >
                        <FolderOpen className="mr-1" size={14} />
                        Load
                      </Button>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedProject(project)
                            setProjectName(project.name)
                            setProjectDescription(project.description || '')
                            setProjectTags(project.tags?.join(', ') || '')
                            setShowEditDialog(true)
                          }}
                        >
                          <PencilSimple size={14} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDuplicateProject(project)}
                        >
                          <Copy size={14} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => {
                            setSelectedProject(project)
                            setShowDeleteConfirm(true)
                          }}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cloud" className="space-y-4 mt-4">
          <CloudStorageUI 
            currentConfig={currentConfig}
            onLoadProject={onLoadProject}
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4 mt-4">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <ChartLine />
            STORAGE STATISTICS
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-secondary/20 border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <FolderOpen className="text-primary" size={20} />
                <span className="text-sm text-muted-foreground">Projects</span>
              </div>
              <p className="text-2xl font-bold text-primary">{stats.totalProjects}</p>
            </Card>

            <Card className="p-4 bg-secondary/20 border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-primary" size={20} />
                <span className="text-sm text-muted-foreground">Sessions</span>
              </div>
              <p className="text-2xl font-bold text-primary">{stats.totalSessions}</p>
            </Card>

            <Card className="p-4 bg-secondary/20 border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="text-primary" size={20} />
                <span className="text-sm text-muted-foreground">Screenshots</span>
              </div>
              <p className="text-2xl font-bold text-primary">{stats.totalScreenshots}</p>
            </Card>

            <Card className="p-4 bg-secondary/20 border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="text-primary" size={20} />
                <span className="text-sm text-muted-foreground">Storage Used</span>
              </div>
              <p className="text-2xl font-bold text-primary">{formatBytes(stats.storageUsed)}</p>
            </Card>
          </div>

          <Separator className="bg-primary/30" />

          <div className="space-y-3">
            <Card className="p-4 bg-secondary/20 border-primary/30">
              <h4 className="text-sm font-semibold mb-2 text-primary">Most Used Feature</h4>
              <p className="text-lg font-bold">{stats.mostUsedFeature}</p>
            </Card>

            <Card className="p-4 bg-secondary/20 border-primary/30">
              <h4 className="text-sm font-semibold mb-2 text-primary">Favorite Object</h4>
              <p className="text-lg font-bold capitalize">{stats.favoriteObject}</p>
            </Card>

            <Card className="p-4 bg-secondary/20 border-primary/30">
              <h4 className="text-sm font-semibold mb-2 text-primary">Avg Session Duration</h4>
              <p className="text-lg font-bold">
                {Math.round(stats.averageSessionDuration / 1000 / 60)} minutes
              </p>
            </Card>
          </div>

          {sessions.length > 0 && (
            <>
              <Separator className="bg-primary/30" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-primary">Recent Sessions</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSessions}
                    className="border-destructive/50 hover:border-destructive hover:bg-destructive/10"
                  >
                    <Trash className="mr-1" size={14} />
                    Clear
                  </Button>
                </div>
                <div className="space-y-2">
                  {sessions.slice(-5).reverse().map(session => (
                    <Card key={session.id} className="p-3 bg-secondary/20 border-primary/30">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {new Date(session.startTime).toLocaleString()}
                        </span>
                        <Badge variant="secondary">
                          {Math.round((session.duration || 0) / 1000 / 60)}m
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {session.totalInteractions} interactions • {session.screenshotsTaken} screenshots
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="backups" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <FileArchive />
              AUTO BACKUPS
            </h3>
            {lastBackup > 0 && (
              <Badge variant="secondary" className="text-xs">
                Last: {new Date(lastBackup).toLocaleTimeString()}
              </Badge>
            )}
          </div>

          <Alert className="border-primary/30 bg-primary/10">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Automatic backups are created every 30 minutes. The last 10 backups are kept.
            </AlertDescription>
          </Alert>

          {backups.length === 0 ? (
            <Card className="p-8 text-center bg-secondary/20 border-primary/20">
              <FileArchive className="mx-auto mb-3 text-muted-foreground" size={48} />
              <p className="text-sm text-muted-foreground">
                No backups yet. Backups will be created automatically.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {backups.slice().reverse().map(backup => (
                <Card key={backup.timestamp} className="p-4 border-primary/30 bg-secondary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">
                        {new Date(backup.timestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {backup.data.projects.length} projects • {backup.data.screenshots.length} screenshots
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreBackup(backup.timestamp)}
                      className="border-primary/50 hover:border-primary hover:bg-primary/10"
                    >
                      <ArrowsClockwise className="mr-1" size={14} />
                      Restore
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {backups.length > 0 && (
            <Button
              variant="outline"
              onClick={clearBackups}
              className="w-full border-destructive/50 hover:border-destructive hover:bg-destructive/10"
            >
              <Trash className="mr-2" />
              Clear All Backups
            </Button>
          )}
        </TabsContent>

        <TabsContent value="data" className="space-y-4 mt-4">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <Database />
            DATA MANAGEMENT
          </h3>

          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={handleExportAll}
              className="w-full border-primary/50 hover:border-primary hover:bg-primary/10"
            >
              <Download className="mr-2" />
              Export All Data
            </Button>

            <Button
              variant="outline"
              onClick={handleImportData}
              className="w-full border-primary/50 hover:border-primary hover:bg-primary/10"
            >
              <Upload className="mr-2" />
              Import Data
            </Button>
          </div>

          <Separator className="bg-primary/30" />

          <Alert className="border-destructive/30 bg-destructive/10">
            <Warning className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Danger Zone:</strong> The action below will permanently delete all data.
            </AlertDescription>
          </Alert>

          <Button
            variant="outline"
            onClick={handleClearAllData}
            className="w-full border-destructive/50 hover:border-destructive hover:bg-destructive/10"
          >
            <Trash className="mr-2" />
            Clear All Data
          </Button>

          <div className="p-4 bg-secondary/20 rounded-lg border border-primary/20">
            <h4 className="text-sm font-bold mb-2">Data Export Format</h4>
            <p className="text-xs text-muted-foreground">
              Exported data includes all projects, sessions, history, screenshots, favorites, and settings in JSON format. 
              You can use this to backup your data or transfer it to another device.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="glass-panel border-primary/50">
          <DialogHeader>
            <DialogTitle className="text-primary">Save New Project</DialogTitle>
            <DialogDescription>
              Save your current hologram configuration as a project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name *</Label>
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
                placeholder="A brief description of this project"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="border-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-tags">Tags (comma separated, optional)</Label>
              <Input
                id="project-tags"
                placeholder="neon, abstract, demo"
                value={projectTags}
                onChange={(e) => setProjectTags(e.target.value)}
                className="border-primary/30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="border-primary/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              className="bg-primary text-primary-foreground"
            >
              <FloppyDisk className="mr-2" />
              Save Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="glass-panel border-primary/50">
          <DialogHeader>
            <DialogTitle className="text-primary">Edit Project</DialogTitle>
            <DialogDescription>
              Update project details and organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-name">Project Name *</Label>
              <Input
                id="edit-project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="border-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-description">Description</Label>
              <Input
                id="edit-project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="border-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-tags">Tags</Label>
              <Input
                id="edit-project-tags"
                value={projectTags}
                onChange={(e) => setProjectTags(e.target.value)}
                className="border-primary/30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="border-primary/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditProject}
              className="bg-primary text-primary-foreground"
            >
              <FloppyDisk className="mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="glass-panel border-destructive/50">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="border-primary/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground"
            >
              <Trash className="mr-2" />
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
