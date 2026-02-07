// VideoMetadata Value Object
export class VideoMetadata {
  constructor({
    codec,
    bitrate,
    frameRate,
    aspectRatio,
    colorSpace,
    audioCodec,
    audioChannels,
    audioBitrate,
    hasSubtitles = false,
    subtitleLanguages = []
  }) {
    this.codec = codec;
    this.bitrate = bitrate;
    this.frameRate = frameRate;
    this.aspectRatio = aspectRatio;
    this.colorSpace = colorSpace;
    this.audioCodec = audioCodec;
    this.audioChannels = audioChannels;
    this.audioBitrate = audioBitrate;
    this.hasSubtitles = hasSubtitles;
    this.subtitleLanguages = subtitleLanguages;
    this.validate();
  }

  validate() {
    if (this.bitrate && this.bitrate < 0) {
      throw new Error('Bitrate must be positive');
    }

    if (this.frameRate && (this.frameRate < 1 || this.frameRate > 120)) {
      throw new Error('Frame rate must be between 1 and 120');
    }

    const validAspectRatios = ['16:9', '4:3', '21:9', '1:1'];
    if (this.aspectRatio && !validAspectRatios.includes(this.aspectRatio)) {
      throw new Error(`Invalid aspect ratio: ${this.aspectRatio}`);
    }
  }

  isHD() {
    return this.bitrate && this.bitrate >= 5000000; // 5 Mbps
  }

  is4K() {
    return this.bitrate && this.bitrate >= 20000000; // 20 Mbps
  }

  hasHDR() {
    return this.colorSpace && this.colorSpace.includes('HDR');
  }

  hasSurroundSound() {
    return this.audioChannels && this.audioChannels >= 6;
  }

  toJSON() {
    return { ...this };
  }
}

export default VideoMetadata;
