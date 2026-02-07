// Comment Domain Model
export class Comment {
  constructor({
    id,
    videoId,
    userId,
    parentId = null,
    text,
    likeCount = 0,
    replyCount = 0,
    isEdited = false,
    isPinned = false,
    isDeleted = false,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.videoId = videoId;
    this.userId = userId;
    this.parentId = parentId;
    this.text = text;
    this.likeCount = likeCount;
    this.replyCount = replyCount;
    this.isEdited = isEdited;
    this.isPinned = isPinned;
    this.isDeleted = isDeleted;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }

  // Business methods
  isReply() {
    return this.parentId !== null;
  }

  canBeEditedBy(user) {
    return user?.id === this.userId && !this.isDeleted;
  }

  canBeDeletedBy(user) {
    return user?.id === this.userId || user?.isAdmin();
  }

  edit(newText) {
    this.text = newText;
    this.isEdited = true;
    this.updatedAt = new Date().toISOString();
  }

  delete() {
    this.isDeleted = true;
    this.text = '[Deleted]';
    this.updatedAt = new Date().toISOString();
  }

  pin() {
    this.isPinned = true;
    this.updatedAt = new Date().toISOString();
  }

  unpin() {
    this.isPinned = false;
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

  toJSON() {
    return { ...this };
  }
}

export default Comment;
