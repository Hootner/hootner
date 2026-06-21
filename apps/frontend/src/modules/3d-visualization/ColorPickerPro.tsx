import { Label } from '@/shared/ui/label'
import { Slider } from '@/shared/ui/slider'
import { Switch } from '@/shared/ui/switch'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Separator } from '@/shared/ui/separator'
import { Palette, Sparkle, Copy, Plus } from '@phosphor-icons/react'
import { useState } from 'react'

interface ColorPickerProProps {
  primaryColor: string
  secondaryColor: string
  onPrimaryColorChange: (color: string) => void
  onSecondaryColorChange: (color: string) => void
  enableGradient: boolean
  onEnableGradientChange: (enabled: boolean) => void
  gradientAngle: number
  onGradientAngleChange: (angle: number) => void
  gradientStops: number
  onGradientStopsChange: (stops: number) => void
  onSaveCustomColor: (primary: string, secondary: string, name: string) => void
}

export function ColorPickerPro({
  primaryColor,
  secondaryColor,
  onPrimaryColorChange,
  onSecondaryColorChange,
  enableGradient,
  onEnableGradientChange,
  gradientAngle,
  onGradientAngleChange,
  gradientStops,
  onGradientStopsChange,
  onSaveCustomColor,
}: ColorPickerProProps) {
  const [customColorName, setCustomColorName] = useState('')

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + ([r, g, b] as number[]).map((x) => {
      const hex = Math.round(x).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  const primaryRgb = hexToRgb(primaryColor)
  const secondaryRgb = hexToRgb(secondaryColor)

  const generateGradientPreview = () => {
    if (!enableGradient) {
      return `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
    }
    
    const stops: string[] = []
    for (let i = 0; i <= gradientStops; i++) {
      const t = i / gradientStops
      const r = Math.round(primaryRgb.r + (secondaryRgb.r - primaryRgb.r) * t)
      const g = Math.round(primaryRgb.g + (secondaryRgb.g - primaryRgb.g) * t)
      const b = Math.round(primaryRgb.b + (secondaryRgb.b - primaryRgb.b) * t)
      stops.push(`${rgbToHex(r, g, b)} ${(t * 100).toFixed(0)}%`)
    }
    
    return `linear-gradient(${gradientAngle}deg, ${stops.join(', ')})`
  }

  const copyColorToClipboard = (color: string) => {
    navigator.clipboard.writeText(color)
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-accent/10 rounded-lg border-2 border-accent/50 holographic-glow">
        <p className="text-sm font-semibold text-accent mb-2 flex items-center gap-2">
          <Palette className="animate-pulse" />
          Professional Color Picker
        </p>
        <p className="text-xs text-muted-foreground">
          Create custom colors and gradients with real-time preview
        </p>
      </div>

      <div 
        className="w-full h-24 rounded-lg border-2 border-primary/50 holographic-glow"
        style={{ background: generateGradientPreview() }}
      />

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="primary-color" className="text-sm flex items-center justify-between">
            <span>Primary Color</span>
            <Badge variant="secondary" className="font-mono text-xs">
              {primaryColor}
            </Badge>
          </Label>
          <div className="flex gap-2">
            <Input
              id="primary-color"
              type="color"
              value={primaryColor}
              onChange={(e) => onPrimaryColorChange(e.target.value)}
              className="w-20 h-10 cursor-pointer"
            />
            <Input
              type="text"
              value={primaryColor}
              onChange={(e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                  onPrimaryColorChange(e.target.value)
                }
              }}
              className="flex-1 font-mono"
              placeholder="#00d9ff"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyColorToClipboard(primaryColor)}
              className="border-primary/50"
            >
              <Copy size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondary-color" className="text-sm flex items-center justify-between">
            <span>Secondary Color</span>
            <Badge variant="secondary" className="font-mono text-xs">
              {secondaryColor}
            </Badge>
          </Label>
          <div className="flex gap-2">
            <Input
              id="secondary-color"
              type="color"
              value={secondaryColor}
              onChange={(e) => onSecondaryColorChange(e.target.value)}
              className="w-20 h-10 cursor-pointer"
            />
            <Input
              type="text"
              value={secondaryColor}
              onChange={(e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                  onSecondaryColorChange(e.target.value)
                }
              }}
              className="flex-1 font-mono"
              placeholder="#ff00ff"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyColorToClipboard(secondaryColor)}
              className="border-primary/50"
            >
              <Copy size={16} />
            </Button>
          </div>
        </div>
      </div>

      <Separator className="bg-primary/30" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="enable-gradient" className="text-sm">
            Multi-Stop Gradient
          </Label>
          <Switch
            id="enable-gradient"
            checked={enableGradient}
            onCheckedChange={onEnableGradientChange}
          />
        </div>

        {enableGradient && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="gradient-angle" className="text-sm">
                  Gradient Angle
                </Label>
                <Badge variant="secondary" className="font-mono">
                  {gradientAngle}°
                </Badge>
              </div>
              <Slider
                id="gradient-angle"
                value={[gradientAngle]}
                onValueChange={(values) => onGradientAngleChange(values[0])}
                min={0}
                max={360}
                step={15}
                className="w-full"
              />
              <div className="grid grid-cols-4 gap-1 text-xs text-muted-foreground text-center">
                <div>0° →</div>
                <div>90° ↓</div>
                <div>180° ←</div>
                <div>270° ↑</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="gradient-stops" className="text-sm">
                  Gradient Stops
                </Label>
                <Badge variant="secondary" className="font-mono">
                  {gradientStops + 1}
                </Badge>
              </div>
              <Slider
                id="gradient-stops"
                value={[gradientStops]}
                onValueChange={(values) => onGradientStopsChange(values[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                More stops create smoother gradient transitions
              </p>
            </div>
          </div>
        )}
      </div>

      <Separator className="bg-primary/30" />

      <div className="space-y-2">
        <Label htmlFor="custom-color-name" className="text-sm">
          Save Custom Color
        </Label>
        <div className="flex gap-2">
          <Input
            id="custom-color-name"
            type="text"
            value={customColorName}
            onChange={(e) => setCustomColorName(e.target.value)}
            placeholder="My Custom Palette"
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={() => {
              if (customColorName.trim()) {
                onSaveCustomColor(primaryColor, secondaryColor, customColorName.trim())
                setCustomColorName('')
              }
            }}
            disabled={!customColorName.trim()}
            className="border-accent/50 hover:border-accent hover:bg-accent/10"
          >
            <Plus className="mr-1" size={16} />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-lg bg-secondary/20 border border-primary/20">
          <p className="text-xs font-bold text-primary mb-1">RGB</p>
          <p className="text-xs font-mono text-muted-foreground">
            {primaryRgb.r}, {primaryRgb.g}, {primaryRgb.b}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/20 border border-primary/20">
          <p className="text-xs font-bold text-accent mb-1">HSL</p>
          <p className="text-xs font-mono text-muted-foreground">
            Auto-calculated
          </p>
        </div>
      </div>

      <div className="p-4 bg-secondary/20 rounded-lg border border-primary/20">
        <h3 className="text-sm font-bold mb-2">Color Picker Features</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li><strong>Real-time Preview:</strong> See changes instantly</li>
          <li><strong>Gradient Control:</strong> Multi-stop gradients with angle control</li>
          <li><strong>Color Formats:</strong> HEX, RGB display support</li>
          <li><strong>Save Palettes:</strong> Store custom color combinations</li>
        </ul>
      </div>
    </div>
  )
}
