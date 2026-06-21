import { useState } from 'react'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'
import { Users, UserPlus, Crown, Shield, Trash, MagnifyingGlass, DotsThree } from '@phosphor-icons/react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { toast } from 'sonner'

interface TeamMember {
  id: string
  username: string
  role: 'admin' | 'user'
  email: string
  joinedDate: string
  lastActive: string
  videosUploaded: number
}

export default function Team() {
  const [teamMembers, setTeamMembers] = usePlatformKV<TeamMember[]>('hootner-team', [
    {
      id: '1',
      username: 'admin',
      role: 'admin',
      email: 'admin@hootner.ai',
      joinedDate: new Date('2024-01-01').toISOString(),
      lastActive: new Date().toISOString(),
      videosUploaded: 24,
    },
    {
      id: '2',
      username: 'sarah_johnson',
      role: 'user',
      email: 'sarah@hootner.ai',
      joinedDate: new Date('2024-02-15').toISOString(),
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      videosUploaded: 15,
    },
    {
      id: '3',
      username: 'mike_chen',
      role: 'user',
      email: 'mike@hootner.ai',
      joinedDate: new Date('2024-03-10').toISOString(),
      lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      videosUploaded: 8,
    },
  ])
  const [searchQuery, setSearchQuery] = useState('')

  const safeMembers = teamMembers || []

  const filteredMembers = safeMembers.filter(
    (member) =>
      member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRemoveMember = (id: string, username: string) => {
    if (username === 'admin') {
      toast.error('Cannot remove the admin user')
      return
    }
    setTeamMembers((current) => (current || []).filter((m) => m.id !== id))
    toast.success(`${username} removed from team`)
  }

  const handleToggleRole = (id: string, username: string, currentRole: string) => {
    if (username === 'admin') {
      toast.error('Cannot change admin role')
      return
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    setTeamMembers((current) =>
      (current || []).map((m) => (m.id === id ? { ...m, role: newRole as 'admin' | 'user' } : m))
    )
    toast.success(`${username} is now ${newRole === 'admin' ? 'an admin' : 'a user'}`)
  }

  const getInitials = (username: string) => {
    return username
      .split('_')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getActivityStatus = (lastActive: string) => {
    const diff = Date.now() - new Date(lastActive).getTime()
    const hours = diff / (1000 * 60 * 60)
    if (hours < 1) return { label: 'Active now', color: 'bg-green-400' }
    if (hours < 24) return { label: `${Math.floor(hours)}h ago`, color: 'bg-yellow-400' }
    return { label: `${Math.floor(hours / 24)}d ago`, color: 'bg-muted-foreground' }
  }

  const stats = {
    total: safeMembers.length,
    admins: safeMembers.filter((m) => m.role === 'admin').length,
    users: safeMembers.filter((m) => m.role === 'user').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Team Members</h2>
          <p className="text-muted-foreground">Manage users and permissions</p>
        </div>
        <Button
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20"
        >
          <UserPlus weight="bold" className="w-5 h-5 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Members</p>
            <Users weight="fill" className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.total}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Administrators</p>
            <Crown weight="fill" className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.admins}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Standard Users</p>
            <Shield weight="fill" className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold font-mono">{stats.users}</p>
        </div>
      </div>

      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-input"
        />
      </div>

      <div className="space-y-3">
        {filteredMembers.map((member) => {
          const activity = getActivityStatus(member.lastActive)
          return (
            <div
              key={member.id}
              className="bg-card border border-border rounded-lg p-5 flex items-center gap-4 hover:border-accent/50 transition-colors"
            >
              <Avatar className="w-12 h-12 border-2 border-accent/20">
                <AvatarFallback className="bg-gradient-to-br from-accent/30 to-primary/30 text-foreground font-semibold">
                  {getInitials(member.username)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold truncate">{member.username}</p>
                  {member.role === 'admin' && (
                    <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                      <Crown weight="fill" className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                    <div className={`w-2 h-2 rounded-full ${activity.color}`} />
                    <span className="text-xs text-muted-foreground">{activity.label}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Joined {new Date(member.joinedDate).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{member.videosUploaded} videos uploaded</span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <DotsThree weight="bold" className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleToggleRole(member.id, member.username, member.role)}>
                    <Crown className="w-4 h-4 mr-2" />
                    {member.role === 'admin' ? 'Make User' : 'Make Admin'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleRemoveMember(member.id, member.username)}
                    className="text-destructive"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Remove Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        })}
      </div>
    </div>
  )
}
