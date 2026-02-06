// Activity Repository
import { BaseRepository } from './BaseRepository.js';
import { Activity } from '../models/Activity.js';

export class ActivityRepository extends BaseRepository {
  constructor() {
    super(process.env.ACTIVITIES_TABLE || 'Activities');
  }

  async create(activityData) {
    const activity = new Activity({
      id: `activity-${Date.now()}`,
      ...activityData
    });
    await super.create(activity);
    return activity;
  }

  async findById(id) {
    const data = await super.findById(id);
    return data ? new Activity(data) : null;
  }

  async findByUser(userId, limit = 100) {
    const results = await this.query(
      'userId = :userId',
      { ':userId': userId },
      { IndexName: 'UserIndex', Limit: limit, ScanIndexForward: false }
    );
    return results.map(data => new Activity(data));
  }

  async findByResource(resourceType, resourceId, limit = 100) {
    const results = await this.query(
      'resourceType = :resourceType AND resourceId = :resourceId',
      { ':resourceType': resourceType, ':resourceId': resourceId },
      { IndexName: 'ResourceIndex', Limit: limit, ScanIndexForward: false }
    );
    return results.map(data => new Activity(data));
  }

  async findByType(type, limit = 100) {
    const results = await this.query(
      '#type = :type',
      { ':type': type },
      {
        IndexName: 'TypeIndex',
        Limit: limit,
        ScanIndexForward: false,
        ExpressionAttributeNames: { '#type': 'type' }
      }
    );
    return results.map(data => new Activity(data));
  }

  async getRecentActivity(userId, limit = 50) {
    return await this.findByUser(userId, limit);
  }
}

export default ActivityRepository;
