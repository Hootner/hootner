import { useState, useRef, useCallback, useEffect } from "react";
import * as THREE from "three";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Slider } from "@/shared/ui/slider";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/shared/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { toast } from "sonner";
import {
  Cube,
  CircleDashed,
  Cylinder,
  Diamond,
  Plus,
  Trash,
  Copy,
  Eye,
  EyeSlash,
  ArrowsOut,
  Camera,
  Lightning,
  Sun,
  Moon,
  Palette,
  Export,
} from "@phosphor-icons/react";

interface SceneObject {
  id: string;
  name: string;
  type: "box" | "sphere" | "cylinder" | "cone" | "torus" | "dodecahedron";
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  material: "standard" | "phong" | "lambert" | "wireframe" | "glass" | "metal";
  visible: boolean;
  castShadow: boolean;
}

const OBJECT_TYPES = [
  { id: "box", label: "Cube", icon: Cube },
  { id: "sphere", label: "Sphere", icon: CircleDashed },
  { id: "cylinder", label: "Cylinder", icon: Cylinder },
  { id: "cone", label: "Cone", icon: Diamond },
  { id: "torus", label: "Torus", icon: CircleDashed },
  { id: "dodecahedron", label: "Dodecahedron", icon: Diamond },
] as const;

const MATERIALS = [
  { id: "standard", label: "Standard PBR" },
  { id: "phong", label: "Phong" },
  { id: "lambert", label: "Lambert" },
  { id: "wireframe", label: "Wireframe" },
  { id: "glass", label: "Glass" },
  { id: "metal", label: "Metal" },
] as const;

const COLOR_PALETTE = [
  "#ff4444", "#ff8844", "#ffdd44", "#44ff44",
  "#44ddff", "#4488ff", "#8844ff", "#ff44dd",
  "#ffffff", "#888888", "#00d9ff", "#ff00ff",
];

const ENVIRONMENT_PRESETS = [
  { id: "studio", label: "Studio" },
  { id: "sunset", label: "Sunset" },
  { id: "night", label: "Night" },
  { id: "forest", label: "Forest" },
  { id: "space", label: "Space" },
];

export function SceneBuilderPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const animationRef = useRef<number>(0);

  const [objects, setObjects] = useState<SceneObject[]>([
    {
      id: "obj-1",
      name: "Main Cube",
      type: "box",
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: "#00d9ff",
      material: "standard",
      visible: true,
      castShadow: true,
    },
    {
      id: "obj-2",
      name: "Sphere Light",
      type: "sphere",
      position: [2, 1, -1],
      rotation: [0, 0, 0],
      scale: [0.5, 0.5, 0.5],
      color: "#ff00ff",
      material: "glass",
      visible: true,
      castShadow: true,
    },
  ]);

  const [selectedObjectId, setSelectedObjectId] = useState<string | null>("obj-1");
  const [environment, setEnvironment] = useState("studio");
  const [showGrid, setShowGrid] = useState(true);
  const [showShadows, setShowShadows] = useState(true);
  const [ambientIntensity, setAmbientIntensity] = useState(0.4);
  const [directionalIntensity, setDirectionalIntensity] = useState(0.8);
  const [autoRotate, setAutoRotate] = useState(true);
  const [fov, setFov] = useState(60);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const selectedObject = objects.find((o) => o.id === selectedObjectId) || null;

  // Initialize Three.js scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(fov, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(5, 4, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, ambientIntensity);
    ambient.name = "ambient";
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, directionalIntensity);
    directional.position.set(5, 8, 5);
    directional.castShadow = true;
    directional.shadow.mapSize.set(2048, 2048);
    directional.name = "directional";
    scene.add(directional);

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    grid.name = "grid";
    scene.add(grid);

    // Ground plane for shadows
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = "ground";
    scene.add(ground);

    // Background
    scene.background = new THREE.Color(0x0a0a0f);

    // Animation loop
    let angle = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      if (autoRotate) {
        angle += 0.005;
        camera.position.x = 5 * Math.cos(angle);
        camera.position.z = 5 * Math.sin(angle);
        camera.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync objects to scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old meshes
    meshMapRef.current.forEach((mesh, id) => {
      if (!objects.find((o) => o.id === id)) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
        meshMapRef.current.delete(id);
      }
    });

    // Add/update meshes
    objects.forEach((obj) => {
      let mesh = meshMapRef.current.get(obj.id);

      if (!mesh) {
        const geometry = createGeometry(obj.type);
        const material = createMaterial(obj.material, obj.color);
        mesh = new THREE.Mesh(geometry, material);
        mesh.name = obj.id;
        scene.add(mesh);
        meshMapRef.current.set(obj.id, mesh);
      } else {
        // Update material
        const newMat = createMaterial(obj.material, obj.color);
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
        mesh.material = newMat;
      }

      mesh.position.set(...obj.position);
      mesh.rotation.set(...obj.rotation);
      mesh.scale.set(...obj.scale);
      mesh.visible = obj.visible;
      mesh.castShadow = obj.castShadow;
    });
  }, [objects]);

  // Update lighting
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const ambient = scene.getObjectByName("ambient") as THREE.AmbientLight | undefined;
    if (ambient) ambient.intensity = ambientIntensity;
    const dir = scene.getObjectByName("directional") as THREE.DirectionalLight | undefined;
    if (dir) dir.intensity = directionalIntensity;
  }, [ambientIntensity, directionalIntensity]);

  // Update grid visibility
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const grid = scene.getObjectByName("grid");
    if (grid) grid.visible = showGrid;
  }, [showGrid]);

  // Update shadow settings
  useEffect(() => {
    const renderer = rendererRef.current;
    if (renderer) renderer.shadowMap.enabled = showShadows;
  }, [showShadows]);

  // Update FOV
  useEffect(() => {
    const camera = cameraRef.current;
    if (camera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, [fov]);

  // Update environment
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const colors: Record<string, number> = {
      studio: 0x0a0a0f,
      sunset: 0x1a0800,
      night: 0x000510,
      forest: 0x001a00,
      space: 0x000005,
    };
    scene.background = new THREE.Color(colors[environment] || 0x0a0a0f);
  }, [environment]);

  const addObject = useCallback((type: SceneObject["type"]) => {
    const id = `obj-${Date.now()}`;
    const newObj: SceneObject = {
      id,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${objects.length + 1}`,
      type,
      position: [Math.random() * 4 - 2, Math.random() * 2, Math.random() * 4 - 2],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
      material: "standard",
      visible: true,
      castShadow: true,
    };
    setObjects((prev) => [...prev, newObj]);
    setSelectedObjectId(id);
    setAddDialogOpen(false);
    toast.success(`Added ${type}`);
  }, [objects.length]);

  const duplicateObject = useCallback((id: string) => {
    const obj = objects.find((o) => o.id === id);
    if (!obj) return;
    const newId = `obj-${Date.now()}`;
    const clone: SceneObject = {
      ...obj,
      id: newId,
      name: `${obj.name} (copy)`,
      position: [obj.position[0] + 1, obj.position[1], obj.position[2]],
    };
    setObjects((prev) => [...prev, clone]);
    setSelectedObjectId(newId);
    toast.success("Object duplicated");
  }, [objects]);

  const deleteObject = useCallback((id: string) => {
    setObjects((prev) => prev.filter((o) => o.id !== id));
    if (selectedObjectId === id) setSelectedObjectId(null);
    toast.success("Object deleted");
  }, [selectedObjectId]);

  const updateObject = useCallback((id: string, updates: Partial<SceneObject>) => {
    setObjects((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  }, []);

  const captureScreenshot = useCallback(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
    const dataUrl = renderer.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "scene-capture.png";
    link.href = dataUrl;
    link.click();
    toast.success("Screenshot captured!");
  }, []);

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-0px)] overflow-hidden">
        {/* Three.js Canvas */}
        <div className="flex-1 relative">
          <ContextMenu>
            <ContextMenuTrigger className="h-full w-full block">
              <canvas ref={canvasRef} className="w-full h-full" />
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => setAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Object
              </ContextMenuItem>
              <ContextMenuItem onClick={captureScreenshot}>
                <Camera className="w-4 h-4 mr-2" /> Capture Screenshot
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => setAutoRotate(!autoRotate)}>
                {autoRotate ? "Stop" : "Start"} Auto-Rotate
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setShowGrid(!showGrid)}>
                {showGrid ? "Hide" : "Show"} Grid
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          {/* Floating toolbar */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              {objects.length} objects
            </Badge>
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm capitalize">
              {environment}
            </Badge>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={() => setAddDialogOpen(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Object</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={captureScreenshot}>
                  <Camera className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Capture Screenshot</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={() => setAutoRotate(!autoRotate)}>
                  {autoRotate ? <Lightning className="w-4 h-4" /> : <ArrowsOut className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{autoRotate ? "Stop" : "Start"} Rotation</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Right panel */}
        <aside className="w-[360px] border-l border-border/50 bg-card/30 backdrop-blur-xl flex flex-col">
          <div className="p-4 border-b border-border/50">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Cube className="w-5 h-5 text-primary" weight="duotone" />
              Scene Builder
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Three.js + Radix UI</p>
          </div>

          <Tabs defaultValue="objects" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-3 grid grid-cols-3">
              <TabsTrigger value="objects" className="text-xs">Objects</TabsTrigger>
              <TabsTrigger value="properties" className="text-xs">Properties</TabsTrigger>
              <TabsTrigger value="scene" className="text-xs">Scene</TabsTrigger>
            </TabsList>

            {/* Objects Tab */}
            <TabsContent value="objects" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="space-y-2">
                  {objects.map((obj) => (
                    <Card
                      key={obj.id}
                      className={`p-3 cursor-pointer transition-all ${
                        selectedObjectId === obj.id
                          ? "ring-1 ring-primary bg-primary/10"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedObjectId(obj.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: obj.color }}
                          />
                          <span className="text-sm font-medium">{obj.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateObject(obj.id, { visible: !obj.visible });
                                }}
                              >
                                {obj.visible ? <Eye className="w-3 h-3" /> : <EyeSlash className="w-3 h-3" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Toggle Visibility</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateObject(obj.id);
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Duplicate</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteObject(obj.id);
                                }}
                              >
                                <Trash className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="secondary" className="text-[10px]">{obj.type}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{obj.material}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>

                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4" variant="outline">
                      <Plus className="w-4 h-4 mr-2" /> Add Object
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add 3D Object</DialogTitle>
                      <DialogDescription>
                        Choose a geometry to add to the scene
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {OBJECT_TYPES.map((type) => (
                        <Button
                          key={type.id}
                          variant="outline"
                          className="flex flex-col h-20 gap-2"
                          onClick={() => addObject(type.id as SceneObject["type"])}
                        >
                          <type.icon className="w-6 h-6" weight="duotone" />
                          <span className="text-xs">{type.label}</span>
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </ScrollArea>
            </TabsContent>

            {/* Properties Tab */}
            <TabsContent value="properties" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4">
                {selectedObject ? (
                  <Accordion type="multiple" defaultValue={["transform", "material", "options"]}>
                    <AccordionItem value="transform">
                      <AccordionTrigger>Transform</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs">Position X: {selectedObject.position[0].toFixed(1)}</Label>
                            <Slider
                              value={[selectedObject.position[0]]}
                              min={-5}
                              max={5}
                              step={0.1}
                              onValueChange={([v]) =>
                                updateObject(selectedObject.id, {
                                  position: [v, selectedObject.position[1], selectedObject.position[2]],
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Position Y: {selectedObject.position[1].toFixed(1)}</Label>
                            <Slider
                              value={[selectedObject.position[1]]}
                              min={-5}
                              max={5}
                              step={0.1}
                              onValueChange={([v]) =>
                                updateObject(selectedObject.id, {
                                  position: [selectedObject.position[0], v, selectedObject.position[2]],
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Position Z: {selectedObject.position[2].toFixed(1)}</Label>
                            <Slider
                              value={[selectedObject.position[2]]}
                              min={-5}
                              max={5}
                              step={0.1}
                              onValueChange={([v]) =>
                                updateObject(selectedObject.id, {
                                  position: [selectedObject.position[0], selectedObject.position[1], v],
                                })
                              }
                            />
                          </div>
                          <Separator />
                          <div>
                            <Label className="text-xs">Scale: {selectedObject.scale[0].toFixed(1)}</Label>
                            <Slider
                              value={[selectedObject.scale[0]]}
                              min={0.1}
                              max={3}
                              step={0.1}
                              onValueChange={([v]) =>
                                updateObject(selectedObject.id, { scale: [v, v, v] })
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Rotation Y: {((selectedObject.rotation[1] * 180) / Math.PI).toFixed(0)}°</Label>
                            <Slider
                              value={[selectedObject.rotation[1]]}
                              min={0}
                              max={Math.PI * 2}
                              step={0.1}
                              onValueChange={([v]) =>
                                updateObject(selectedObject.id, {
                                  rotation: [selectedObject.rotation[0], v, selectedObject.rotation[2]],
                                })
                              }
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="material">
                      <AccordionTrigger>Material</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs mb-2 block">Material Type</Label>
                            <Select
                              value={selectedObject.material}
                              onValueChange={(v) =>
                                updateObject(selectedObject.id, { material: v as SceneObject["material"] })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {MATERIALS.map((m) => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs mb-2 block">Color</Label>
                            <div className="grid grid-cols-6 gap-2">
                              {COLOR_PALETTE.map((color) => (
                                <button
                                  key={color}
                                  className={`w-7 h-7 rounded-md border-2 transition-all ${
                                    selectedObject.color === color
                                      ? "border-white scale-110"
                                      : "border-transparent hover:border-white/50"
                                  }`}
                                  style={{ backgroundColor: color }}
                                  onClick={() => updateObject(selectedObject.id, { color })}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="options">
                      <AccordionTrigger>Options</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Cast Shadow</Label>
                            <Switch
                              checked={selectedObject.castShadow}
                              onCheckedChange={(v) =>
                                updateObject(selectedObject.id, { castShadow: v })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Visible</Label>
                            <Switch
                              checked={selectedObject.visible}
                              onCheckedChange={(v) =>
                                updateObject(selectedObject.id, { visible: v })
                              }
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Cube className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select an object to edit properties</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Scene Tab */}
            <TabsContent value="scene" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <Accordion type="multiple" defaultValue={["environment", "lighting", "camera"]}>
                  <AccordionItem value="environment">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <Palette className="w-4 h-4" /> Environment
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <Select value={environment} onValueChange={setEnvironment}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ENVIRONMENT_PRESETS.map((e) => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Show Grid</Label>
                          <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Shadows</Label>
                          <Switch checked={showShadows} onCheckedChange={setShowShadows} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="lighting">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <Sun className="w-4 h-4" /> Lighting
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs">Ambient: {ambientIntensity.toFixed(1)}</Label>
                          <Slider
                            value={[ambientIntensity]}
                            min={0}
                            max={2}
                            step={0.1}
                            onValueChange={([v]) => setAmbientIntensity(v)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Directional: {directionalIntensity.toFixed(1)}</Label>
                          <Slider
                            value={[directionalIntensity]}
                            min={0}
                            max={3}
                            step={0.1}
                            onValueChange={([v]) => setDirectionalIntensity(v)}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="camera">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <Camera className="w-4 h-4" /> Camera
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs">FOV: {fov}°</Label>
                          <Slider
                            value={[fov]}
                            min={30}
                            max={120}
                            step={1}
                            onValueChange={([v]) => setFov(v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Auto Rotate</Label>
                          <Switch checked={autoRotate} onCheckedChange={setAutoRotate} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Separator className="my-4" />

                <Button className="w-full" variant="outline" onClick={captureScreenshot}>
                  <Export className="w-4 h-4 mr-2" /> Export Screenshot
                </Button>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </TooltipProvider>
  );
}

function createGeometry(type: SceneObject["type"]): THREE.BufferGeometry {
  switch (type) {
    case "box":
      return new THREE.BoxGeometry(1, 1, 1);
    case "sphere":
      return new THREE.SphereGeometry(0.5, 32, 32);
    case "cylinder":
      return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    case "cone":
      return new THREE.ConeGeometry(0.5, 1, 32);
    case "torus":
      return new THREE.TorusGeometry(0.5, 0.2, 16, 32);
    case "dodecahedron":
      return new THREE.DodecahedronGeometry(0.6);
  }
}

function createMaterial(type: SceneObject["material"], color: string): THREE.Material {
  const c = new THREE.Color(color);
  switch (type) {
    case "standard":
      return new THREE.MeshStandardMaterial({ color: c, metalness: 0.3, roughness: 0.4 });
    case "phong":
      return new THREE.MeshPhongMaterial({ color: c, shininess: 80 });
    case "lambert":
      return new THREE.MeshLambertMaterial({ color: c });
    case "wireframe":
      return new THREE.MeshBasicMaterial({ color: c, wireframe: true });
    case "glass":
      return new THREE.MeshPhysicalMaterial({
        color: c,
        metalness: 0,
        roughness: 0,
        transmission: 0.9,
        thickness: 0.5,
        ior: 1.5,
      });
    case "metal":
      return new THREE.MeshStandardMaterial({ color: c, metalness: 1, roughness: 0.1 });
  }
}
