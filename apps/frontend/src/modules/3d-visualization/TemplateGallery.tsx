import { useState } from 'react'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { Sparkle, Star, Lightning, Circle, Cube, Triangle } from '@phosphor-icons/react'
import { toast } from 'sonner'

export interface HologramTemplate {
  id: string
  name: string
  description: string
  category: 'featured' | 'abstract' | 'geometric' | 'artistic' | 'scientific'
  thumbnail: string
  config: {
    object: string
    speed: number
    scale: number
    wireframe: boolean
    glow: number
    colors: string
    animation: string
    materialPreset?: string
    particleEffect?: string
    environmentPreset?: string
    bloomIntensity?: number
    ambientLight?: number
    pointLight?: number
  }
  premium?: boolean
  rating?: number
  downloads?: number
}

const HOLOGRAM_TEMPLATES: HologramTemplate[] = [
  {
    id: 'cosmic-crystal',
    name: 'Cosmic Crystal',
    description: 'Ethereal crystalline structure with aurora effects',
    category: 'featured',
    thumbnail: '🔮',
    config: {
      object: 'dodecahedron',
      speed: 0.8,
      scale: 1.3,
      wireframe: true,
      glow: 0.9,
      colors: 'deep-purple',
      animation: 'wobble',
      materialPreset: 'crystal',
      particleEffect: 'orbit',
      environmentPreset: 'aurora',
      bloomIntensity: 2,
      ambientLight: 0.3,
      pointLight: 4
    },
    rating: 4.9,
    downloads: 1247
  },
  {
    id: 'neon-runner',
    name: 'Neon Runner',
    description: 'Fast-paced cyberpunk aesthetic with intense glow',
    category: 'featured',
    thumbnail: '⚡',
    config: {
      object: 'torusKnot',
      speed: 2.5,
      scale: 1.1,
      wireframe: false,
      glow: 1,
      colors: 'hot-pink',
      animation: 'tumble',
      materialPreset: 'neon',
      particleEffect: 'trail',
      environmentPreset: 'neon-city',
      bloomIntensity: 2.5,
      ambientLight: 0.4,
      pointLight: 3
    },
    rating: 4.8,
    downloads: 2103
  },
  {
    id: 'zen-meditation',
    name: 'Zen Meditation',
    description: 'Calming sphere perfect for relaxation and focus',
    category: 'featured',
    thumbnail: '🌊',
    config: {
      object: 'sphere',
      speed: 0.3,
      scale: 1.2,
      wireframe: false,
      glow: 0.4,
      colors: 'ice-blue',
      animation: 'slow-spin',
      materialPreset: 'glass',
      particleEffect: 'static',
      environmentPreset: 'default',
      bloomIntensity: 0.8,
      ambientLight: 0.5,
      pointLight: 2
    },
    rating: 4.7,
    downloads: 1856
  },
  {
    id: 'geometric-dream',
    name: 'Geometric Dream',
    description: 'Abstract platonic solid with color shimmer',
    category: 'geometric',
    thumbnail: '📐',
    config: {
      object: 'icosahedron',
      speed: 1.2,
      scale: 1.4,
      wireframe: true,
      glow: 0.7,
      colors: 'electric-orange',
      animation: 'pulse',
      materialPreset: 'hologram',
      particleEffect: 'swarm',
      environmentPreset: 'default',
      bloomIntensity: 1.5,
      ambientLight: 0.3,
      pointLight: 2.5
    },
    rating: 4.6,
    downloads: 934
  },
  {
    id: 'energy-core',
    name: 'Energy Core',
    description: 'Pulsating energy field with dynamic particles',
    category: 'abstract',
    thumbnail: '💥',
    config: {
      object: 'octahedron',
      speed: 1.8,
      scale: 1.0,
      wireframe: false,
      glow: 1,
      colors: 'neon-green',
      animation: 'pulse',
      materialPreset: 'energy',
      particleEffect: 'burst',
      environmentPreset: 'space-station',
      bloomIntensity: 2,
      ambientLight: 0.2,
      pointLight: 3.5
    },
    rating: 4.8,
    downloads: 1523
  },
  {
    id: 'minimal-cube',
    name: 'Minimal Cube',
    description: 'Clean and simple rotating cube',
    category: 'geometric',
    thumbnail: '⬛',
    config: {
      object: 'cube',
      speed: 1.0,
      scale: 1.0,
      wireframe: true,
      glow: 0.5,
      colors: 'cyan-magenta',
      animation: 'standard',
      materialPreset: 'hologram',
      particleEffect: 'static',
      environmentPreset: 'default',
      bloomIntensity: 1,
      ambientLight: 0.3,
      pointLight: 2
    },
    rating: 4.5,
    downloads: 2847
  },
  {
    id: 'sci-fi-torus',
    name: 'Sci-Fi Torus',
    description: 'Futuristic ring structure with metallic sheen',
    category: 'scientific',
    thumbnail: '💍',
    config: {
      object: 'torus',
      speed: 0.9,
      scale: 1.3,
      wireframe: false,
      glow: 0.6,
      colors: 'ice-blue',
      animation: 'standard',
      materialPreset: 'metal',
      particleEffect: 'orbit',
      environmentPreset: 'space-station',
      bloomIntensity: 1.2,
      ambientLight: 0.5,
      pointLight: 2.5
    },
    rating: 4.7,
    downloads: 1456
  },
  {
    id: 'plasma-sphere',
    name: 'Plasma Sphere',
    description: 'Glowing energy ball with vertex trails',
    category: 'abstract',
    thumbnail: '🌟',
    config: {
      object: 'sphere',
      speed: 1.5,
      scale: 1.2,
      wireframe: false,
      glow: 0.95,
      colors: 'electric-orange',
      animation: 'pulse',
      materialPreset: 'energy',
      particleEffect: 'vertex-trails',
      environmentPreset: 'default',
      bloomIntensity: 2.2,
      ambientLight: 0.2,
      pointLight: 4
    },
    rating: 4.9,
    downloads: 1789
  },
  {
    id: 'wireframe-network',
    name: 'Wireframe Network',
    description: 'Interconnected node structure visualization',
    category: 'scientific',
    thumbnail: '🕸️',
    config: {
      object: 'dodecahedron',
      speed: 0.6,
      scale: 1.5,
      wireframe: true,
      glow: 0.4,
      colors: 'cyan-magenta',
      animation: 'standard',
      materialPreset: 'hologram',
      particleEffect: 'static',
      environmentPreset: 'space-station',
      bloomIntensity: 0.8,
      ambientLight: 0.4,
      pointLight: 2
    },
    rating: 4.6,
    downloads: 1092
  },
  {
    id: 'rainbow-prism',
    name: 'Rainbow Prism',
    description: 'Color-shifting crystalline pyramid',
    category: 'artistic',
    thumbnail: '🌈',
    config: {
      object: 'tetrahedron',
      speed: 1.0,
      scale: 1.3,
      wireframe: false,
      glow: 0.8,
      colors: 'deep-purple',
      animation: 'wobble',
      materialPreset: 'crystal',
      particleEffect: 'swarm',
      environmentPreset: 'crystal-cave',
      bloomIntensity: 1.8,
      ambientLight: 0.3,
      pointLight: 3
    },
    rating: 4.8,
    downloads: 1634
  }
]

interface TemplateGalleryProps {
  onApplyTemplate: (config: HologramTemplate['config']) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateGallery({ onApplyTemplate, open, onOpenChange }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: 'all', name: 'All Templates', icon: Sparkle },
    { id: 'featured', name: 'Featured', icon: Star },
    { id: 'geometric', name: 'Geometric', icon: Cube },
    { id: 'abstract', name: 'Abstract', icon: Circle },
    { id: 'artistic', name: 'Artistic', icon: Triangle },
    { id: 'scientific', name: 'Scientific', icon: Lightning }
  ]

  const filteredTemplates = HOLOGRAM_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleApplyTemplate = (template: HologramTemplate) => {
    onApplyTemplate(template.config)
    toast.success(`Applied template: ${template.name}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-primary/50 max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary flex items-center gap-2">
            <Sparkle size={28} className="animate-pulse" />
            Hologram Templates Gallery
          </DialogTitle>
          <DialogDescription>
            Choose from professionally crafted hologram templates. One-click apply to instantly transform your scene.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(cat => {
              const Icon = cat.icon
              return (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={selectedCategory === cat.id 
                    ? 'bg-primary text-primary-foreground holographic-glow' 
                    : 'border-primary/50 hover:border-primary hover:bg-primary/10'
                  }
                >
                  <Icon size={16} className="mr-1" />
                  {cat.name}
                </Button>
              )
            })}
          </div>

          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-secondary/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <Card
                  key={template.id}
                  className="glass-panel border-primary/30 hover:border-accent/50 transition-all p-4 space-y-3 hover:shadow-[0_0_20px_rgba(var(--accent),0.3)] cursor-pointer group"
                  onClick={() => handleApplyTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">{template.thumbnail}</div>
                    {template.premium && (
                      <Badge className="bg-accent text-accent-foreground">Premium</Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-primary mb-1 group-hover:text-accent transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {template.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-accent" weight="fill" />
                      <span>{template.rating}</span>
                    </div>
                    <span>{template.downloads?.toLocaleString()} downloads</span>
                  </div>

                  <div className="pt-2 border-t border-primary/20">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Object:</span>
                        <span className="font-mono">{template.config.object}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Speed:</span>
                        <span className="font-mono">{template.config.speed}x</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-accent/50 hover:border-accent hover:bg-accent/20 group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleApplyTemplate(template)
                    }}
                  >
                    Apply Template
                  </Button>
                </Card>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkle size={48} className="text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">No templates found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
