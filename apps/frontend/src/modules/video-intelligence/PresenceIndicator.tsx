import { useState, useEffect } from 'react'
import { Users } from '@phosphor-icons/react'
import { Badge } from '@/shared/ui/badge'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'

interface User {
  id: string
  name: string
  avatar: string
  status: 'active' | 'idle' | 'away'
}

export default function PresenceIndicator() {
  const [activeUsers, setActiveUsers] = useState<User[]>([])
  const [userCount, setUserCount] = useState(1)

  useEffect(() => {
    const simulateUsers = () => {
      const mockUsers: User[] = [
        { id: '1', name: 'You', avatar: 'Y', status: 'active' },
        { id: '2', name: 'Sarah Chen', avatar: 'SC', status: 'active' },
        { id: '3', name: 'Mike Rodriguez', avatar: 'MR', status: 'idle' },
        { id: '4', name: 'Emma Watson', avatar: 'EW', status: 'active' },
        { id: '5', name: 'David Kim', avatar: 'DK', status: 'away' }
      ]

      const randomCount = Math.floor(Math.random() * 3) + 2
      const selectedUsers = mockUsers.slice(0, randomCount)
      setActiveUsers(selectedUsers)
      setUserCount(randomCount + Math.floor(Math.random() * 5))
    }

    simulateUsers()
    const interval = setInterval(simulateUsers, 10000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'idle':
        return 'bg-yellow-500'
      case 'away':
        return 'bg-gray-500'
    }
  }

  const activeCount = activeUsers.filter(u => u.status === 'active').length

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card/50 border border-border">
        <div className="flex items-center -space-x-2">
          <AnimatePresence>
            {activeUsers.slice(0, 4).map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Avatar className="w-8 h-8 border-2 border-background">
                        <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-accent to-primary text-accent-foreground">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${getStatusColor(user.status)}`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {user.name} • {user.status}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <Users weight="fill" className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium font-mono">{activeCount}</span>
            <span className="text-xs text-muted-foreground">active</span>
          </div>
          <Badge variant="secondary" className="text-xs font-mono">
            {userCount} online
          </Badge>
        </div>

        <motion.div
          className="w-2 h-2 rounded-full bg-green-500"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </TooltipProvider>
  )
}
