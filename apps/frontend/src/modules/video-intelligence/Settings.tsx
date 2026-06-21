import { useState } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { User, Bell, Key, Shield, CheckCircle } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Button } from '@/shared/ui/button'
import { Switch } from '@/shared/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Separator } from '@/shared/ui/separator'
import { toast } from 'sonner'

interface UserSettings {
  email: string
  notifications: {
    uploadComplete: boolean
    aiInsights: boolean
    weeklyReport: boolean
  }
  apiKey: string
  autoGenerateInsights: boolean
}

export default function Settings() {
  const [settings, setSettings] = usePlatformKV<UserSettings>('hootner-settings', {
    email: '',
    notifications: {
      uploadComplete: true,
      aiInsights: true,
      weeklyReport: false
    },
    apiKey: '',
    autoGenerateInsights: true
  })

  const safeSettings = settings || {
    email: '',
    notifications: {
      uploadComplete: true,
      aiInsights: true,
      weeklyReport: false
    },
    apiKey: '',
    autoGenerateInsights: true
  }

  const [email, setEmail] = useState(safeSettings.email)
  const [isGeneratingApiKey, setIsGeneratingApiKey] = useState(false)

  const handleSaveProfile = () => {
    setSettings((current) => ({ ...current!, email }))
    toast.success('Profile updated successfully')
  }

  const handleNotificationToggle = (key: keyof UserSettings['notifications']) => {
    setSettings((current) => ({
      ...current!,
      notifications: {
        ...current!.notifications,
        [key]: !current!.notifications[key]
      }
    }))
  }

  const handleGenerateApiKey = async () => {
    setIsGeneratingApiKey(true)
    
    setTimeout(() => {
      const newKey = `hoot_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      setSettings((current) => ({ ...current!, apiKey: newKey }))
      toast.success('API key generated successfully')
      setIsGeneratingApiKey(false)
    }, 1000)
  }

  const handleCopyApiKey = () => {
    if (safeSettings.apiKey) {
      navigator.clipboard.writeText(safeSettings.apiKey)
      toast.success('API key copied to clipboard')
    }
  }

  const handleToggleAutoInsights = () => {
    setSettings((current) => ({
      ...current!,
      autoGenerateInsights: !current!.autoGenerateInsights
    }))
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account preferences and integrations
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-background"
                />
              </div>
              <Button onClick={handleSaveProfile} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <CheckCircle weight="fill" className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>AI Preferences</CardTitle>
              <CardDescription>Configure AI-powered features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-generate AI Insights</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically analyze videos on upload
                  </p>
                </div>
                <Switch
                  checked={safeSettings.autoGenerateInsights}
                  onCheckedChange={handleToggleAutoInsights}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what updates you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Upload Complete</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when video uploads finish processing
                  </p>
                </div>
                <Switch
                  checked={safeSettings.notifications.uploadComplete}
                  onCheckedChange={() => handleNotificationToggle('uploadComplete')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>AI Insights Ready</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when AI analysis is complete
                  </p>
                </div>
                <Switch
                  checked={safeSettings.notifications.aiInsights}
                  onCheckedChange={() => handleNotificationToggle('aiInsights')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Report</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly analytics summary
                  </p>
                </div>
                <Switch
                  checked={safeSettings.notifications.weeklyReport}
                  onCheckedChange={() => handleNotificationToggle('weeklyReport')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>Integrate HOOTNER with your applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                {safeSettings.apiKey ? (
                  <div className="flex gap-2">
                    <Input
                      value={safeSettings.apiKey}
                      readOnly
                      className="font-mono text-sm bg-background"
                    />
                    <Button variant="outline" onClick={handleCopyApiKey}>
                      Copy
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No API key generated yet</p>
                )}
              </div>

              <Button
                onClick={handleGenerateApiKey}
                disabled={isGeneratingApiKey}
                variant={safeSettings.apiKey ? 'outline' : 'default'}
                className={!safeSettings.apiKey ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}
              >
                {isGeneratingApiKey ? 'Generating...' : safeSettings.apiKey ? 'Regenerate Key' : 'Generate API Key'}
              </Button>

              <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-semibold mb-2 text-sm">API Documentation</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Use your API key to programmatically upload videos, retrieve analytics, and access AI insights.
                </p>
                <code className="text-xs font-mono bg-background px-2 py-1 rounded">
                  curl -H "Authorization: Bearer YOUR_API_KEY" https://api.hootner.ai/v1/videos
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage authentication and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline">Enable 2FA</Button>
              </div>

              <Separator />

              <div>
                <Label className="mb-3 block">USB Passkey (FIDO2)</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Use a hardware security key for passwordless authentication
                </p>
                <Button variant="outline">Configure Passkey</Button>
              </div>

              <Separator />

              <div>
                <Label className="mb-3 block">Active Sessions</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage devices where you're currently signed in
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">Current Session</p>
                      <p className="text-xs text-muted-foreground">Active now</p>
                    </div>
                    <Button variant="ghost" size="sm" disabled>
                      Current
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
