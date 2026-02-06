// User Repository
import { BaseRepository } from './BaseRepository.js';
import { User } from '../models/User.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super(process.env.USERS_TABLE || 'Users');
  }

  async create(userData) {
    const user = new User({
      id: `user-${Date.now()}`,
      ...userData
    });
    await super.create(user);
    return user;
  }

  async findById(id) {
    const data = await super.findById(id);
    return data ? new User(data) : null;
  }

  async findByEmail(email) {
    const results = await this.query(
      'email = :email',
      { ':email': email },
      { IndexName: 'EmailIndex', Limit: 1 }
    );
    return results.length > 0 ? new User(results[0]) : null;
  }

  async findByUsername(username) {
    const results = await this.query(
      'username = :username',
      { ':username': username },
      { IndexName: 'UsernameIndex', Limit: 1 }
    );
    return results.length > 0 ? new User(results[0]) : null;
  }

  async findByTenant(tenantId, limit = 100) {
    const results = await this.query(
      'tenantId = :tenantId',
      { ':tenantId': tenantId },
      { IndexName: 'TenantIndex', Limit: limit }
    );
    return results.map(data => new User(data));
  }

  async updateLastLogin(id) {
    return await this.update(id, {
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async activate(id) {
    return await this.update(id, {
      isActive: true,
      updatedAt: new Date().toISOString()
    });
  }

  async deactivate(id) {
    return await this.update(id, {
      isActive: false,
      updatedAt: new Date().toISOString()
    });
  }

  async verify(id) {
    return await this.update(id, {
      isVerified: true,
      updatedAt: new Date().toISOString()
    });
  }
}

export default UserRepository;
