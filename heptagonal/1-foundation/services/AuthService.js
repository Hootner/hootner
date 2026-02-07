// Auth Service
import UserService from './UserService.js';
import { generateToken, verifyToken } from '../../0-core/auth/jwt.js';
import { AuthError } from '../../0-core/errors/custom-errors.js';
import { auditLog, AUDIT_EVENTS } from '../../0-core/audit/logger.js';

export class AuthService {
  constructor() {
    this.userService = new UserService();
  }

  async register(userData, ipAddress, userAgent) {
    // Check if user exists
    const existingEmail = await this.userService.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new AuthError('Email already in use');
    }

    const existingUsername = await this.userService.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new AuthError('Username already taken');
    }

    // Create user
    const user = await this.userService.createUser(userData, ipAddress, userAgent);

    // Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return { user, token };
  }

  async login(email, password, ipAddress, userAgent) {
    // Find user
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new AuthError('Invalid credentials');
    }

    // Verify password
    const isValid = await this.userService.verifyPassword(user, password);
    if (!isValid) {
      throw new AuthError('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthError('Account is deactivated');
    }

    // Update last login
    await this.userService.repository.updateLastLogin(user.id);

    // Audit log
    await auditLog({
      event: AUDIT_EVENTS.USER_LOGIN,
      userId: user.id,
      resourceType: 'user',
      resourceId: user.id,
      action: 'login',
      ipAddress,
      userAgent
    });

    // Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return { user, token };
  }

  async logout(userId, ipAddress, userAgent) {
    await auditLog({
      event: AUDIT_EVENTS.USER_LOGOUT,
      userId,
      resourceType: 'user',
      resourceId: userId,
      action: 'logout',
      ipAddress,
      userAgent
    });

    return true;
  }

  async verifyToken(token) {
    try {
      const decoded = verifyToken(token);
      const user = await this.userService.getUserById(decoded.id);

      if (!user || !user.isActive) {
        throw new AuthError('Invalid token');
      }

      return user;
    } catch (error) {
      throw new AuthError('Invalid token');
    }
  }

  async refreshToken(token) {
    const user = await this.verifyToken(token);

    const newToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return { user, token: newToken };
  }

  async requestPasswordReset(email) {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return true;
    }

    // Generate reset token (in real app, send via email)
    const resetToken = generateToken({ id: user.id, type: 'reset' }, '1h');

    // TODO: Send email with reset link
    return { resetToken };
  }

  async resetPassword(resetToken, newPassword) {
    const decoded = verifyToken(resetToken);

    if (decoded.type !== 'reset') {
      throw new AuthError('Invalid reset token');
    }

    const passwordHash = await hash(newPassword);
    await this.userService.repository.update(decoded.id, {
      passwordHash,
      updatedAt: new Date().toISOString()
    });

    return true;
  }
}

export default AuthService;
