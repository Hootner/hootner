// Video View Model
export class VideoViewModel {
  constructor(video) {
    this.id = video.id;
    this.title = video.title;
    this.description = video.description;
    this.url = video.url;
    this.thumbnailUrl = video.thumbnailUrl;
    this.duration = video.duration;
    this.views = video.views || 0;
    this.likes = video.likes || 0;
    this.category = video.category;
    this.status = video.status;
    this.author = video.author;
    this.commentCount = video.commentCount || 0;
    this.createdAt = video.createdAt;
    this.updatedAt = video.updatedAt;
  }

  get isPublished() {
    return this.status === 'published';
  }

  get isDraft() {
    return this.status === 'draft';
  }

  get isProcessing() {
    return this.status === 'processing';
  }

  canBeEditedBy(userId) {
    return this.author.id === userId;
  }

  canBeDeletedBy(userId, userRole) {
    return this.author.id === userId || userRole === 'admin';
  }

  incrementViews() {
    this.views++;
  }

  incrementLikes() {
    this.likes++;
  }

  decrementLikes() {
    if (this.likes > 0) this.likes--;
  }
}

export default VideoViewModel;
