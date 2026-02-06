// Playlist Domain Model
export class Playlist {
  constructor({
    id,
    userId,
    tenantId,
    title,
    description,
    visibility = 'public',
    thumbnailUrl,
    videoIds = [],
    videoCount = 0,
    totalDuration = 0,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.userId = userId;
    this.tenantId = tenantId;
    this.title = title;
    this.description = description;
    this.visibility = visibility;
    this.thumbnailUrl = thumbnailUrl;
    this.videoIds = videoIds;
    this.videoCount = videoCount;
    this.totalDuration = totalDuration;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }

  // Business methods
  addVideo(videoId, duration = 0) {
    if (!this.videoIds.includes(videoId)) {
      this.videoIds.push(videoId);
      this.videoCount += 1;
      this.totalDuration += duration;
      this.updatedAt = new Date().toISOString();
    }
  }

  removeVideo(videoId, duration = 0) {
    const index = this.videoIds.indexOf(videoId);
    if (index > -1) {
      this.videoIds.splice(index, 1);
      this.videoCount = Math.max(0, this.videoCount - 1);
      this.totalDuration = Math.max(0, this.totalDuration - duration);
      this.updatedAt = new Date().toISOString();
    }
  }

  reorderVideos(newOrder) {
    this.videoIds = newOrder;
    this.updatedAt = new Date().toISOString();
  }

  isPublic() {
    return this.visibility === 'public';
  }

  canBeViewedBy(user) {
    if (this.visibility === 'public') return true;
    if (this.visibility === 'private') return user?.id === this.userId;
    return false;
  }

  canBeEditedBy(user) {
    return user?.id === this.userId;
  }

  toJSON() {
    return { ...this };
  }
}

export default Playlist;
