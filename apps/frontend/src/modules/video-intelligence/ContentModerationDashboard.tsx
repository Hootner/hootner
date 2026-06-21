import { useState, useEffect } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/ui/alert-dialog'
import { 
  Shield, ShieldCheck, ShieldWarning, Eye, CheckCircle, 
  XCircle, Clock, Flag, Brain, Trash, Play, Download
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/utils'
import type { Video, User } from '@/shared/lib/types'

interface ModerationFlag {
  id: string
  videoId: string
  flagType: 'violence' | 'adult' | 'spam' | 'copyright' | 'misinformation' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  timestamp: number
  aiDetected: boolean
  description: string
  flaggedAt: string
  status: 'pending' | 'approved' | 'rejected' | 'escalated'
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

interface ModerationStats {
  totalFlags: number
  pendingReview: number
  approved: number
  rejected: number
  autoApproved: number
  avgReviewTime: number
}

export default function ContentModerationDashboard({ currentUser }: { currentUser: User }) {
  const [videos] = usePlatformKV<Video[]>('hootner-videos', [])
  const [flags, setFlags] = usePlatformKV<ModerationFlag[]>('hootner-moderation-flags', [])
  const [selectedFlag, setSelectedFlag] = useState<ModerationFlag | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    if (!flags || flags.length === 0) {
      generateInitialFlags()
    }
  }, [])

  const generateInitialFlags = async () => {
    if (!videos || videos.length === 0) return

    const flagTypes: ModerationFlag['flagType'][] = ['violence', 'adult', 'spam', 'copyright', 'misinformation', 'other']
    const severities: ModerationFlag['severity'][] = ['low', 'medium', 'high', 'critical']
    
    const newFlags: ModerationFlag[] = []

    videos.slice(0, Math.min(5, videos.length)).forEach((video, i) => {
      if (Math.random() > 0.3) {
        const flagType = flagTypes[Math.floor(Math.random() * flagTypes.length)]
        const severity = severities[Math.floor(Math.random() * severities.length)]
        
        newFlags.push({
          id: `flag-${Date.now()}-${i}`,
          videoId: video.id,
          flagType,
          severity,
          confidence: Math.random() * 40 + 60,
          timestamp: Math.random() * video.duration,
          aiDetected: Math.random() > 0.3,
          description: getDescriptionForFlag(flagType),
          flaggedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
          status: Math.random() > 0.5 ? 'pending' : (Math.random() > 0.5 ? 'approved' : 'rejected')
        })
      }
    })

    setFlags((prev = []) => [...prev, ...newFlags])
  }

  const getDescriptionForFlag = (type: ModerationFlag['flagType']): string => {
    const descriptions = {
      violence: 'Potential violent content detected in video frames',
      adult: 'Adult or inappropriate content may be present',
      spam: 'Video appears to contain spam or misleading content',
      copyright: 'Potential copyright violation detected',
      misinformation: 'Content may contain false or misleading information',
      other: 'Content flagged for manual review'
    }
    return descriptions[type]
  }

  const scanAllVideos = async () => {
    setIsScanning(true)
    toast.loading('Scanning videos...', { id: 'scan' })

    await new Promise(resolve => setTimeout(resolve, 3000))

    const newFlags: ModerationFlag[] = []
    const videosToScan = videos?.filter(v => 
      !flags?.some(f => f.videoId === v.id && f.status === 'pending')
    ) || []

    videosToScan.slice(0, 3).forEach((video) => {
      if (Math.random() > 0.5) {
        const flagTypes: ModerationFlag['flagType'][] = ['violence', 'adult', 'spam', 'copyright', 'misinformation']
        const severities: ModerationFlag['severity'][] = ['low', 'medium', 'high']
        
        newFlags.push({
          id: `flag-${Date.now()}-${Math.random()}`,
          videoId: video.id,
          flagType: flagTypes[Math.floor(Math.random() * flagTypes.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          confidence: Math.random() * 30 + 70,
          timestamp: Math.random() * video.duration,
          aiDetected: true,
          description: 'AI-detected potential policy violation',
          flaggedAt: new Date().toISOString(),
          status: 'pending'
        })
      }
    })

    setFlags((prev = []) => [...prev, ...newFlags])
    setIsScanning(false)
    toast.success(`Scan complete. ${newFlags.length} new flags detected.`, { id: 'scan' })
  }

  const approveFlag = (flag: ModerationFlag) => {
    const updated = {
      ...flag,
      status: 'approved' as const,
      reviewedBy: currentUser.username,
      reviewedAt: new Date().toISOString(),
      notes: reviewNotes
    }

    setFlags((prev = []) => prev.map(f => f.id === flag.id ? updated : f))
    toast.success('Content approved')
    setShowReviewDialog(false)
    setReviewNotes('')
    setSelectedFlag(null)
  }

  const rejectFlag = (flag: ModerationFlag) => {
    const updated = {
      ...flag,
      status: 'rejected' as const,
      reviewedBy: currentUser.username,
      reviewedAt: new Date().toISOString(),
      notes: reviewNotes
    }

    setFlags((prev = []) => prev.map(f => f.id === flag.id ? updated : f))
    toast.success('Flag rejected - content is compliant')
    setShowReviewDialog(false)
    setReviewNotes('')
    setSelectedFlag(null)
  }

  const escalateFlag = (flag: ModerationFlag) => {
    const updated = {
      ...flag,
      status: 'escalated' as const,
      severity: 'critical' as const,
      reviewedBy: currentUser.username,
      reviewedAt: new Date().toISOString(),
      notes: reviewNotes
    }

    setFlags((prev = []) => prev.map(f => f.id === flag.id ? updated : f))
    toast.warning('Flag escalated to senior moderators')
    setShowReviewDialog(false)
    setReviewNotes('')
    setSelectedFlag(null)
  }

  const calculateStats = (): ModerationStats => {
    if (!flags) {
      return {
        totalFlags: 0,
        pendingReview: 0,
        approved: 0,
        rejected: 0,
        autoApproved: 0,
        avgReviewTime: 0
      }
    }

    return {
      totalFlags: flags.length,
      pendingReview: flags.filter(f => f.status === 'pending').length,
      approved: flags.filter(f => f.status === 'approved').length,
      rejected: flags.filter(f => f.status === 'rejected').length,
      autoApproved: flags.filter(f => f.aiDetected && f.status === 'approved').length,
      avgReviewTime: 24
    }
  }

  const getVideoForFlag = (flag: ModerationFlag): Video | undefined => {
    return videos?.find(v => v.id === flag.videoId)
  }

  const getSeverityColor = (severity: ModerationFlag['severity']) => {
    switch (severity) {
      case 'low': return 'text-blue-500'
      case 'medium': return 'text-yellow-500'
      case 'high': return 'text-orange-500'
      case 'critical': return 'text-red-500'
    }
  }

  const getSeverityBadgeVariant = (severity: ModerationFlag['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      default: return 'secondary'
    }
  }

  const filteredFlags = flags?.filter(flag => {
    if (filterStatus !== 'all' && flag.status !== filterStatus) return false
    if (filterSeverity !== 'all' && flag.severity !== filterSeverity) return false
    return true
  }) || []

  const stats = calculateStats()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Content Moderation</h2>
          <p className="text-muted-foreground">AI-powered content review and compliance</p>
        </div>
        <Button onClick={scanAllVideos} disabled={isScanning} className="gap-2">
          <Brain className="w-4 h-4" />
          {isScanning ? 'Scanning...' : 'Scan All Videos'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Flag className="w-8 h-8 text-accent" />
          </div>
          <p className="text-3xl font-bold">{stats.totalFlags}</p>
          <p className="text-sm text-muted-foreground">Total Flags</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold">{stats.pendingReview}</p>
          <p className="text-sm text-muted-foreground">Pending Review</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold">{stats.approved}</p>
          <p className="text-sm text-muted-foreground">Approved</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-3xl font-bold">{stats.rejected}</p>
          <p className="text-sm text-muted-foreground">Violations</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <ShieldCheck className="w-8 h-8 text-accent" />
          </div>
          <p className="text-3xl font-bold">{stats.autoApproved}</p>
          <p className="text-sm text-muted-foreground">Auto-Approved</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Moderation Queue</h3>
            <div className="flex items-center gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {filteredFlags.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No Flags Found</p>
                  <p className="text-sm text-muted-foreground">All content is compliant or no filters match</p>
                </div>
              ) : (
                filteredFlags.map((flag) => {
                  const video = getVideoForFlag(flag)
                  
                  return (
                    <Card
                      key={flag.id}
                      className={cn(
                        'p-4 cursor-pointer transition-all hover:border-accent',
                        selectedFlag?.id === flag.id && 'border-accent bg-accent/5'
                      )}
                      onClick={() => {
                        setSelectedFlag(flag)
                        if (flag.status === 'pending') {
                          setShowReviewDialog(true)
                        }
                      }}
                    >
                      <div className="flex gap-4">
                        <div className="w-32 h-20 bg-muted rounded overflow-hidden shrink-0">
                          {video && (
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{video?.title || 'Unknown Video'}</p>
                              <p className="text-xs text-muted-foreground">Flagged at {formatTime(flag.timestamp)}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-3">
                              <Badge variant={getSeverityBadgeVariant(flag.severity)} className="capitalize">
                                {flag.severity}
                              </Badge>
                              {flag.aiDetected && (
                                <Badge variant="outline" className="gap-1">
                                  <Brain className="w-3 h-3" />
                                  AI
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm mb-2">{flag.description}</p>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="capitalize flex items-center gap-1">
                              <Flag className="w-3 h-3" />
                              {flag.flagType}
                            </span>
                            <span>Confidence: {flag.confidence.toFixed(0)}%</span>
                            <span>{formatDate(flag.flaggedAt)}</span>
                            {flag.status === 'pending' ? (
                              <Badge variant="outline" className="gap-1">
                                <Clock className="w-3 h-3" />
                                Pending
                              </Badge>
                            ) : flag.status === 'approved' ? (
                              <Badge variant="outline" className="gap-1 text-green-500">
                                <CheckCircle className="w-3 h-3" />
                                Approved
                              </Badge>
                            ) : flag.status === 'rejected' ? (
                              <Badge variant="outline" className="gap-1 text-red-500">
                                <XCircle className="w-3 h-3" />
                                Rejected
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1">
                                <ShieldWarning className="w-3 h-3" />
                                Escalated
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            Quick Stats
          </h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Flag Types</h4>
              <div className="space-y-2">
                {['violence', 'adult', 'spam', 'copyright', 'misinformation', 'other'].map((type) => {
                  const count = flags?.filter(f => f.flagType === type).length || 0
                  const percentage = flags && flags.length > 0 ? (count / flags.length) * 100 : 0
                  
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="capitalize text-muted-foreground">{type}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Review Performance</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Avg Review Time</span>
                  <span className="font-medium">{stats.avgReviewTime}h</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">AI Accuracy</span>
                  <span className="font-medium">87%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Compliance Rate</span>
                  <span className="font-medium text-green-500">94%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>3 flags approved in last hour</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>1 violation detected today</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Brain className="w-4 h-4 text-accent" />
                  <span>AI scanned 12 videos</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <AlertDialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-accent" />
              Review Content Flag
            </AlertDialogTitle>
            <AlertDialogDescription>
              Review this flagged content and take appropriate action.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedFlag && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-48 h-28 bg-muted rounded overflow-hidden shrink-0">
                  {getVideoForFlag(selectedFlag) && (
                    <img 
                      src={getVideoForFlag(selectedFlag)!.thumbnail} 
                      alt="Video thumbnail" 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">{getVideoForFlag(selectedFlag)?.title}</p>
                  <p className="text-sm text-muted-foreground mb-2">{selectedFlag.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityBadgeVariant(selectedFlag.severity)} className="capitalize">
                      {selectedFlag.severity}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {selectedFlag.flagType}
                    </Badge>
                    <Badge variant="secondary">
                      {selectedFlag.confidence.toFixed(0)}% confidence
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
                <Brain className="w-5 h-5 text-accent" />
                <span className="text-muted-foreground">
                  {selectedFlag.aiDetected ? 'AI-detected flag' : 'Manual flag'} • 
                  Flagged at {formatTime(selectedFlag.timestamp)} • 
                  {formatDate(selectedFlag.flaggedAt)}
                </span>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {selectedFlag && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => approveFlag(selectedFlag)}
                  className="gap-2"
                >
                  <Trash className="w-4 h-4" />
                  Remove Content
                </Button>
                <Button
                  variant="outline"
                  onClick={() => escalateFlag(selectedFlag)}
                  className="gap-2"
                >
                  <ShieldWarning className="w-4 h-4" />
                  Escalate
                </Button>
                <Button
                  onClick={() => rejectFlag(selectedFlag)}
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Content
                </Button>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
