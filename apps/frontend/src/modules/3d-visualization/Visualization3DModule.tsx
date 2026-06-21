import { useState, useRef } from "react";
import { HolographicCanvas } from "./HolographicCanvas";
import type { HolographicCanvasRef } from "./HolographicCanvas";
import { Card } from "@/shared/ui/card";
import { Slider } from "@/shared/ui/slider";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Cube,
  CircleDashed,
  Lightning,
  Sparkle,
  Palette,
  Camera,
} from "@phosphor-icons/react";

const OBJECTS = [
  { id: "cube", label: "Cube", icon: Cube },
  { id: "sphere", label: "Sphere", icon: CircleDashed },
  { id: "octahedron", label: "Octahedron", icon: Lightning },
  { id: "dodecahedron", label: "Dodecahedron", icon: Sparkle },
];

const COLOR_PRESETS = [
  { id: "cyan-magenta", name: "Cyan/Magenta", primary: "#00d9ff", secondary: "#ff00ff" },
  { id: "neon-green", name: "Neon Green", primary: "#00ff41", secondary: "#ffff00" },
  { id: "deep-purple", name: "Deep Purple", primary: "#9d00ff", secondary: "#ff006e" },
  { id: "ice-blue", name: "Ice Blue", primary: "#00ffff", secondary: "#0099ff" },
];

/**
 * 3D Visualization module controller.
 * Adapted from graphic-3d-v App.tsx state management as a module-level controller.
 */
export default function Visualization3DModule() {
  const canvasRef = useRef<HolographicCanvasRef>(null);
  const [selectedObject, setSelectedObject] = useState("cube");
  const [speed, setSpeed] = useState(1);
  const [scale, setScale] = useState(1);
  const [wireframe, setWireframe] = useState(true);
  const [glow, setGlow] = useState(0.5);
  const [selectedColors, setSelectedColors] = useState("cyan-magenta");
  const [particleCount, setParticleCount] = useState(200);

  return (
    <div className="flex h-full">
      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <HolographicCanvas
          ref={canvasRef}
          objectType={selectedObject}
          rotationSpeed={speed}
          scale={scale}
          showWireframe={wireframe}
          glowIntensity={glow}
          primaryColor={COLOR_PRESETS.find((p) => p.id === selectedColors)?.primary || "#00d9ff"}
          secondaryColor={COLOR_PRESETS.find((p) => p.id === selectedColors)?.secondary || "#ff00ff"}
          enableCameraControls={true}
          animationMode="standard"
          isPaused={false}
          particleDensity={particleCount}
        />

        {/* Floating info */}
        <div className="absolute top-4 left-4">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            {selectedObject} &middot; {particleCount} particles
          </Badge>
        </div>
      </div>

      {/* Controls Sidebar */}
      <aside className="w-80 border-l border-border/50 bg-card/30 backdrop-blur-sm overflow-y-auto p-4">
        <Tabs defaultValue="scene">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="scene" className="gap-1 text-xs">
              <Cube className="w-3 h-3" />
              Scene
            </TabsTrigger>
            <TabsTrigger value="style" className="gap-1 text-xs">
              <Palette className="w-3 h-3" />
              Style
            </TabsTrigger>
            <TabsTrigger value="camera" className="gap-1 text-xs">
              <Camera className="w-3 h-3" />
              Camera
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scene" className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Object
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {OBJECTS.map((obj) => (
                  <Button
                    key={obj.id}
                    variant={selectedObject === obj.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedObject(obj.id)}
                    className="gap-1 text-xs"
                  >
                    <obj.icon className="w-3 h-3" />
                    {obj.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Speed: {speed.toFixed(1)}x
              </Label>
              <Slider
                value={[speed]}
                onValueChange={([v]) => setSpeed(v)}
                min={0}
                max={3}
                step={0.1}
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Scale: {scale.toFixed(1)}x
              </Label>
              <Slider
                value={[scale]}
                onValueChange={([v]) => setScale(v)}
                min={0.5}
                max={3}
                step={0.1}
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Particles: {particleCount}
              </Label>
              <Slider
                value={[particleCount]}
                onValueChange={([v]) => setParticleCount(v)}
                min={0}
                max={1000}
                step={50}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Wireframe</Label>
              <Switch checked={wireframe} onCheckedChange={setWireframe} />
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Color Preset
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    variant={selectedColors === preset.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedColors(preset.id)}
                    className="text-xs"
                  >
                    <div
                      className="w-3 h-3 rounded-full mr-1"
                      style={{
                        background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})`,
                      }}
                    />
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Glow Intensity: {glow.toFixed(1)}
              </Label>
              <Slider
                value={[glow]}
                onValueChange={([v]) => setGlow(v)}
                min={0}
                max={1}
                step={0.1}
              />
            </div>
          </TabsContent>

          <TabsContent value="camera" className="space-y-4">
            <Card className="p-3 bg-muted/30">
              <p className="text-xs text-muted-foreground">
                Camera controls are available via mouse interaction on the 3D
                canvas. Use scroll to zoom, drag to rotate, right-click drag to
                pan.
              </p>
            </Card>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => canvasRef.current?.resetCamera?.()}
            >
              <Camera className="w-4 h-4 mr-2" />
              Reset Camera
            </Button>
          </TabsContent>
        </Tabs>
      </aside>
    </div>
  );
}
