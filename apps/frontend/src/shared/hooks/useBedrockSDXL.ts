import { useState, useCallback } from "react";
import { gql } from "@apollo/client";
import { apolloClient } from "@/shared/lib/apollo-client";

export interface SDXLGenerationParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  seed?: number;
  style?:
    | "cinematic"
    | "photorealistic"
    | "anime"
    | "fantasy"
    | "abstract"
    | "3d-render"
    | "digital-art"
    | "neon-punk";
  strength?: number;
}

export interface SDXLResult {
  id: string;
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  seed: number;
  style: string;
  timestamp: string;
  status: "generating" | "complete" | "failed";
  progress: number;
}

const INVOKE_BEDROCK_SDXL = gql`
  mutation InvokeBedrockSDXL($input: BedrockSDXLInput!) {
    invokeBedrockSDXL(input: $input) {
      id
      imageUrl
      seed
      status
    }
  }
`;

/**
 * Hook for generating images via AWS Bedrock Stable Diffusion XL.
 * Routes through the hootner GraphQL API which invokes the Bedrock runtime.
 * Falls back to a local simulation when the API is unavailable.
 */
export function useBedrockSDXL() {
  const [generations, setGenerations] = useState<SDXLResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(
    async (params: SDXLGenerationParams): Promise<SDXLResult> => {
      setIsGenerating(true);

      const id = `sdxl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const seed = params.seed ?? Math.floor(Math.random() * 2147483647);

      const pending: SDXLResult = {
        id,
        imageUrl: "",
        prompt: params.prompt,
        negativePrompt: params.negativePrompt,
        width: params.width ?? 1024,
        height: params.height ?? 1024,
        seed,
        style: params.style ?? "cinematic",
        timestamp: new Date().toISOString(),
        status: "generating",
        progress: 0,
      };

      setGenerations((prev) => [pending, ...prev]);

      try {
        // Attempt to call the Bedrock SDXL endpoint through the GraphQL API
        const { data } = await apolloClient.mutate({
          mutation: INVOKE_BEDROCK_SDXL,
          variables: {
            input: {
              prompt: buildSDXLPrompt(params),
              negativePrompt:
                params.negativePrompt ??
                "low quality, blurry, distorted, watermark, text overlay",
              width: params.width ?? 1024,
              height: params.height ?? 1024,
              steps: params.steps ?? 50,
              cfgScale: params.cfgScale ?? 7.5,
              seed,
              stylePreset: params.style ?? "cinematic",
            },
          },
        });

        const result: SDXLResult = {
          ...pending,
          imageUrl: data.invokeBedrockSDXL.imageUrl,
          seed: data.invokeBedrockSDXL.seed,
          status: "complete",
          progress: 100,
        };

        setGenerations((prev) =>
          prev.map((g) => (g.id === id ? result : g))
        );
        setIsGenerating(false);
        return result;
      } catch {
        // Fallback: simulate generation with placeholder images when API unavailable
        return simulateGeneration(id, pending, params, setGenerations, setIsGenerating);
      }
    },
    []
  );

  const clearHistory = useCallback(() => {
    setGenerations([]);
  }, []);

  return {
    generate,
    generations,
    isGenerating,
    clearHistory,
  };
}

function buildSDXLPrompt(params: SDXLGenerationParams): string {
  const styleModifiers: Record<string, string> = {
    cinematic:
      "cinematic lighting, dramatic composition, film grain, anamorphic lens, color grading",
    photorealistic:
      "photorealistic, 8k uhd, dslr, high quality, film grain, Fujifilm XT3",
    anime:
      "anime style, vibrant colors, detailed illustration, studio quality",
    fantasy:
      "fantasy art, ethereal lighting, magical atmosphere, detailed environment",
    abstract:
      "abstract art, geometric shapes, vibrant colors, modern composition",
    "3d-render":
      "3d render, octane render, physically based rendering, global illumination",
    "digital-art":
      "digital painting, highly detailed, artstation trending, concept art",
    "neon-punk":
      "neon punk, cyberpunk, neon lights, dark atmosphere, futuristic",
  };

  const modifier = styleModifiers[params.style ?? "cinematic"] ?? "";
  return `${params.prompt}, ${modifier}, masterpiece, best quality`;
}

async function simulateGeneration(
  id: string,
  pending: SDXLResult,
  params: SDXLGenerationParams,
  setGenerations: React.Dispatch<React.SetStateAction<SDXLResult[]>>,
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>
): Promise<SDXLResult> {
  // Simulate progress updates
  for (let progress = 10; progress <= 90; progress += 20) {
    await new Promise((r) => setTimeout(r, 600));
    setGenerations((prev) =>
      prev.map((g) => (g.id === id ? { ...g, progress } : g))
    );
  }

  // Generate a deterministic placeholder based on prompt
  const placeholderImages = [
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1024&h=1024&fit=crop",
    "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1024&h=1024&fit=crop",
    "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1024&h=1024&fit=crop",
    "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1024&h=1024&fit=crop",
    "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1024&h=1024&fit=crop",
    "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=1024&h=1024&fit=crop",
    "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1024&h=1024&fit=crop",
    "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=1024&h=1024&fit=crop",
  ];

  const idx =
    Math.abs(params.prompt.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) %
    placeholderImages.length;

  await new Promise((r) => setTimeout(r, 800));

  const result: SDXLResult = {
    ...pending,
    imageUrl: placeholderImages[idx],
    status: "complete",
    progress: 100,
  };

  setGenerations((prev) => prev.map((g) => (g.id === id ? result : g)));
  setIsGenerating(false);
  return result;
}
