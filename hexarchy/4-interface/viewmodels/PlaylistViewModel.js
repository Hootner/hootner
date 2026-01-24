// Playlist View Model
export class PlaylistViewModel {
  constructor(playlist) {
    this.id = playlist.id;
    this.title = playlist.title;
    this.description = playlist.description;
    this.userId = playlist.userId;
    this.creator = playlist.creator;
    this.videoIds = playlist.videoIds || [];
    this.isPublic = playlist.isPublic !== false;
    this.thumbnail = playlist.thumbnail;
    this.createdAt = playlist.createdAt;
    this.updatedAt = playlist.updatedAt;
  }

  get videoCount() {
    return this.videoIds.length;
  }

  get isEmpty() {
    return this.videoCount === 0;
  }

  canBeEditedBy(userId) {
    return this.userId === userId;
  }

  canBeDeletedBy(userId, userRole) {
    return this.userId === userId || userRole === 'admin';
  }

  canBeViewedBy(userId) {
    return this.isPublic || this.userId === userId;
  }

  addVideo(videoId) {
    if (!this.videoIds.includes(videoId)) {
      this.videoIds.push(videoId);
    }
  }

  removeVideo(videoId) {
    const index = this.videoIds.indexOf(videoId);
    if (index > -1) {
      this.videoIds.splice(index, 1);
    }
  }

  reorderVideos(newOrder) {
    this.videoIds = newOrder;
  }

  toggleVisibility() {
    this.isPublic = !this.isPublic;
  }
}

export default PlaylistViewModel;
