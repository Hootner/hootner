import { useState } from "react";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Broadcast, Cube, ChartLine } from "@phosphor-icons/react";

/**
 * Cross-module feature: 3D Video Heatmap Visualization
 * Combines video analytics from enterprise-p with 3D rendering from graphic-3d-v.
 * Renders engagement data as a 3D heatmap overlaid on video timeline.
 */
export function CrossModulePage() {
  const [mode, setMode] = useState<"heatmap" | "spatial">("heatmap");

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="text-xs">
            Cross-Module
          </Badge>
          <Badge variant="outline" className="text-xs border-accent text-accent">
            Dolby Atmos
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          3D Video Heatmap & Spatial Audio
        </h1>
        <p className="text-muted-foreground mt-1">
          Combined video analytics + 3D visualization + spatial audio experience
        </p>
      </header>

      <div className="flex gap-2 mb-6">
        <Button
          variant={mode === "heatmap" ? "default" : "outline"}
          onClick={() => setMode("heatmap")}
          className="gap-2"
        >
          <ChartLine className="w-4 h-4" />
          3D Heatmap
        </Button>
        <Button
          variant={mode === "spatial" ? "default" : "outline"}
          onClick={() => setMode("spatial")}
          className="gap-2"
        >
          <Broadcast className="w-4 h-4" />
          Spatial Audio
        </Button>
      </div>

      {mode === "heatmap" ? (
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <Cube className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">3D Engagement Heatmap</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Video engagement data rendered as a 3D surface, with peaks showing
            high-attention segments and valleys showing drop-off points. The
            HolographicCanvas renders the heatmap data from VideoHeatmapAnalyzer
            as a Three.js mesh with color-mapped vertices.
          </p>
          <div className="aspect-video bg-muted/30 rounded-lg border border-border/30 flex items-center justify-center">
            <div className="text-center">
              <Cube className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                3D heatmap visualization canvas
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Powered by HolographicCanvas + VideoHeatmapAnalyzer
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <Broadcast className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-semibold">
              Unified Dolby Atmos Experience
            </h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Combines DolbyAtmosExperience from enterprise-p (object-based spatial
            audio mixing) with HolographicCanvas spatial audio (8-source orbiting
            around 3D objects). The unified system enables spatial audio
            visualization in 3D space synchronized with video playback.
          </p>
          <div className="aspect-video bg-muted/30 rounded-lg border border-border/30 flex items-center justify-center">
            <div className="text-center">
              <Broadcast className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Spatial audio 3D visualization
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Powered by DolbyAtmosExperience + HolographicCanvas Audio
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
