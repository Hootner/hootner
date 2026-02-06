import { useState } from 'react'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)

  const navItems = [
    { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
    { icon: '📹', label: 'Videos', href: '/my-videos' },
    { icon: '📊', label: 'Analytics', href: '/analytics' },
    { icon: '🤖', label: 'AI Studio', href: '/ai-video' },
    { icon: '⚙️', label: 'Settings', href: '/settings' },
  ]

  return (
    <aside className={`bg-gradient-to-b from-gray-900 to-black text-white h-screen fixed left-0 top-0 transition-all duration-300 ${isOpen ? 'w-64 sm:w-72 lg:w-80' : 'w-16'} z-50`}>
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        {isOpen && <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">🦉 HOOTNER</span>}
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white">
          {isOpen ? '◀' : '▶'}
        </button>
      </div>
      
      <nav className="mt-8">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-4 px-4 py-3 hover:bg-purple-900/30 transition"
          >
            <span className="text-2xl">{item.icon}</span>
            {isOpen && <span>{item.label}</span>}
          </a>
        ))}
      </nav>
    </aside>
  )
}
