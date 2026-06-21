import { Label } from '@/shared/ui/label'
import { Slider } from '@/shared/ui/slider'
import { Switch } from '@/shared/ui/switch'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { Atom, Wind, Sparkle, ArrowsOut } from '@phosphor-icons/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

interface ParticlePhysicsControlsProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  gravity: number
  onGravityChange: (value: number) => void
  collision: boolean
  onCollisionChange: (enabled: boolean) => void
  particleCount: number
  onParticleCountChange: (count: number) => void
  particleSize: number
  onParticleSizeChange: (size: number) => void
  particleLifetime: number
  onParticleLifetimeChange: (lifetime: number) => void
  emissionRate: number
  onEmissionRateChange: (rate: number) => void
  forceField: string
  onForceFieldChange: (field: string) => void
  turbulence: number
  onTurbulenceChange: (value: number) => void
  onReset: () => void
}

const FORCE_FIELDS = [
  { value: 'none', label: 'None' },
  { value: 'radial', label: 'Radial Push' },
  { value: 'vortex', label: 'Vortex Spin' },
  { value: 'attractor', label: 'Center Attractor' },
  { value: 'repeller', label: 'Center Repeller' },
  { value: 'directional', label: 'Directional Wind' },
]

export function ParticlePhysicsControls({
  enabled,
  onEnabledChange,
  gravity,
  onGravityChange,
  collision,
  onCollisionChange,
  particleCount,
  onParticleCountChange,
  particleSize,
  onParticleSizeChange,
  particleLifetime,
  onParticleLifetimeChange,
  emissionRate,
  onEmissionRateChange,
  forceField,
  onForceFieldChange,
  turbulence,
  onTurbulenceChange,
  onReset,
}: ParticlePhysicsControlsProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-accent/10 rounded-lg border-2 border-accent/50 holographic-glow">
        <p className="text-sm font-semibold text-accent mb-2 flex items-center gap-2">
          <Atom className="animate-pulse" />
          Advanced Particle Physics
        </p>
        <p className="text-xs text-muted-foreground">
          Realistic particle simulation with gravity, collisions, and force fields
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="particle-physics-enable" className="text-sm">
          Enable Particle Physics
        </Label>
        <Switch
          id="particle-physics-enable"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>

      {enabled && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
            <p className="text-sm text-primary font-semibold mb-1 flex items-center gap-2">
              <Sparkle className="animate-pulse" />
              Physics Simulation Active
            </p>
            <p className="text-xs text-muted-foreground">
              Particles respond to gravity, collisions, and force fields
            </p>
          </div>

          <Separator className="bg-primary/30" />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="particle-gravity" className="text-sm">
                Gravity Strength
              </Label>
              <Badge variant="secondary" className="font-mono">
                {gravity.toFixed(2)}
              </Badge>
            </div>
            <Slider
              id="particle-gravity"
              value={[gravity]}
              onValueChange={(values) => onGravityChange(values[0])}
              min={-2}
              max={2}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Negative values create upward force
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="particle-count" className="text-sm">
                Particle Count
              </Label>
              <Badge variant="secondary" className="font-mono">
                {particleCount}
              </Badge>
            </div>
            <Slider
              id="particle-count"
              value={[particleCount]}
              onValueChange={(values) => onParticleCountChange(values[0])}
              min={50}
              max={2000}
              step={50}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="particle-size" className="text-sm">
                Particle Size
              </Label>
              <Badge variant="secondary" className="font-mono">
                {particleSize.toFixed(2)}
              </Badge>
            </div>
            <Slider
              id="particle-size"
              value={[particleSize]}
              onValueChange={(values) => onParticleSizeChange(values[0])}
              min={0.1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="emission-rate" className="text-sm">
                Emission Rate
              </Label>
              <Badge variant="secondary" className="font-mono">
                {emissionRate}/s
              </Badge>
            </div>
            <Slider
              id="emission-rate"
              value={[emissionRate]}
              onValueChange={(values) => onEmissionRateChange(values[0])}
              min={10}
              max={200}
              step={10}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="particle-lifetime" className="text-sm">
                Particle Lifetime
              </Label>
              <Badge variant="secondary" className="font-mono">
                {particleLifetime.toFixed(1)}s
              </Badge>
            </div>
            <Slider
              id="particle-lifetime"
              value={[particleLifetime]}
              onValueChange={(values) => onParticleLifetimeChange(values[0])}
              min={1}
              max={10}
              step={0.5}
              className="w-full"
            />
          </div>

          <Separator className="bg-primary/30" />

          <div className="flex items-center justify-between">
            <Label htmlFor="particle-collision" className="text-sm">
              Enable Collisions
            </Label>
            <Switch
              id="particle-collision"
              checked={collision}
              onCheckedChange={onCollisionChange}
            />
          </div>

          <Separator className="bg-primary/30" />

          <div className="space-y-2">
            <Label htmlFor="force-field" className="text-sm">
              Force Field
            </Label>
            <Select value={forceField} onValueChange={onForceFieldChange}>
              <SelectTrigger id="force-field">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORCE_FIELDS.map((field) => (
                  <SelectItem key={field.value} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {forceField !== 'none' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="turbulence" className="text-sm">
                  Turbulence
                </Label>
                <Badge variant="secondary" className="font-mono">
                  {turbulence.toFixed(2)}
                </Badge>
              </div>
              <Slider
                id="turbulence"
                value={[turbulence]}
                onValueChange={(values) => onTurbulenceChange(values[0])}
                min={0}
                max={2}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Adds randomness to force field behavior
              </p>
            </div>
          )}

          <Button
            variant="outline"
            onClick={onReset}
            className="w-full border-primary/50 hover:border-primary hover:bg-primary/10"
          >
            <ArrowsOut className="mr-2" />
            Reset Physics
          </Button>
        </div>
      )}

      <div className="p-4 bg-secondary/20 rounded-lg border border-primary/20">
        <h3 className="text-sm font-bold mb-2">About Particle Physics</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li><strong>Gravity:</strong> Particles accelerate based on gravity force</li>
          <li><strong>Collisions:</strong> Particles bounce off boundaries and hologram</li>
          <li><strong>Force Fields:</strong> Apply directional or radial forces</li>
          <li><strong>Turbulence:</strong> Adds chaotic motion to particles</li>
        </ul>
      </div>
    </div>
  )
}
