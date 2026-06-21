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
import { 
  Shield,
  Key,
  Lock,
  LockOpen,
  Plus,
  Copy,
  Trash,
  Eye,
  EyeSlash,
  CheckCircle,
  Warning,
  Info,
  ArrowsClockwise,
  ShieldCheck
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cloudStorage, CloudAccessKey, CloudSecuritySettings } from './cloud-storage'

export function CloudSecurityManager() {
  const [securitySettings, setSecuritySettings] = useState<CloudSecuritySettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateKeyDialog, setShowCreateKeyDialog] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyPermissions, setNewKeyPermissions] = useState<('read' | 'write' | 'delete')[]>(['read', 'write'])
  const [keyExpiryDays, setKeyExpiryDays] = useState<number | undefined>(365)
  const [authKey, setAuthKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [masterKeyInfo, setMasterKeyInfo] = useState<{ key: string; displayUntil: number } | null>(null)
  const [showMasterKeyDialog, setShowMasterKeyDialog] = useState(false)

  useEffect(() => {
    loadSecuritySettings()
  }, [])

  const loadSecuritySettings = async () => {
    try {
      setIsLoading(true)
      const settings = await cloudStorage.getSecuritySettings()
      setSecuritySettings(settings)
      
      const user = { login: 'platform-user' }
      if (user) {
        const masterKeyData = JSON.parse(localStorage.getItem("master-key-display") || "null") as { key: string; displayUntil: number } | null
        if (masterKeyData && masterKeyData.displayUntil > Date.now()) {
          setMasterKeyInfo(masterKeyData)
          setShowMasterKeyDialog(true)
          if (settings.activeAccessKeys.length > 0) {
            setShowKeys({ [settings.activeAccessKeys[0].id]: true })
          }
        }
      }
      
      const savedKey = localStorage.getItem('hologram-cloud-access-key')
      if (savedKey) {
        const isValid = await cloudStorage.verifyAccessKey(savedKey)
        if (isValid) {
          cloudStorage.setAccessKey(savedKey)
          setIsAuthenticated(true)
          setAuthKey(savedKey)
        } else {
          localStorage.removeItem('hologram-cloud-access-key')
        }
      }
      
      if (!settings.requireAccessKey) {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Failed to load security settings:', error)
      toast.error('Failed to load security settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthenticate = async () => {
    try {
      const isValid = await cloudStorage.verifyAccessKey(authKey)
      if (isValid) {
        cloudStorage.setAccessKey(authKey)
        setIsAuthenticated(true)
        localStorage.setItem('hologram-cloud-access-key', authKey)
        toast.success('Authentication successful')
        setShowAuthDialog(false)
      } else {
        toast.error('Invalid access key')
      }
    } catch (error) {
      console.error('Authentication failed:', error)
      toast.error('Authentication failed')
    }
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name')
      return
    }

    if (newKeyPermissions.length === 0) {
      toast.error('Please select at least one permission')
      return
    }

    try {
      const newKey = await cloudStorage.generateAccessKey(
        newKeyName.trim(),
        newKeyPermissions,
        keyExpiryDays
      )

      await loadSecuritySettings()
      setNewKeyName('')
      setNewKeyPermissions(['read', 'write'])
      setKeyExpiryDays(365)
      setShowCreateKeyDialog(false)
      
      setShowKeys(prev => ({ ...prev, [newKey.id]: true }))
      
      toast.success('Access key created! Copy it now - you won\'t be able to see it again.')
    } catch (error) {
      console.error('Failed to create access key:', error)
    }
  }

  const handleRevokeKey = async (keyId: string) => {
    if (!window.confirm('Revoke this access key? Any applications using it will lose access.')) {
      return
    }

    try {
      await cloudStorage.revokeAccessKey(keyId)
      await loadSecuritySettings()
    } catch (error) {
      console.error('Failed to revoke access key:', error)
    }
  }

  const handleRotateKey = async (keyId: string, keyName: string) => {
    if (!window.confirm('Rotate this access key? The old key will be revoked and a new one generated.')) {
      return
    }

    try {
      const newKey = await cloudStorage.rotateAccessKey(keyId, `${keyName} (Rotated)`)
      await loadSecuritySettings()
      setShowKeys(prev => ({ ...prev, [newKey.id]: true }))
    } catch (error) {
      console.error('Failed to rotate access key:', error)
    }
  }

  const updateSettings = async (updates: Partial<CloudSecuritySettings>) => {
    try {
      await cloudStorage.updateSecuritySettings(updates)
      await loadSecuritySettings()
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  if (isLoading) {
    return (
      <Card className="p-8 text-center bg-secondary/20 border-primary/20">
        <Shield className="mx-auto mb-4 text-muted-foreground animate-pulse" size={48} />
        <p className="text-sm text-muted-foreground">
          Loading security settings...
        </p>
      </Card>
    )
  }

  if (!securitySettings) {
    return (
      <Card className="p-8 text-center bg-secondary/20 border-primary/20">
        <Warning className="mx-auto mb-4 text-destructive" size={48} />
        <p className="text-sm text-muted-foreground">
          Failed to load security settings
        </p>
      </Card>
    )
  }

  if (securitySettings.requireAccessKey && !isAuthenticated) {
    return (
      <Card className="p-8 bg-secondary/20 border-primary/20">
        <div className="text-center mb-6">
          <Lock className="mx-auto mb-4 text-primary" size={64} />
          <h3 className="text-xl font-bold text-primary mb-2">Cloud Storage Locked</h3>
          <p className="text-sm text-muted-foreground">
            Enter your access key to unlock cloud storage
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-key">Access Key</Label>
            <Input
              id="access-key"
              type="password"
              placeholder="holo_xxxxxxxxxxxxx"
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAuthenticate()
                }
              }}
              className="border-primary/30 font-mono"
            />
          </div>

          <Button
            onClick={handleAuthenticate}
            className="w-full bg-primary text-primary-foreground holographic-glow"
            disabled={!authKey.trim()}
          >
            <LockOpen className="mr-2" />
            Authenticate
          </Button>

          <Alert className="border-accent/50 bg-accent/10">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              This cloud storage is protected by access keys. If you're the owner, disable access key requirement in security settings.
            </AlertDescription>
          </Alert>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <Shield />
            CLOUD SECURITY
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Manage encryption, access keys, and permissions
          </p>
        </div>
        {isAuthenticated && (
          <Badge variant="outline" className="border-primary/50 text-primary">
            <CheckCircle className="mr-1" size={12} />
            Authenticated
          </Badge>
        )}
      </div>

      {!isAuthenticated && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <Warning className="h-4 w-4" />
          <AlertTitle>Not Authenticated</AlertTitle>
          <AlertDescription className="text-xs mt-2">
            Some features may be restricted. Enter your access key to unlock full functionality.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4 bg-secondary/20 border-primary/30">
        <h4 className="text-sm font-bold text-foreground mb-3">Security Settings</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="encryption" className="text-sm">
                Enable Encryption
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Encrypt all project data stored in the cloud
              </p>
            </div>
            <Switch
              id="encryption"
              checked={securitySettings.encryptionEnabled}
              onCheckedChange={(checked) => updateSettings({ encryptionEnabled: checked })}
            />
          </div>

          <Separator className="bg-primary/20" />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="require-key" className="text-sm">
                Require Access Key
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Require authentication with access key for all operations
              </p>
            </div>
            <Switch
              id="require-key"
              checked={securitySettings.requireAccessKey}
              onCheckedChange={(checked) => updateSettings({ requireAccessKey: checked })}
            />
          </div>

          <Separator className="bg-primary/20" />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="public-sharing" className="text-sm">
                Allow Public Sharing
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Enable sharing projects publicly with anyone
              </p>
            </div>
            <Switch
              id="public-sharing"
              checked={securitySettings.allowPublicSharing}
              onCheckedChange={(checked) => updateSettings({ allowPublicSharing: checked })}
            />
          </div>
        </div>
      </Card>

      <Separator className="bg-primary/30" />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-bold text-primary flex items-center gap-2">
            <Key />
            Access Keys
          </h4>
          <Dialog open={showCreateKeyDialog} onOpenChange={setShowCreateKeyDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-primary/50 hover:border-primary hover:bg-primary/10"
              >
                <Plus className="mr-1" size={16} />
                Create Key
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-primary/50">
              <DialogHeader>
                <DialogTitle className="text-primary">Create Access Key</DialogTitle>
                <DialogDescription>
                  Generate a new access key for secure cloud storage access
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="My Device Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="border-primary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="perm-read"
                        checked={newKeyPermissions.includes('read')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyPermissions([...newKeyPermissions, 'read'])
                          } else {
                            setNewKeyPermissions(newKeyPermissions.filter(p => p !== 'read'))
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor="perm-read" className="text-sm">Read - View and download projects</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="perm-write"
                        checked={newKeyPermissions.includes('write')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyPermissions([...newKeyPermissions, 'write'])
                          } else {
                            setNewKeyPermissions(newKeyPermissions.filter(p => p !== 'write'))
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor="perm-write" className="text-sm">Write - Upload and sync projects</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="perm-delete"
                        checked={newKeyPermissions.includes('delete')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyPermissions([...newKeyPermissions, 'delete'])
                          } else {
                            setNewKeyPermissions(newKeyPermissions.filter(p => p !== 'delete'))
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor="perm-delete" className="text-sm">Delete - Remove projects</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="key-expiry">Expiry (days)</Label>
                  <Input
                    id="key-expiry"
                    type="number"
                    placeholder="365"
                    value={keyExpiryDays || ''}
                    onChange={(e) => setKeyExpiryDays(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="border-primary/30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for no expiration
                  </p>
                </div>

                <Alert className="border-warning/50 bg-warning/10">
                  <Warning className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Store your access key securely. You won't be able to view it again after creation.
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateKeyDialog(false)}
                  className="border-primary/50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateKey}
                  className="bg-primary text-primary-foreground holographic-glow"
                >
                  <Key className="mr-2" />
                  Generate Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {securitySettings.activeAccessKeys.length === 0 ? (
          <Card className="p-8 text-center bg-secondary/20 border-primary/20">
            <Key className="mx-auto mb-3 text-muted-foreground" size={48} />
            <p className="text-sm text-muted-foreground mb-4">
              No access keys configured. Create your first key to secure cloud storage.
            </p>
            <Alert className="border-accent/50 bg-accent/10 text-left">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Access keys allow secure authentication without exposing your account credentials.
                Each key can have specific permissions and expiration dates.
              </AlertDescription>
            </Alert>
          </Card>
        ) : (
          <div className="space-y-2">
            {securitySettings.activeAccessKeys.map(accessKey => {
              const isExpired = accessKey.expiresAt && accessKey.expiresAt < Date.now()
              const daysUntilExpiry = accessKey.expiresAt 
                ? Math.floor((accessKey.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))
                : null

              return (
                <Card
                  key={accessKey.id}
                  className={`p-4 border-primary/30 bg-secondary/20 ${isExpired ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-semibold text-foreground">
                          {accessKey.name}
                        </h5>
                        {isExpired ? (
                          <Badge variant="destructive" className="text-xs">
                            Expired
                          </Badge>
                        ) : daysUntilExpiry !== null && daysUntilExpiry < 30 ? (
                          <Badge variant="outline" className="text-xs border-warning/50 text-warning">
                            Expires in {daysUntilExpiry}d
                          </Badge>
                        ) : null}
                      </div>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>Permissions:</span>
                          <div className="flex gap-1">
                            {accessKey.permissions.map(perm => (
                              <Badge key={perm} variant="secondary" className="text-xs">
                                {perm}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>Created: {new Date(accessKey.createdAt).toLocaleDateString()}</div>
                        {accessKey.lastUsed && (
                          <div>Last used: {new Date(accessKey.lastUsed).toLocaleString()}</div>
                        )}
                      </div>

                      {showKeys[accessKey.id] && (
                        <div className="mt-3 p-2 bg-black/30 rounded border border-primary/30">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-primary break-all">
                              {accessKey.key}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(accessKey.key)}
                              className="hover:bg-primary/20 shrink-0"
                            >
                              <Copy size={14} />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowKeys(prev => ({ ...prev, [accessKey.id]: !prev[accessKey.id] }))}
                        className="hover:bg-primary/20"
                      >
                        {showKeys[accessKey.id] ? (
                          <EyeSlash className="mr-1" size={14} />
                        ) : (
                          <Eye className="mr-1" size={14} />
                        )}
                        {showKeys[accessKey.id] ? 'Hide' : 'Show'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRotateKey(accessKey.id, accessKey.name)}
                        className="hover:bg-accent/20"
                      >
                        <ArrowsClockwise className="mr-1" size={14} />
                        Rotate
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeKey(accessKey.id)}
                        className="hover:bg-destructive/20 hover:text-destructive"
                      >
                        <Trash className="mr-1" size={14} />
                        Revoke
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Alert className="border-primary/50 bg-primary/10">
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Security Best Practices</AlertTitle>
        <AlertDescription className="text-xs mt-2 space-y-1">
          <ul className="list-disc list-inside space-y-1">
            <li>Keep your access keys secure and never share them publicly</li>
            <li>Use specific permissions for each key (principle of least privilege)</li>
            <li>Rotate keys regularly and revoke unused ones</li>
            <li>Enable encryption for sensitive hologram configurations</li>
            <li>Set expiration dates to automatically invalidate old keys</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Dialog open={showMasterKeyDialog} onOpenChange={setShowMasterKeyDialog}>
        <DialogContent className="glass-panel border-accent/50 max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-accent flex items-center gap-2 text-xl">
              <ShieldCheck className="animate-pulse" size={28} />
              🎉 Your Master Access Key
            </DialogTitle>
            <DialogDescription>
              <strong className="text-accent">IMPORTANT:</strong> Save this key now - you won't be able to see it again!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert className="border-accent/50 bg-accent/20">
              <Key className="h-5 w-5" />
              <AlertTitle className="text-accent">Master Key Created!</AlertTitle>
              <AlertDescription className="text-sm mt-2">
                Your cloud storage is now secured with a master access key. This key has full permissions (read, write, delete) and never expires.
              </AlertDescription>
            </Alert>

            {masterKeyInfo && (
              <div className="space-y-3">
                <Label className="text-sm font-bold">Your Master Access Key:</Label>
                <div className="p-4 bg-black/40 rounded-lg border-2 border-accent/50 holographic-glow">
                  <code className="text-sm font-mono text-accent break-all block mb-3">
                    {masterKeyInfo.key}
                  </code>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(masterKeyInfo.key)
                      toast.success('Master key copied to clipboard!')
                    }}
                    className="w-full border-accent/50 hover:border-accent hover:bg-accent/20"
                  >
                    <Copy className="mr-2" />
                    Copy Master Key
                  </Button>
                </div>

                <Alert className="border-warning/50 bg-warning/10">
                  <Warning className="h-4 w-4" />
                  <AlertTitle className="text-sm">Security Reminder</AlertTitle>
                  <AlertDescription className="text-xs mt-1 space-y-1">
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Save this key in a secure location</strong> (password manager recommended)</li>
                      <li>This key will be hidden after you close this dialog</li>
                      <li>You can view it again in the Access Keys section below</li>
                      <li>Enable "Require Access Key" in settings to lock your cloud storage</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Next Steps:
                  </h4>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Copy and save your master key securely</li>
                    <li>Enable "Require Access Key" in Security Settings to lock your cloud</li>
                    <li>Create additional keys with limited permissions for other devices</li>
                    <li>Test your key by enabling access key requirement</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                const user = { login: 'platform-user' }
                if (user) {
                  localStorage.removeItem("master-key-display")
                }
                setShowMasterKeyDialog(false)
                setMasterKeyInfo(null)
              }}
              className="bg-accent text-accent-foreground holographic-glow"
            >
              <CheckCircle className="mr-2" />
              I've Saved My Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
