import { useState } from "react";
import {
  Sparkle,
  MagicWand,
  Brain,
  Lightning,
  Image as ImageIcon,
  Download,
  Gear,
  Trash,
  ArrowClockwise,
  Copy,
  CloudArrowUp,
} from "@phosphor-icons/react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Slider } from "@/shared/ui/slider";
import { Label } from "@/shared/ui/label";
import { Progress } from "@/shared/ui/progress";
import { Badge } from "@/shared/ui/badge";
import { toast } from "sonner";
import {
  useBedrockSDXL,
  type SDXLGenerationParams,
} from "@/shared/hooks/useBedrockSDXL";

const STYLE_OPTIONS = [
  { value: "cinematic", label: "Cinematic", emoji: "🎬" },
  { value: "photorealistic", label: "Photorealistic", emoji: "📷" },
  { value: "anime", label: "Anime", emoji: "🎨" },
  { value: "fantasy", label: "Fantasy", emoji: "✨" },
  { value: "abstract", label: "Abstract", emoji: "🌈" },
  { value: "3d-render", label: "3D Render", emoji: "🧊" },
  { value: "digital-art", label: "Digital Art", emoji: "🖌️" },
  { value: "neon-punk", label: "Neon Punk", emoji: "💜" },
] as const;

const RESOLUTION_PRESETS = [
  { value: "512x512", label: "512×512 (Fast)", w: 512, h: 512 },
  { value: "768x768", label: "768×768 (Balanced)", w: 768, h: 768 },
  { value: "1024x1024", label: "1024×1024 (HD)", w: 1024, h: 1024 },
  { value: "1024x576", label: "1024×576 (Landscape)", w: 1024, h: 576 },
  { value: "576x1024", label: "576×1024 (Portrait)", w: 576, h: 1024 },
  { value: "1344x768", label: "1344×768 (Cinematic)", w: 1344, h: 768 },
];

export function AIGeneratorPage() {
  const { generate, generations, isGenerating, clearHistory } =
    useBedrockSDXL();

  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] =
    useState<SDXLGenerationParams["style"]>("cinematic");
  const [resolution, setResolution] = useState("1024x1024");
  const [steps, setSteps] = useState([50]);
  const [cfgScale, setCfgScale] = useState([7.5]);
  const [seed, setSeed] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Enter a prompt to generate");
      return;
    }

    const res = RESOLUTION_PRESETS.find((r) => r.value === resolution);
    const params: SDXLGenerationParams = {
      prompt,
      negativePrompt: negativePrompt || undefined,
      width: res?.w ?? 1024,
      height: res?.h ?? 1024,
      steps: steps[0],
      cfgScale: cfgScale[0],
      seed: seed ? parseInt(seed) : undefined,
      style,
    };

    toast.loading("Bedrock SDXL generating...", { id: "sdxl-gen" });

    try {
      await generate(params);
      toast.success("Generation complete!", { id: "sdxl-gen" });
    } catch {
      toast.error("Generation failed", { id: "sdxl-gen" });
    }
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 2147483647).toString());
  };

  const completedGenerations = generations.filter(
    (g) => g.status === "complete"
  );
  const activeGeneration = generations.find((g) => g.status === "generating");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Brain weight="fill" className="w-7 h-7 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                AI Video & Image Generator
              </h1>
              <p className="text-muted-foreground">
                Powered by AWS Bedrock Stable Diffusion XL
              </p>
            </div>
          </div>
        </div>
        <Badge className="px-4 py-2 text-sm bg-gradient-to-r from-accent/20 to-primary/20 border-accent/40">
          <CloudArrowUp weight="fill" className="w-4 h-4 mr-2" />
          Bedrock SDXL 1.0
        </Badge>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Generator Form */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MagicWand weight="fill" className="w-5 h-5 text-accent" />
              Generate with Stable Diffusion XL
            </CardTitle>
            <CardDescription>
              Describe your vision — SDXL renders photorealistic and artistic
              imagery at 1024×1024 native resolution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-base font-medium">
                Prompt *
              </Label>
              <Textarea
                id="prompt"
                placeholder="A cinematic aerial shot of a futuristic cyberpunk city at golden hour, flying vehicles, neon hologram billboards, volumetric fog..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-28 text-base"
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground">
                Be specific about composition, lighting, materials, and
                atmosphere
              </p>
            </div>

            {/* Negative Prompt */}
            <div className="space-y-2">
              <Label
                htmlFor="neg-prompt"
                className="text-base font-medium"
              >
                Negative Prompt
              </Label>
              <Input
                id="neg-prompt"
                placeholder="low quality, blurry, distorted, watermark, text, deformed..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            {/* Style + Resolution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Visual Style</Label>
                <Select
                  value={style}
                  onValueChange={(v) =>
                    setStyle(v as SDXLGenerationParams["style"])
                  }
                  disabled={isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLE_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.emoji} {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium">Resolution</Label>
                <Select
                  value={resolution}
                  onValueChange={setResolution}
                  disabled={isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOLUTION_PRESETS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 space-y-5">
              <div className="flex items-center gap-2">
                <Gear weight="fill" className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Advanced Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm">
                    Inference Steps: {steps[0]}
                  </Label>
                  <Slider
                    value={steps}
                    onValueChange={setSteps}
                    min={20}
                    max={100}
                    step={5}
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-muted-foreground">
                    More steps = higher quality, slower
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">
                    CFG Scale: {cfgScale[0].toFixed(1)}
                  </Label>
                  <Slider
                    value={cfgScale}
                    onValueChange={setCfgScale}
                    min={1}
                    max={20}
                    step={0.5}
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher = more prompt adherence
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-2">
                  <Label className="text-sm">Seed (optional)</Label>
                  <Input
                    placeholder="Random"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    disabled={isGenerating}
                    type="number"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRandomSeed}
                  disabled={isGenerating}
                  className="mt-6"
                  title="Random seed"
                >
                  <ArrowClockwise className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full h-12 text-base bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 mr-2 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Generating with Bedrock SDXL...
                </>
              ) : (
                <>
                  <Sparkle weight="fill" className="w-5 h-5 mr-2" />
                  Generate Image
                </>
              )}
            </Button>

            {/* Active Generation Progress */}
            {activeGeneration && (
              <div className="p-4 rounded-lg border border-accent/30 bg-accent/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-sm font-medium">
                      Rendering with SDXL...
                    </span>
                  </div>
                  <span className="text-sm font-mono">
                    {activeGeneration.progress}%
                  </span>
                </div>
                <Progress value={activeGeneration.progress} className="h-2" />
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {activeGeneration.prompt}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightning weight="fill" className="w-5 h-5 text-accent" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
                <span className="text-sm font-medium">Generated</span>
                <span className="text-lg font-bold">
                  {completedGenerations.length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                <span className="text-sm font-medium">Model</span>
                <span className="text-sm font-bold">SDXL 1.0</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Provider</span>
                <span className="text-sm font-bold">AWS Bedrock</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/20 to-accent/10 border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain weight="fill" className="w-5 h-5 text-accent" />
                Bedrock SDXL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Sparkle weight="fill" className="w-4 h-4 text-accent mt-0.5" />
                <span>1024×1024 native resolution</span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkle weight="fill" className="w-4 h-4 text-accent mt-0.5" />
                <span>Photorealistic + artistic styles</span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkle weight="fill" className="w-4 h-4 text-accent mt-0.5" />
                <span>Negative prompts for exclusion</span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkle weight="fill" className="w-4 h-4 text-accent mt-0.5" />
                <span>Reproducible seeds</span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkle weight="fill" className="w-4 h-4 text-accent mt-0.5" />
                <span>CFG guidance control</span>
              </div>
            </CardContent>
          </Card>

          {completedGenerations.length > 0 && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={clearHistory}
            >
              <Trash className="w-4 h-4" />
              Clear History
            </Button>
          )}
        </div>
      </div>

      {/* Generated Gallery */}
      {completedGenerations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon weight="fill" className="w-5 h-5 text-accent" />
              Generated Gallery
            </CardTitle>
            <CardDescription>
              {completedGenerations.length} image
              {completedGenerations.length !== 1 ? "s" : ""} generated this
              session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedGenerations.map((gen) => (
                <div
                  key={gen.id}
                  className="group relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:shadow-xl"
                >
                  <img
                    src={gen.imageUrl}
                    alt={gen.prompt}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                      <p className="text-white text-sm line-clamp-2">
                        {gen.prompt}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-white/20 text-white border-0"
                        >
                          {gen.style}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-white/20 text-white border-0"
                        >
                          {gen.width}×{gen.height}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-white/20 text-white border-0 font-mono"
                        >
                          seed:{gen.seed}
                        </Badge>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-1.5 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(gen.prompt);
                            toast.success("Prompt copied");
                          }}
                        >
                          <Copy className="w-3 h-3" />
                          Prompt
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-1.5 text-xs"
                          asChild
                        >
                          <a
                            href={gen.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-3 h-3" />
                            Open
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
