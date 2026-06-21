import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Slider } from '@/shared/ui/slider'
import { Badge } from '@/shared/ui/badge'
import { Separator } from '@/shared/ui/separator'
import { Button } from '@/shared/ui/button'
import { Drop, Wind, Waves, ArrowCounterClockwise } from '@phosphor-icons/react'

interface FluidDynamicsControlsProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  viscosity: number
  onViscosityChange: (value: number) => void
  pressure: number
  onPressureChange: (value: number) => void
  flowRate: number
  onFlowRateChange: (value: number) => void
  turbulence: number
  onTurbulenceChange: (value: number) => void
  vorticity: number
  onVorticityChange: (value: number) => void
  particleInteraction: boolean
  onParticleInteractionChange: (enabled: boolean) => void
  onReset: () => void
}

export function FluidDynamicsControls({
  enabled,
  onEnabledChange,
  viscosity,
  onViscosityChange,
  pressure,
  onPressureChange,
  flowRate,
  onFlowRateChange,
  turbulence,
  onTurbulenceChange,
  vorticity,
  onVorticityChange,
  particleInteraction,
  onParticleInteractionChange,
  onReset
}: FluidDynamicsControlsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold mb-3 text-primary flex items-center gap-2">
          <Drop className="animate-pulse" />
          FLUID DYNAMICS SYSTEM
        </h2>

        <div className="space-y-4">
          <div className="p-4 bg-accent/10 rounded-lg border-2 border-accent/50 holographic-glow">
            <p className="text-sm font-semibold text-accent mb-2">💧 Advanced Physics Simulation</p>
            <p className="text-xs text-muted-foreground">
              Real-time fluid dynamics simulation with particle interaction, vorticity, and pressure fields
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="fluid-enabled" className="text-sm">
              Enable Fluid Dynamics
            </Label>
            <Switch
              id="fluid-enabled"
              checked={enabled}
              onCheckedChange={onEnabledChange}
            />
          </div>

          {enabled && (
            <div className="space-y-4">
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                <p className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  <Waves className="animate-pulse" />
                  Fluid Simulation Active
                </p>
                <p className="text-xs text-muted-foreground">
                  Particles now behave like fluid with realistic flow patterns and interactions
                </p>
              </div>

              <Separator className="bg-primary/30" />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="viscosity" className="text-sm">
                    Viscosity
                  </Label>
                  <Badge variant="secondary" className="font-mono">
                    {viscosity.toFixed(2)}
                  </Badge>
                </div>
                <Slider
                  id="viscosity"
                  value={[viscosity]}
                  onValueChange={(values) => onViscosityChange(values[0])}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Fluid thickness - higher values create slower, thicker flow
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pressure" className="text-sm">
                    Pressure
                  </Label>
                  <Badge variant="secondary" className="font-mono">
                    {pressure.toFixed(2)}
                  </Badge>
                </div>
                <Slider
                  id="pressure"
                  value={[pressure]}
                  onValueChange={(values) => onPressureChange(values[0])}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Internal pressure affecting particle spacing and density
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="flow-rate" className="text-sm">
                    Flow Rate
                  </Label>
                  <Badge variant="secondary" className="font-mono">
                    {flowRate.toFixed(1)}
                  </Badge>
                </div>
                <Slider
                  id="flow-rate"
                  value={[flowRate]}
                  onValueChange={(values) => onFlowRateChange(values[0])}
                  min={0}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Speed of fluid movement through the system
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fluid-turbulence" className="text-sm">
                    Turbulence
                  </Label>
                  <Badge variant="secondary" className="font-mono">
                    {turbulence.toFixed(2)}
                  </Badge>
                </div>
                <Slider
                  id="fluid-turbulence"
                  value={[turbulence]}
                  onValueChange={(values) => onTurbulenceChange(values[0])}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Random chaotic motion creating swirls and eddies
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="vorticity" className="text-sm">
                    Vorticity
                  </Label>
                  <Badge variant="secondary" className="font-mono">
                    {vorticity.toFixed(2)}
                  </Badge>
                </div>
                <Slider
                  id="vorticity"
                  value={[vorticity]}
                  onValueChange={(values) => onVorticityChange(values[0])}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Rotational flow strength - creates vortex patterns
                </p>
              </div>

              <Separator className="bg-primary/30" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="particle-interaction" className="text-sm">
                    Particle Interaction
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Particles affect fluid flow
                  </p>
                </div>
                <Switch
                  id="particle-interaction"
                  checked={particleInteraction}
                  onCheckedChange={onParticleInteractionChange}
                />
              </div>

              <Button
                variant="outline"
                onClick={onReset}
                className="w-full border-primary/50 hover:border-primary hover:bg-primary/10"
              >
                <ArrowCounterClockwise className="mr-2" />
                Reset Fluid Dynamics
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-secondary/20 rounded-lg border border-primary/20">
        <h3 className="text-sm font-bold mb-2">About Fluid Dynamics</h3>
        <p className="text-xs text-muted-foreground mb-2">
          Advanced computational fluid dynamics (CFD) simulation that models particle systems as fluids with realistic physics properties.
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li><strong>Viscosity:</strong> Controls fluid resistance to flow</li>
          <li><strong>Pressure:</strong> Internal force affecting particle density</li>
          <li><strong>Turbulence:</strong> Chaotic motion patterns</li>
          <li><strong>Vorticity:</strong> Rotational flow creating vortices</li>
          <li><strong>Particle Interaction:</strong> Two-way coupling between particles and fluid</li>
        </ul>
      </div>
    </div>
  )
}
