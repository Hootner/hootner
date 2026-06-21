import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { Label } from '@/shared/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Badge } from '@/shared/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Separator } from '@/shared/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Code, Play, FloppyDisk, FolderOpen, Copy, Trash, Warning, CheckCircle, Sparkle, FileCode, Eye, Download, Upload } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { usePlatformKV } from '@/shared/hooks/usePlatformKV'

interface ShaderPreset {
  id: string
  name: string
  description: string
  vertexShader: string
  fragmentShader: string
  category: 'basic' | 'animated' | 'advanced' | 'custom'
}

const SHADER_PRESETS: ShaderPreset[] = [
  {
    id: 'default',
    name: 'Default Hologram',
    description: 'Classic holographic shader with wireframe',
    category: 'basic',
    vertexShader: `varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragmentShader: `uniform vec3 primaryColor;
uniform vec3 secondaryColor;
uniform float glowIntensity;
uniform float time;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
  
  vec3 color = mix(primaryColor, secondaryColor, fresnel);
  float glow = fresnel * glowIntensity;
  
  gl_FragColor = vec4(color + glow, 0.7 + fresnel * 0.3);
}`
  },
  {
    id: 'wave',
    name: 'Wave Distortion',
    description: 'Animated wave effect with color shifts',
    category: 'animated',
    vertexShader: `uniform float time;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main() {
  vNormal = normalize(normalMatrix * normal);
  
  float displacement = sin(position.x * 5.0 + time) * 
                      cos(position.y * 5.0 + time) * 0.1;
  
  vec3 newPosition = position + normal * displacement;
  vDisplacement = displacement;
  
  vPosition = (modelViewMatrix * vec4(newPosition, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}`,
    fragmentShader: `uniform vec3 primaryColor;
uniform vec3 secondaryColor;
uniform float glowIntensity;
uniform float time;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main() {
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5);
  
  float colorMix = (sin(time * 2.0 + vDisplacement * 10.0) + 1.0) * 0.5;
  vec3 color = mix(primaryColor, secondaryColor, colorMix);
  
  float glow = (fresnel + abs(vDisplacement) * 2.0) * glowIntensity;
  
  gl_FragColor = vec4(color + glow, 0.8);
}`
  },
  {
    id: 'noise',
    name: 'Noise Pattern',
    description: 'Procedural noise-based texture',
    category: 'advanced',
    vertexShader: `varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragmentShader: `uniform vec3 primaryColor;
uniform vec3 secondaryColor;
uniform float glowIntensity;
uniform float time;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 st = vUv * 10.0;
  float n = noise(st + time * 0.5);
  
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
  
  vec3 color = mix(primaryColor, secondaryColor, n);
  float glow = (fresnel + n * 0.5) * glowIntensity;
  
  gl_FragColor = vec4(color + glow, 0.7 + fresnel * 0.3);
}`
  },
  {
    id: 'crystal',
    name: 'Crystal Facets',
    description: 'Multi-faceted crystalline appearance',
    category: 'advanced',
    vertexShader: `varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragmentShader: `uniform vec3 primaryColor;
uniform vec3 secondaryColor;
uniform float glowIntensity;
uniform float time;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

void main() {
  vec3 viewDir = normalize(-vPosition);
  
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
  
  float facet = abs(sin(vWorldPosition.x * 20.0)) * 
                abs(sin(vWorldPosition.y * 20.0)) * 
                abs(sin(vWorldPosition.z * 20.0));
  
  float shimmer = sin(time * 5.0 + facet * 10.0) * 0.5 + 0.5;
  
  vec3 color = mix(primaryColor, secondaryColor, facet * shimmer);
  float glow = (fresnel + facet * shimmer) * glowIntensity;
  
  gl_FragColor = vec4(color + glow, 0.85 + fresnel * 0.15);
}`
  },
  {
    id: 'plasma',
    name: 'Plasma Energy',
    description: 'Flowing plasma effect',
    category: 'animated',
    vertexShader: `varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragmentShader: `uniform vec3 primaryColor;
uniform vec3 secondaryColor;
uniform float glowIntensity;
uniform float time;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vec2 uv = vUv * 4.0;
  
  float plasma = sin(uv.x * 10.0 + time) + 
                 sin(uv.y * 10.0 + time) + 
                 sin((uv.x + uv.y) * 10.0 + time) +
                 sin(sqrt(uv.x * uv.x + uv.y * uv.y) * 10.0 + time);
  
  plasma = plasma * 0.25 + 0.5;
  
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
  
  vec3 color = mix(primaryColor, secondaryColor, plasma);
  float glow = (fresnel + plasma) * glowIntensity * 1.5;
  
  gl_FragColor = vec4(color + glow, 0.9);
}`
  },
  {
    id: 'holographic-scan',
    name: 'Holographic Scan',
    description: 'Animated scanning lines effect',
    category: 'animated',
    vertexShader: `varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragmentShader: `uniform vec3 primaryColor;
uniform vec3 secondaryColor;
uniform float glowIntensity;
uniform float time;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

void main() {
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5);
  
  float scanLine = sin(vWorldPosition.y * 30.0 - time * 5.0);
  scanLine = smoothstep(0.5, 0.7, scanLine);
  
  float grid = abs(sin(vWorldPosition.x * 20.0)) * abs(sin(vWorldPosition.z * 20.0));
  
  vec3 color = mix(primaryColor, secondaryColor, scanLine);
  float glow = (fresnel + scanLine * 2.0 + grid * 0.5) * glowIntensity;
  
  gl_FragColor = vec4(color + glow, 0.7 + fresnel * 0.2 + scanLine * 0.1);
}`
  }
]

interface ShaderEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplyShader: (vertexShader: string, fragmentShader: string, name: string) => void
  currentShader?: {
    vertex: string
    fragment: string
    name: string
  }
}

export function ShaderEditor({ open, onOpenChange, onApplyShader, currentShader }: ShaderEditorProps) {
  const [vertexShader, setVertexShader] = useState(SHADER_PRESETS[0].vertexShader)
  const [fragmentShader, setFragmentShader] = useState(SHADER_PRESETS[0].fragmentShader)
  const [shaderName, setShaderName] = useState('Custom Shader')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(true)
  const [selectedPreset, setSelectedPreset] = useState<string>('default')
  const [customShaders, setCustomShaders] = usePlatformKV<ShaderPreset[]>('custom-shaders', [])
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  useEffect(() => {
    if (currentShader) {
      setVertexShader(currentShader.vertex)
      setFragmentShader(currentShader.fragment)
      setShaderName(currentShader.name)
    }
  }, [currentShader])

  const validateShader = () => {
    const vertexRequired = ['gl_Position', 'main']
    const fragmentRequired = ['gl_FragColor', 'main']

    const missingVertex = vertexRequired.filter(keyword => !vertexShader.includes(keyword))
    const missingFragment = fragmentRequired.filter(keyword => !fragmentShader.includes(keyword))

    if (missingVertex.length > 0 || missingFragment.length > 0) {
      const errors: string[] = []
      if (missingVertex.length > 0) {
        errors.push(`Vertex shader missing: ${missingVertex.join(', ')}`)
      }
      if (missingFragment.length > 0) {
        errors.push(`Fragment shader missing: ${missingFragment.join(', ')}`)
      }
      setValidationError(errors.join('\n'))
      setIsValid(false)
      return false
    }

    setValidationError(null)
    setIsValid(true)
    return true
  }

  const applyShader = () => {
    if (validateShader()) {
      onApplyShader(vertexShader, fragmentShader, shaderName)
      toast.success(`Applied shader: ${shaderName}`)
    } else {
      toast.error('Shader validation failed. Check for errors.')
    }
  }

  const loadPreset = (presetId: string) => {
    const preset = [...SHADER_PRESETS, ...(customShaders || [])].find(p => p.id === presetId)
    if (preset) {
      setVertexShader(preset.vertexShader)
      setFragmentShader(preset.fragmentShader)
      setShaderName(preset.name)
      setSelectedPreset(presetId)
      setValidationError(null)
      setIsValid(true)
      toast.success(`Loaded preset: ${preset.name}`)
    }
  }

  const saveCustomShader = () => {
    if (!validateShader()) {
      toast.error('Cannot save invalid shader')
      return
    }

    const newShader: ShaderPreset = {
      id: `custom-${Date.now()}`,
      name: shaderName || 'Custom Shader',
      description: 'User-created custom shader',
      category: 'custom',
      vertexShader,
      fragmentShader
    }

    setCustomShaders((current) => [...(current || []), newShader])
    toast.success(`Saved: ${newShader.name}`)
    setShowSaveDialog(false)
  }

  const deleteCustomShader = (id: string) => {
    setCustomShaders((current) => (current || []).filter(s => s.id !== id))
    toast.success('Shader deleted')
  }

  const exportShader = () => {
    const shaderData = {
      name: shaderName,
      vertexShader,
      fragmentShader,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(shaderData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${shaderName.replace(/\s+/g, '-').toLowerCase()}-shader.json`
    link.click()
    URL.revokeObjectURL(url)

    toast.success('Shader exported')
  }

  const importShader = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)
          if (data.vertexShader && data.fragmentShader) {
            setVertexShader(data.vertexShader)
            setFragmentShader(data.fragmentShader)
            setShaderName(data.name || 'Imported Shader')
            toast.success('Shader imported successfully')
          } else {
            toast.error('Invalid shader file format')
          }
        } catch (error) {
          toast.error('Failed to parse shader file')
        }
      }
      reader.readAsText(file)
    }

    input.click()
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-accent/50 max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl text-accent flex items-center gap-2">
            <Code size={28} className="animate-pulse" />
            Custom Shader Editor
          </DialogTitle>
          <DialogDescription>
            Write custom GLSL shaders for advanced material programming. Create unique visual effects with vertex and fragment shaders.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Shader Presets</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={importShader}
                  className="border-primary/50 hover:border-primary hover:bg-primary/10"
                >
                  <Upload className="mr-1" size={14} />
                  Import
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportShader}
                  className="border-primary/50 hover:border-primary hover:bg-primary/10"
                >
                  <Download className="mr-1" size={14} />
                  Export
                </Button>
              </div>
            </div>
            
            <Select value={selectedPreset} onValueChange={loadPreset}>
              <SelectTrigger className="w-full border-accent/30">
                <SelectValue placeholder="Select a preset" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-accent/50">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">BUILT-IN PRESETS</div>
                {SHADER_PRESETS.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    <div className="flex items-center gap-2">
                      <FileCode size={14} />
                      <div>
                        <div className="font-semibold">{preset.name}</div>
                        <div className="text-xs text-muted-foreground">{preset.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
                
                {customShaders && customShaders.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">CUSTOM SHADERS</div>
                    {customShaders.map((shader) => (
                      <SelectItem key={shader.id} value={shader.id}>
                        <div className="flex items-center gap-2">
                          <Sparkle size={14} className="text-accent" />
                          <div>
                            <div className="font-semibold">{shader.name}</div>
                            <div className="text-xs text-muted-foreground">{shader.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {validationError && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <Warning className="h-4 w-4" />
              <AlertTitle>Shader Validation Error</AlertTitle>
              <AlertDescription className="text-xs whitespace-pre-line">
                {validationError}
              </AlertDescription>
            </Alert>
          )}

          {isValid && !validationError && (
            <Alert className="border-accent/50 bg-accent/10">
              <CheckCircle className="h-4 w-4 text-accent" />
              <AlertTitle className="text-accent">Shader Valid</AlertTitle>
              <AlertDescription className="text-xs">
                Your shader code passes basic validation checks. Click "Apply Shader" to preview it.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="vertex" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vertex">
                <Code className="mr-2" size={16} />
                Vertex Shader
              </TabsTrigger>
              <TabsTrigger value="fragment">
                <Code className="mr-2" size={16} />
                Fragment Shader
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vertex" className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Vertex Shader (GLSL)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(vertexShader, 'Vertex shader')}
                  className="h-8"
                >
                  <Copy size={14} className="mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={vertexShader}
                onChange={(e) => {
                  setVertexShader(e.target.value)
                  setIsValid(false)
                }}
                placeholder="Write your vertex shader code here..."
                className="font-mono text-xs min-h-[400px] border-accent/30 bg-black/50 resize-none"
              />
              <div className="p-3 bg-secondary/20 rounded-lg border border-primary/20">
                <h4 className="text-xs font-bold mb-2 text-accent">Available Uniforms:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><Badge variant="secondary">time</Badge> - Animation time</div>
                  <div><Badge variant="secondary">primaryColor</Badge> - Primary color (vec3)</div>
                  <div><Badge variant="secondary">secondaryColor</Badge> - Secondary color (vec3)</div>
                  <div><Badge variant="secondary">glowIntensity</Badge> - Glow strength (float)</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fragment" className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Fragment Shader (GLSL)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(fragmentShader, 'Fragment shader')}
                  className="h-8"
                >
                  <Copy size={14} className="mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={fragmentShader}
                onChange={(e) => {
                  setFragmentShader(e.target.value)
                  setIsValid(false)
                }}
                placeholder="Write your fragment shader code here..."
                className="font-mono text-xs min-h-[400px] border-accent/30 bg-black/50 resize-none"
              />
              <div className="p-3 bg-secondary/20 rounded-lg border border-primary/20">
                <h4 className="text-xs font-bold mb-2 text-accent">Available Varyings:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><Badge variant="secondary">vNormal</Badge> - Surface normal (vec3)</div>
                  <div><Badge variant="secondary">vPosition</Badge> - View position (vec3)</div>
                  <div><Badge variant="secondary">vUv</Badge> - UV coordinates (vec2)</div>
                  <div><Badge variant="secondary">vWorldPosition</Badge> - World position (vec3)</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {customShaders && customShaders.length > 0 && (
            <>
              <Separator className="bg-accent/30" />
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Saved Custom Shaders</Label>
                <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto">
                  {customShaders.map((shader) => (
                    <div
                      key={shader.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-accent/30 bg-secondary/20 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Sparkle className="text-accent" size={16} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{shader.name}</div>
                          <div className="text-xs text-muted-foreground">{shader.description}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadPreset(shader.id)}
                          className="h-8"
                        >
                          <FolderOpen size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCustomShader(shader.id)}
                          className="h-8 hover:bg-destructive/20 hover:text-destructive"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="border-t border-accent/30 pt-4">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={validateShader}
                className="border-primary/50 hover:border-primary hover:bg-primary/10"
              >
                <CheckCircle className="mr-2" size={16} />
                Validate
              </Button>
              <Button
                variant="outline"
                onClick={saveCustomShader}
                disabled={!isValid}
                className="border-accent/50 hover:border-accent hover:bg-accent/10"
              >
                <FloppyDisk className="mr-2" size={16} />
                Save Custom
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-primary/50"
              >
                Cancel
              </Button>
              <Button
                onClick={applyShader}
                disabled={!isValid}
                className="bg-accent text-accent-foreground holographic-glow"
              >
                <Play className="mr-2" size={16} />
                Apply Shader
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
