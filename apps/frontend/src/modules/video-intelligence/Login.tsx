import { useState } from 'react'
import { SignIn, Sparkle, Eye, EyeSlash } from '@phosphor-icons/react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { toast } from 'sonner'

interface LoginProps {
  onLogin: (username: string, role: 'admin' | 'user') => void
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        toast.success('Welcome back, Admin!')
        onLogin(username, 'admin')
      } else if (username && password) {
        toast.success(`Welcome, ${username}!`)
        onLogin(username, 'user')
      } else {
        toast.error('Please enter both username and password')
      }
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      
      <Card className="w-full max-w-md relative backdrop-blur-sm bg-card/95 border-border/50 shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkle weight="fill" className="w-9 h-9 text-accent-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight">HOOTNER</CardTitle>
            <CardDescription className="text-sm uppercase tracking-wider mt-2">
              AI Video Intelligence Platform
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlash className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <SignIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground text-center mb-2 font-medium">
              Demo Credentials
            </p>
            <div className="space-y-1 text-xs font-mono">
              <p className="text-center">
                <span className="text-muted-foreground">Admin:</span>{' '}
                <span className="text-foreground">admin / admin</span>
              </p>
              <p className="text-center text-muted-foreground">
                Or use any username/password for user access
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
