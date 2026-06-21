export type VideoQuality = '480p' | '720p' | '1080p' | '4K' | '8K' | '10K UHD';
export type AudioFormat = 'Stereo' | '5.1 Surround' | '7.1 Surround' | 'Dolby Atmos';
export type ColorSpace = 'SDR' | 'HDR10' | 'HDR10+' | 'Dolby Vision';

export interface VideoQualitySettings {
  resolution: VideoQuality;
  audioFormat: AudioFormat;
  colorSpace: ColorSpace;
  bitrate: number;
  fps: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  duration: number;
  uploadDate: string;
  views: number;
  size: number;
  status: 'processing' | 'ready' | 'failed';
  uploadedBy?: string;
  quality?: VideoQualitySettings;
  aiInsights?: {
    tags: string[];
    summary: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    scenes?: SceneDetection[];
    objects?: ObjectDetection[];
    transcription?: string;
    emotions?: EmotionAnalysis;
  };
  isAIGenerated?: boolean;
  aiPrompt?: string;
  collectionIds?: string[];
  hasHDR?: boolean;
  hasDolbyAtmos?: boolean;
  genre?: string;
  metadata?: Record<string, unknown>;
}

export interface SceneDetection {
  timestamp: number;
  description: string;
  confidence: number;
}

export interface ObjectDetection {
  name: string;
  confidence: number;
  count: number;
  timestamps: number[];
}

export interface EmotionAnalysis {
  dominant: string;
  breakdown: {
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    neutral: number;
  };
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  videoIds: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AnalyticsData {
  totalVideos: number;
  totalViews: number;
  totalDuration: number;
  avgEngagement: number;
  viewsOverTime: { date: string; views: number }[];
  topVideos: { title: string; views: number }[];
}

export interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  loginTime: string;
  avatar?: string;
}

export interface HologramProject {
  id: string;
  name: string;
  object: string;
  speed: number;
  scale: number;
  wireframe: boolean;
  glow: number;
  colors: string;
  animation: string;
  particleCount: number;
  environmentPreset: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
