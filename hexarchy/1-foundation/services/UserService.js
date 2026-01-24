// User Service
import UserRepository from '../repositories/UserRepository.js';
import { hash, compareHash } from '../../0-core/utils/crypto.js';
import { AuthError } from '../../0-core/errors/custom-errors.js';
import { auditLog, AUDIT_EVENTS } from '../../0-core/audit/logger.js';

export class UserService {
  constructor() {
    this.repository = new UserRepository();
  }

  async createUser(userData, ipAddress, userAgent) {
    // Hash password
    const passwordHash = await hash(userData.password);

    // Create user
    const user = await this.repository.create({
      ...userData,
      passwordHash,
      password: undefined
    });

    // Audit log
    await auditLog({
      event: AUDIT_EVENTS.USER_CREATED,
      userId: user.id,
      resourceType: 'user',
      resourceId: user.id,
      action: 'create',
      ipAddress,
      userAgent
    });

    return user;
  }

  async getUserById(id) {
    return await this.repository.findById(id);
  }

  async getUserByEmail(email) {
    return await this.repository.findByEmail(email);
  }

  async getUserByUsername(username) {
    return await this.repository.findByUsername(username);
  }

  async updateUser(id, updates, userId, ipAddress, userAgent) {
    const user = await this.repository.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    await auditLog({
      event: AUDIT_EVENTS.USER_UPDATED,
      userId,
      resourceType: 'user',
      resourceId: id,
      action: 'update',
      ipAddress,
      userAgent,
      metadata: { updates }
    });

    return user;
  }

  async deleteUser(id, userId, ipAddress, userAgent) {
    await this.repository.delete(id);

    await auditLog({
      event: AUDIT_EVENTS.USER_DELETED,
      userId,
      resourceType: 'user',
      resourceId: id,
      action: 'delete',
      ipAddress,
      userAgent
    });

    return true;
  }

  async verifyUser(id) {
    return await this.repository.verify(id);
  }

  async activateUser(id) {
    return await this.repository.activate(id);
  }

  async deactivateUser(id) {
    return await this.repository.deactivate(id);
  }

  async verifyPassword(user, password) {
    return await compareHash(password, user.passwordHash);
  }

  async changePassword(id, oldPassword, newPassword, ipAddress, userAgent) {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new AuthError('User not found');
    }

    const isValid = await this.verifyPassword(user, oldPassword);
    if (!isValid) {
      throw new AuthError('Invalid password');
    }

    const passwordHash = await hash(newPassword);
    await this.repository.update(id, { passwordHash, updatedAt: new Date().toISOString() });

    await auditLog({
      event: AUDIT_EVENTS.PASSWORD_CHANGED,
      userId: id,
      resourceType: 'user',
      resourceId: id,
      action: 'password_change',
      ipAddress,
      userAgent
    });

    return true;
  }
}

export default UserService;
