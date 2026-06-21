import { useState, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Slider } from "@/shared/ui/slider";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { Switch } from "@/shared/ui/switch";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { toast } from "sonner";
import {
  Code,
  Play,
  ArrowClockwise,
  Copy,
  Export,
  Lightning,
  Palette,
  Timer,
  Cube,
  CircleDashed,
} from "@phosphor-icons/react";

// Shader presets
const SHADER_PRESETS = [
  {
    id: "plasma",
    name: "Plasma Wave",
    fragment: `uniform float u_time;
uniform vec2 u_resolution;
uniform float u_speed;
uniform float u_scale;
uniform vec3 u_color1;
uniform vec3 u_color2;

varying vec2 vUv;

void main() {
  vec2 uv = vUv * u_scale;
  float t = u_time * u_speed;
  
  float v = sin(uv.x * 5.0 + t);
  v += sin((uv.y * 3.0 + t) * 1.5);
  v += sin((uv.x + uv.y) * 4.0 + t * 0.5);
  v += sin(length(uv - 0.5) * 8.0 - t * 2.0);
  v = v * 0.25 + 0.5;
  
  vec3 color = mix(u_color1, u_color2, v);
  gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    id: "noise",
    name: "Fractal Noise",
    fragment: `uniform float u_time;
uniform vec2 u_resolution;
uniform float u_speed;
uniform float u_scale;
uniform vec3 u_color1;
uniform vec3 u_color2;

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
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(st);
    st *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = vUv * u_scale;
  float t = u_time * u_speed;
  
  float n = fbm(uv + t * 0.3);
  n += fbm(uv * 2.0 - t * 0.2) * 0.5;
  
  vec3 color = mix(u_color1, u_color2, n);
  gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    id: "rings",
    name: "Hypnotic Rings",
    fragment: `uniform float u_time;
uniform vec2 u_resolution;
uniform float u_speed;
uniform float u_scale;
uniform vec3 u_color1;
uniform vec3 u_color2;

varying vec2 vUv;

void main() {
  vec2 uv = (vUv - 0.5) * u_scale;
  float t = u_time * u_speed;
  
  float d = length(uv);
  float a = atan(uv.y, uv.x);
  
  float rings = sin(d * 20.0 - t * 3.0);
  float spiral = sin(a * 5.0 + d * 10.0 - t * 2.0);
  float v = rings * 0.5 + spiral * 0.5;
  v = v * 0.5 + 0.5;
  
  vec3 color = mix(u_color1, u_color2, v);
  color *= 1.0 - d * 0.8;
  gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    id: "voronoi",
    name: "Voronoi Cells",
    fragment: `uniform float u_time;
uniform vec2 u_resolution;
uniform float u_speed;
uniform float u_scale;
uniform vec3 u_color1;
uniform vec3 u_color2;

varying vec2 vUv;

vec2 random2(vec2 p) {
  return fract(sin(vec2(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3))
  )) * 43758.5453);
}

void main() {
  vec2 uv = vUv * u_scale * 3.0;
  float t = u_time * u_speed;
  
  vec2 i_st = floor(uv);
  vec2 f_st = fract(uv);
  
  float m_dist = 1.0;
  
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = random2(i_st + neighbor);
      point = 0.5 + 0.5 * sin(t + 6.2831 * point);
      vec2 diff = neighbor + point - f_st;
      float dist = length(diff);
      m_dist = min(m_dist, dist);
    }
  }
  
  vec3 color = mix(u_color1, u_color2, m_dist);
  color += (1.0 - step(0.02, m_dist)) * vec3(1.0);
  gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    id: "raymarching",
    name: "Ray March Sphere",
    fragment: `uniform float u_time;
uniform vec2 u_resolution;
uniform float u_speed;
uniform float u_scale;
uniform vec3 u_color1;
uniform vec3 u_color2;

varying vec2 vUv;

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float scene(vec3 p) {
  float t = u_time * u_speed;
  float d = sdSphere(p, 0.5 * u_scale);
  d = min(d, sdSphere(p - vec3(sin(t) * 0.8, cos(t * 0.7) * 0.5, 0.0), 0.3));
  d = min(d, sdSphere(p - vec3(-sin(t * 0.5) * 0.6, -cos(t) * 0.4, sin(t * 0.3) * 0.5), 0.25));
  return d;
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  
  vec3 ro = vec3(0.0, 0.0, 2.5);
  vec3 rd = normalize(vec3(uv, -1.5));
  
  float d = 0.0;
  for (int i = 0; i < 64; i++) {
    vec3 p = ro + rd * d;
    float dist = scene(p);
    if (dist < 0.001) break;
    d += dist;
    if (d > 20.0) break;
  }
  
  vec3 color = u_color1 * 0.1;
  if (d < 20.0) {
    vec3 p = ro + rd * d;
    vec3 n = normalize(vec3(
      scene(p + vec3(0.001, 0, 0)) - scene(p - vec3(0.001, 0, 0)),
      scene(p + vec3(0, 0.001, 0)) - scene(p - vec3(0, 0.001, 0)),
      scene(p + vec3(0, 0, 0.001)) - scene(p - vec3(0, 0, 0.001))
    ));
    float light = max(dot(n, normalize(vec3(1, 1, 1))), 0.0);
    color = mix(u_color1, u_color2, light);
    color += pow(max(dot(reflect(-normalize(vec3(1,1,1)), n), -rd), 0.0), 32.0) * 0.5;
  }
  
  gl_FragColor = vec4(color, 1.0);
}`,
  },
];

const VERTEX_SHADER = `varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const GEOMETRY_TYPES = [
  { id: "plane", label: "Plane" },
  { id: "sphere", label: "Sphere" },
  { id: "cube", label: "Cube" },
  { id: "torus", label: "Torus" },
];

export function ShaderPlaygroundPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const animRef = useRef<number>(0);

  const [selectedPreset, setSelectedPreset] = useState("plasma");
  const [fragmentCode, setFragmentCode] = useState(SHADER_PRESETS[0].fragment);
  const [speed, setSpeed] = useState(1.0);
  const [scale, setScale] = useState(1.0);
  const [color1, setColor1] = useState("#00d9ff");
  const [color2, setColor2] = useState("#ff00ff");
  const [geometry, setGeometry] = useState("plane");
  const [autoRotate, setAutoRotate] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [fps, setFps] = useState(0);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() });

  // Initialize Three.js
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 2;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Create initial geometry and material
    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: SHADER_PRESETS[0].fragment,
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight) },
        u_speed: { value: 1.0 },
        u_scale: { value: 1.0 },
        u_color1: { value: new THREE.Color("#00d9ff") },
        u_color2: { value: new THREE.Color("#ff00ff") },
      },
    });
    materialRef.current = mat;

    const mesh = new THREE.Mesh(geo, mat);
    meshRef.current = mesh;
    scene.add(mesh);

    clockRef.current.start();

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      if (mat.uniforms.u_time) mat.uniforms.u_time.value = elapsed;

      if (autoRotate && meshRef.current) {
        meshRef.current.rotation.y += 0.01;
        meshRef.current.rotation.x += 0.005;
      }

      renderer.render(scene, camera);

      // FPS counter
      fpsCounterRef.current.frames++;
      const now = performance.now();
      if (now - fpsCounterRef.current.lastTime >= 1000) {
        setFps(fpsCounterRef.current.frames);
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastTime = now;
      }
    };
    animate();

    const handleResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (mat.uniforms.u_resolution) {
        mat.uniforms.u_resolution.value.set(w, h);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update uniforms
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;
    if (mat.uniforms.u_speed) mat.uniforms.u_speed.value = speed;
    if (mat.uniforms.u_scale) mat.uniforms.u_scale.value = scale;
    if (mat.uniforms.u_color1) mat.uniforms.u_color1.value.set(color1);
    if (mat.uniforms.u_color2) mat.uniforms.u_color2.value.set(color2);
  }, [speed, scale, color1, color2]);

  // Update geometry
  useEffect(() => {
    const scene = sceneRef.current;
    const mesh = meshRef.current;
    if (!scene || !mesh) return;

    mesh.geometry.dispose();
    let geo: THREE.BufferGeometry;
    switch (geometry) {
      case "sphere":
        geo = new THREE.SphereGeometry(1, 64, 64);
        break;
      case "cube":
        geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        break;
      case "torus":
        geo = new THREE.TorusGeometry(0.7, 0.3, 32, 64);
        break;
      default:
        geo = new THREE.PlaneGeometry(2, 2);
    }
    mesh.geometry = geo;
  }, [geometry]);

  // Handle auto-rotate
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    if (!autoRotate) {
      mesh.rotation.set(0, 0, 0);
    }
  }, [autoRotate]);

  // Handle wireframe
  useEffect(() => {
    const mat = materialRef.current;
    if (mat) mat.wireframe = wireframe;
  }, [wireframe]);

  const compileShader = useCallback(() => {
    const mat = materialRef.current;
    if (!mat) return;

    try {
      mat.fragmentShader = fragmentCode;
      mat.needsUpdate = true;
      setCompileError(null);
      toast.success("Shader compiled successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setCompileError(msg);
      toast.error("Shader compilation failed");
    }
  }, [fragmentCode]);

  const loadPreset = useCallback((presetId: string) => {
    const preset = SHADER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPreset(presetId);
    setFragmentCode(preset.fragment);

    const mat = materialRef.current;
    if (mat) {
      mat.fragmentShader = preset.fragment;
      mat.needsUpdate = true;
      setCompileError(null);
    }
    toast.success(`Loaded "${preset.name}"`);
  }, []);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(fragmentCode);
    toast.success("Shader code copied!");
  }, [fragmentCode]);

  const exportScreenshot = useCallback(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
    const dataUrl = renderer.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "shader-output.png";
    link.href = dataUrl;
    link.click();
    toast.success("Screenshot exported!");
  }, []);

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-0px)] overflow-hidden">
        {/* Three.js Preview */}
        <div className="flex-1 relative">
          <canvas ref={canvasRef} className="w-full h-full" />

          {/* Floating HUD */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm font-mono">
              {fps} FPS
            </Badge>
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm capitalize">
              {geometry}
            </Badge>
            {compileError && (
              <Badge variant="destructive" className="backdrop-blur-sm">
                Compile Error
              </Badge>
            )}
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={compileShader}>
                  <Play className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Compile Shader (Ctrl+Enter)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={exportScreenshot}>
                  <Export className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export Screenshot</TooltipContent>
            </Tooltip>
          </div>

          {/* Error overlay */}
          {compileError && (
            <div className="absolute bottom-4 left-4 right-4">
              <Card className="p-3 bg-destructive/10 border-destructive/50">
                <p className="text-xs font-mono text-destructive">{compileError}</p>
              </Card>
            </div>
          )}
        </div>

        {/* Right panel */}
        <aside className="w-[400px] border-l border-border/50 bg-card/30 backdrop-blur-xl flex flex-col">
          <div className="p-4 border-b border-border/50">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" weight="duotone" />
              Shader Playground
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Real-time GLSL + Three.js</p>
          </div>

          <Tabs defaultValue="code" className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-4 mt-3 grid grid-cols-3">
              <TabsTrigger value="code" className="text-xs">Code</TabsTrigger>
              <TabsTrigger value="uniforms" className="text-xs">Uniforms</TabsTrigger>
              <TabsTrigger value="scene" className="text-xs">Scene</TabsTrigger>
            </TabsList>

            {/* Code Tab */}
            <TabsContent value="code" className="flex-1 flex flex-col min-h-0 px-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Preset</Label>
                <Select value={selectedPreset} onValueChange={loadPreset}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHADER_PRESETS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-h-0 relative">
                <textarea
                  className="w-full h-full resize-none bg-background/50 border border-border rounded-lg p-3 font-mono text-xs leading-relaxed text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={fragmentCode}
                  onChange={(e) => setFragmentCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      compileShader();
                    }
                  }}
                  spellCheck={false}
                />
              </div>

              <div className="flex gap-2 mt-3">
                <Button className="flex-1" onClick={compileShader}>
                  <Play className="w-4 h-4 mr-2" /> Compile
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={copyCode}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy Code</TooltipContent>
                </Tooltip>
                <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Export className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Share Shader</DialogTitle>
                      <DialogDescription>
                        Copy the fragment shader source to share
                      </DialogDescription>
                    </DialogHeader>
                    <pre className="bg-muted p-4 rounded-lg text-xs font-mono max-h-64 overflow-auto">
                      {fragmentCode}
                    </pre>
                    <Button onClick={() => { copyCode(); setShareDialogOpen(false); }}>
                      <Copy className="w-4 h-4 mr-2" /> Copy to Clipboard
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>

            {/* Uniforms Tab */}
            <TabsContent value="uniforms" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <Accordion type="multiple" defaultValue={["timing", "colors", "transform"]}>
                  <AccordionItem value="timing">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <Timer className="w-4 h-4" /> Timing
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs">Speed: {speed.toFixed(1)}x</Label>
                          <Slider
                            value={[speed]}
                            min={0}
                            max={5}
                            step={0.1}
                            onValueChange={([v]) => setSpeed(v)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Scale: {scale.toFixed(1)}</Label>
                          <Slider
                            value={[scale]}
                            min={0.1}
                            max={5}
                            step={0.1}
                            onValueChange={([v]) => setScale(v)}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="colors">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <Palette className="w-4 h-4" /> Colors
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs mb-2 block">Color 1</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={color1}
                              onChange={(e) => setColor1(e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer border border-border"
                            />
                            <span className="text-xs font-mono text-muted-foreground">{color1}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs mb-2 block">Color 2</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={color2}
                              onChange={(e) => setColor2(e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer border border-border"
                            />
                            <span className="text-xs font-mono text-muted-foreground">{color2}</span>
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <Label className="text-xs mb-2 block">Quick Palettes</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { c1: "#00d9ff", c2: "#ff00ff", label: "Cyber" },
                              { c1: "#ff4400", c2: "#ffdd00", label: "Fire" },
                              { c1: "#00ff41", c2: "#0044ff", label: "Matrix" },
                              { c1: "#9d00ff", c2: "#ff006e", label: "Neon" },
                            ].map((p) => (
                              <Button
                                key={p.label}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => { setColor1(p.c1); setColor2(p.c2); }}
                              >
                                <div className="flex gap-1 mr-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.c1 }} />
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.c2 }} />
                                </div>
                                {p.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="transform">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <Lightning className="w-4 h-4" /> Display
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Auto Rotate</Label>
                          <Switch checked={autoRotate} onCheckedChange={setAutoRotate} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Wireframe Overlay</Label>
                          <Switch checked={wireframe} onCheckedChange={setWireframe} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ScrollArea>
            </TabsContent>

            {/* Scene Tab */}
            <TabsContent value="scene" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs mb-2 block">Geometry</Label>
                    <Select value={geometry} onValueChange={setGeometry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GEOMETRY_TYPES.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-xs mb-2 block">Quick Actions</Label>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" onClick={() => { setSpeed(1); setScale(1); }}>
                        <ArrowClockwise className="w-4 h-4 mr-2" /> Reset Uniforms
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={exportScreenshot}>
                        <Export className="w-4 h-4 mr-2" /> Export Frame
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <Card className="p-3 bg-muted/30">
                    <h4 className="text-xs font-medium mb-2">Shader Info</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Language: GLSL ES 3.0</p>
                      <p>Renderer: WebGL 2.0</p>
                      <p>Lines: {fragmentCode.split("\n").length}</p>
                      <p>Uniforms: 6 (time, resolution, speed, scale, color1, color2)</p>
                    </div>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </TooltipProvider>
  );
}
