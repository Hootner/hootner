// User Domain Model
export class User {
  constructor({
    id,
    email,
    username,
    firstName,
    lastName,
    passwordHash,
    role = 'user',
    tenantId,
    profileImage,
    bio,
    isVerified = false,
    isActive = true,
    settings = {},
    metadata = {},
    createdAt,
    updatedAt,
    lastLoginAt
  }) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
    this.passwordHash = passwordHash;
    this.role = role;
    this.tenantId = tenantId;
    this.profileImage = profileImage;
    this.bio = bio;
    this.isVerified = isVerified;
    this.isActive = isActive;
    this.settings = settings;
    this.metadata = metadata;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
    this.lastLoginAt = lastLoginAt;
  }

  // Business methods
  getFullName() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username;
  }

  hasRole(role) {
    return this.role === role;
  }

  isAdmin() {
    return ['admin', 'super_admin'].includes(this.role);
  }

  canUploadVideo() {
    return this.isVerified && this.isActive;
  }

  updateLastLogin() {
    this.lastLoginAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    const { passwordHash, ...user } = this;
    return user;
  }

  toPublicProfile() {
    return {
      id: this.id,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      profileImage: this.profileImage,
      bio: this.bio,
      createdAt: this.createdAt
    };
  }
}

export default User;
