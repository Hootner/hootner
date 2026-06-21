import { Label } from '@/shared/ui/label'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Separator } from '@/shared/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { Slider } from '@/shared/ui/slider'
import { FileArrowDown, Camera, Package, Sparkle } from '@phosphor-icons/react'
import { useState } from 'react'

interface ModelExportControlsProps {
  onExport: (format: string, options: ExportOptions) => void
  isExporting: boolean
  exportProgress: number
}

export interface ExportOptions {
  format: 'obj' | 'gltf' | 'glb' | 'stl' | 'ply' | 'fbx'
  includeTextures: boolean
  includeAnimation: boolean
  scale: number
  quality: 'low' | 'medium' | 'high' | 'ultra'
  embedTextures: boolean
}

const EXPORT_FORMATS = [
  { 
    value: 'obj', 
    label: 'OBJ', 
    description: 'Wavefront OBJ - Universal format',
    extensions: '.obj + .mtl'
  },
  { 
    value: 'gltf', 
    label: 'glTF 2.0', 
    description: 'GL Transmission Format - Modern standard',
    extensions: '.gltf + .bin'
  },
  { 
    value: 'glb', 
    label: 'GLB', 
    description: 'Binary glTF - Single file',
    extensions: '.glb'
  },
  { 
    value: 'stl', 
    label: 'STL', 
    description: 'Stereolithography - 3D printing',
    extensions: '.stl'
  },
  { 
    value: 'ply', 
    label: 'PLY', 
    description: 'Polygon File Format - Point clouds',
    extensions: '.ply'
  },
  { 
    value: 'fbx', 
    label: 'FBX', 
    description: 'Autodesk Interchange - Professional',
    extensions: '.fbx'
  },
]

const QUALITY_PRESETS = [
  { value: 'low', label: 'Low', description: 'Fast export, smaller file' },
  { value: 'medium', label: 'Medium', description: 'Balanced quality' },
  { value: 'high', label: 'High', description: 'Detailed geometry' },
  { value: 'ultra', label: 'Ultra', description: 'Maximum quality' },
]

export function ModelExportControls({
  onExport,
  isExporting,
  exportProgress,
}: ModelExportControlsProps) {
  const [format, setFormat] = useState<ExportOptions['format']>('glb')
  const [includeTextures, setIncludeTextures] = useState(true)
  const [includeAnimation, setIncludeAnimation] = useState(false)
  const [scale, setScale] = useState(1)
  const [quality, setQuality] = useState<ExportOptions['quality']>('high')
  const [embedTextures, setEmbedTextures] = useState(true)

  const handleExport = () => {
    const options: ExportOptions = {
      format,
      includeTextures,
      includeAnimation,
      scale,
      quality,
      embedTextures,
    }
    onExport(format, options)
  }

  const selectedFormat = EXPORT_FORMATS.find((f) => f.value === format)
  const selectedQuality = QUALITY_PRESETS.find((q) => q.value === quality)

  const supportsTextures = ['obj', 'gltf', 'glb', 'fbx'].includes(format)
  const supportsAnimation = ['gltf', 'glb', 'fbx'].includes(format)
  const supportsEmbedding = ['glb', 'fbx'].includes(format)

  return (
    <div className="space-y-4">
      <div className="p-4 bg-accent/10 rounded-lg border-2 border-accent/50 holographic-glow">
        <p className="text-sm font-semibold text-accent mb-2 flex items-center gap-2">
          <Package className="animate-pulse" />
          3D Model Export
        </p>
        <p className="text-xs text-muted-foreground">
          Export hologram snapshots in multiple professional formats
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="export-format" className="text-sm">
          Export Format
        </Label>
        <Select value={format} onValueChange={(value) => setFormat(value as ExportOptions['format'])}>
          <SelectTrigger id="export-format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPORT_FORMATS.map((fmt) => (
              <SelectItem key={fmt.value} value={fmt.value}>
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{fmt.label}</span>
                  <span className="text-xs text-muted-foreground">{fmt.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedFormat && (
          <div className="p-3 bg-secondary/20 rounded-lg border border-primary/20">
            <p className="text-xs font-semibold text-primary mb-1">Format Details</p>
            <p className="text-xs text-muted-foreground mb-1">{selectedFormat.description}</p>
            <Badge variant="secondary" className="text-xs font-mono">
              {selectedFormat.extensions}
            </Badge>
          </div>
        )}
      </div>

      <Separator className="bg-primary/30" />

      <div className="space-y-2">
        <Label htmlFor="export-quality" className="text-sm">
          Export Quality
        </Label>
        <Select value={quality} onValueChange={(value) => setQuality(value as ExportOptions['quality'])}>
          <SelectTrigger id="export-quality">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUALITY_PRESETS.map((q) => (
              <SelectItem key={q.value} value={q.value}>
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{q.label}</span>
                  <span className="text-xs text-muted-foreground">{q.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedQuality && (
          <p className="text-xs text-muted-foreground">
            {selectedQuality.description}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="export-scale" className="text-sm">
            Scale Factor
          </Label>
          <Badge variant="secondary" className="font-mono">
            {scale.toFixed(2)}x
          </Badge>
        </div>
        <Slider
          id="export-scale"
          value={[scale]}
          onValueChange={(values) => setScale(values[0])}
          min={0.1}
          max={10}
          step={0.1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Adjust model scale for target application
        </p>
      </div>

      <Separator className="bg-primary/30" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="include-textures" className="text-sm">
              Include Textures
            </Label>
            <p className="text-xs text-muted-foreground">
              Export material colors and shaders
            </p>
          </div>
          <Switch
            id="include-textures"
            checked={includeTextures}
            onCheckedChange={setIncludeTextures}
            disabled={!supportsTextures}
          />
        </div>

        {supportsEmbedding && includeTextures && (
          <div className="flex items-center justify-between pl-4 animate-in fade-in duration-300">
            <div className="space-y-1">
              <Label htmlFor="embed-textures" className="text-sm">
                Embed Textures
              </Label>
              <p className="text-xs text-muted-foreground">
                Include textures in single file
              </p>
            </div>
            <Switch
              id="embed-textures"
              checked={embedTextures}
              onCheckedChange={setEmbedTextures}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="include-animation" className="text-sm">
              Include Animation
            </Label>
            <p className="text-xs text-muted-foreground">
              Export current rotation state
            </p>
          </div>
          <Switch
            id="include-animation"
            checked={includeAnimation}
            onCheckedChange={setIncludeAnimation}
            disabled={!supportsAnimation}
          />
        </div>
      </div>

      <Separator className="bg-primary/30" />

      {isExporting ? (
        <div className="space-y-3">
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
            <p className="text-sm text-primary font-semibold mb-2 flex items-center gap-2">
              <Sparkle className="animate-spin" />
              Exporting Model...
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(exportProgress)}%</span>
              </div>
              <div className="w-full bg-secondary/30 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-200 holographic-glow"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            disabled
            className="w-full border-primary/50"
          >
            <FileArrowDown className="mr-2" />
            Exporting...
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleExport}
          className="w-full bg-accent text-accent-foreground holographic-glow"
        >
          <FileArrowDown className="mr-2" size={20} />
          Export {selectedFormat?.label}
        </Button>
      )}

      <div className="p-4 bg-secondary/20 rounded-lg border border-primary/20">
        <h3 className="text-sm font-bold mb-2">Export Formats</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li><strong>OBJ:</strong> Universal format, widely supported</li>
          <li><strong>glTF/GLB:</strong> Modern web/game standard</li>
          <li><strong>STL:</strong> 3D printing and CAD software</li>
          <li><strong>PLY:</strong> Point cloud and scanning applications</li>
          <li><strong>FBX:</strong> Professional 3D software (Maya, Blender)</li>
        </ul>
      </div>

      <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
        <p className="text-xs font-semibold text-accent mb-2 flex items-center gap-2">
          <Camera size={14} />
          Export Tips
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Use GLB for web applications (single file)</li>
          <li>• STL is perfect for 3D printing</li>
          <li>• FBX works best with animation data</li>
          <li>• Higher quality = larger file size</li>
        </ul>
      </div>
    </div>
  )
}
