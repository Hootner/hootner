import type { Video } from "@/shared/lib/types";

const SAMPLE_TITLES = [
  "Urban Sunrise Timelapse",
  "Deep Ocean Exploration",
  "Mountain Peak Drone Shot",
  "Cinematic Street Photography",
  "Aurora Borealis in 8K",
  "Desert Storm Formation",
  "Tokyo Night Drive",
  "Underwater Coral Reef",
  "Volcanic Eruption Closeup",
  "Arctic Wildlife Documentary",
];

const SAMPLE_TAGS = [
  ["nature", "timelapse", "4K"],
  ["ocean", "wildlife", "documentary"],
  ["aerial", "mountains", "drone"],
  ["urban", "cinematic", "night"],
  ["astronomy", "8K", "HDR"],
  ["weather", "dramatic", "slow-motion"],
  ["city", "neon", "night-drive"],
  ["marine", "coral", "underwater"],
  ["geology", "dramatic", "closeup"],
  ["wildlife", "arctic", "nature"],
];

export function generateSampleVideos(count: number): Video[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `video-${i + 1}`,
    title: SAMPLE_TITLES[i % SAMPLE_TITLES.length],
    description: `High-quality ${SAMPLE_TITLES[i % SAMPLE_TITLES.length].toLowerCase()} content`,
    thumbnail: `https://picsum.photos/seed/${i}/640/360`,
    url: `https://storage.hootner.com/videos/sample-${i + 1}.mp4`,
    duration: Math.floor(Math.random() * 600) + 30,
    uploadDate: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    views: Math.floor(Math.random() * 100000),
    size: Math.floor(Math.random() * 5000000000),
    status: "ready" as const,
    uploadedBy: "platform",
    quality: {
      resolution: "4K" as const,
      audioFormat: "Dolby Atmos" as const,
      colorSpace: "HDR10" as const,
      bitrate: 50000,
      fps: 60,
    },
    aiInsights: {
      tags: SAMPLE_TAGS[i % SAMPLE_TAGS.length],
      summary: `AI-analyzed content featuring ${SAMPLE_TITLES[i % SAMPLE_TITLES.length].toLowerCase()}`,
      sentiment: "positive" as const,
    },
  }));
}
