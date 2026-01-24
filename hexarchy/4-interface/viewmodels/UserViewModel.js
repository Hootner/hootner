// User View Model
export class UserViewModel {
  constructor(user) {
    this.id = user.id;
    this.email = user.email;
    this.username = user.username;
    this.displayName = user.displayName;
    this.avatar = user.avatar;
    this.bio = user.bio;
    this.role = user.role;
    this.verified = user.verified || false;
    this.followerCount = user.followerCount || 0;
    this.followingCount = user.followingCount || 0;
    this.isFollowing = user.isFollowing || false;
    this.createdAt = user.createdAt;
  }

  get isAdmin() {
    return this.role === 'admin';
  }

  get isModerator() {
    return this.role === 'moderator';
  }

  get displayNameOrUsername() {
    return this.displayName || this.username;
  }

  get avatarUrl() {
    return this.avatar || '/assets/default-avatar.jpg';
  }

  canModerateContent() {
    return this.isAdmin || this.isModerator;
  }

  canAccessAdminPanel() {
    return this.isAdmin;
  }
}

export default UserViewModel;
