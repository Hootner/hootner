// Video Domain Model
export class Video {
  constructor({
    id,
    userId,
    tenantId,
    title,
    description,
    url,
    thumbnailUrl,
    duration,
    size,
    format,
    resolution,
    visibility = 'public',
    category,
    tags = [],
    viewCount = 0,
    likeCount = 0,
    commentCount = 0,
    status = 'processing',
    metadata = {},
    createdAt,
    updatedAt,
    publishedAt
  }) {
    this.id = id;
    this.userId = userId;
    this.tenantId = tenantId;
    this.title = title;
    this.description = description;
    this.url = url;
    this.thumbnailUrl = thumbnailUrl;
    this.duration = duration;
    this.size = size;
    this.format = format;
    this.resolution = resolution;
    this.visibility = visibility;
    this.category = category;
    this.tags = tags;
    this.viewCount = viewCount;
    this.likeCount = likeCount;
    this.commentCount = commentCount;
    this.status = status;
    this.metadata = metadata;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
    this.publishedAt = publishedAt;
  }

  // Business methods
  isPublished() {
    return this.status === 'published' && this.publishedAt;
  }

  isPublic() {
    return this.visibility === 'public';
  }

  canBeViewedBy(user) {
    if (this.visibility === 'public') return true;
    if (this.visibility === 'private') return user?.id === this.userId;
    if (this.visibility === 'unlisted') return true; // Anyone with link
    return false;
  }

  incrementViews() {
    this.viewCount += 1;
    this.updatedAt = new Date().toISOString();
  }

  incrementLikes() {
    this.likeCount += 1;
    this.updatedAt = new Date().toISOString();
  }

  decrementLikes() {
    this.likeCount = Math.max(0, this.likeCount - 1);
    this.updatedAt = new Date().toISOString();
  }

  publish() {
    this.status = 'published';
    this.publishedAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  getDurationFormatted() {
    const hours = Math.floor(this.duration / 3600);
    const minutes = Math.floor((this.duration % 3600) / 60);
    const seconds = this.duration % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  toJSON() {
    return { ...this };
  }
}

export default Video;
