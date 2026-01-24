// Comment View Model
export class CommentViewModel {
  constructor(comment) {
    this.id = comment.id;
    this.text = comment.text;
    this.videoId = comment.videoId;
    this.userId = comment.userId;
    this.author = comment.author;
    this.parentId = comment.parentId;
    this.likes = comment.likes || 0;
    this.isPinned = comment.isPinned || false;
    this.replyCount = comment.replyCount || 0;
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
  }

  get isReply() {
    return !!this.parentId;
  }

  get isTopLevel() {
    return !this.parentId;
  }

  canBeEditedBy(userId) {
    return this.userId === userId;
  }

  canBeDeletedBy(userId, userRole) {
    return this.userId === userId || userRole === 'admin' || userRole === 'moderator';
  }

  canBePinnedBy(userId, videoOwnerId) {
    return userId === videoOwnerId;
  }

  incrementLikes() {
    this.likes++;
  }

  decrementLikes() {
    if (this.likes > 0) this.likes--;
  }

  pin() {
    this.isPinned = true;
  }

  unpin() {
    this.isPinned = false;
  }
}

export default CommentViewModel;
