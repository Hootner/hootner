/**
 * Audit Service
 * Business logic for audit logging
 */

import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateAuditLogDto } from "./dto/create-audit-log.dto";
import { QueryAuditLogsDto } from "./dto/query-audit-logs.dto";
import {
  AuditLog,
  AuditLogDocument,
  AuditResource,
} from "./schemas/audit-log.schema";

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>
  ) {}

  /**
   * Create a new audit log entry
   */
  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const auditLog = new this.auditLogModel({
        ...createAuditLogDto,
        timestamp: new Date(),
      });

      const savedLog = await auditLog.save();

      this.logger.log(
        `Audit log created: ${savedLog.action} on ${savedLog.resource} by ${savedLog.username}`
      );

      return savedLog;
    } catch (error) {
      this.logger.error(
        `Failed to create audit log: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Create multiple audit logs in bulk
   */
  async createBulk(logs: CreateAuditLogDto[]): Promise<AuditLog[]> {
    try {
      const auditLogs = logs.map((log) => ({
        ...log,
        timestamp: new Date(),
      }));

      const savedLogs = await this.auditLogModel.insertMany(auditLogs);

      this.logger.log(`Created ${savedLogs.length} audit logs in bulk`);

      return savedLogs;
    } catch (error) {
      this.logger.error(
        `Failed to create bulk audit logs: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Find audit logs with filters and pagination
   */
  async findAll(queryDto: QueryAuditLogsDto) {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = "timestamp",
        sortOrder = "desc",
        ...filters
      } = queryDto;

      // Build query filters
      const query: any = {};

      if (filters.userId) {
        query.userId = filters.userId;
      }

      if (filters.action) {
        query.action = filters.action;
      }

      if (filters.resource) {
        query.resource = filters.resource;
      }

      if (filters.resourceId) {
        query.resourceId = filters.resourceId;
      }

      if (filters.severity) {
        query.severity = filters.severity;
      }

      if (filters.ipAddress) {
        query.ipAddress = filters.ipAddress;
      }

      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) {
          query.timestamp.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.timestamp.$lte = new Date(filters.endDate);
        }
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

      const [logs, total] = await Promise.all([
        this.auditLogModel
          .find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.auditLogModel.countDocuments(query).exec(),
      ]);

      return {
        data: logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to query audit logs: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Find audit log by ID
   */
  async findOne(id: string): Promise<AuditLog> {
    try {
      const log = await this.auditLogModel.findById(id).exec();

      if (!log) {
        throw new NotFoundException(`Audit log with ID ${id} not found`);
      }

      return log;
    } catch (error) {
      this.logger.error(
        `Failed to find audit log: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Get audit logs for a specific user
   */
  async findByUser(userId: string, queryDto: QueryAuditLogsDto) {
    return this.findAll({ ...queryDto, userId });
  }

  /**
   * Get audit logs for a specific resource
   */
  async findByResource(
    resource: AuditResource,
    resourceId: string,
    queryDto: QueryAuditLogsDto
  ) {
    return this.findAll({ ...queryDto, resource, resourceId });
  }

  /**
   * Get audit statistics
   */
  async getStatistics(startDate?: Date, endDate?: Date) {
    try {
      const matchStage: any = {};

      if (startDate || endDate) {
        matchStage.timestamp = {};
        if (startDate) matchStage.timestamp.$gte = startDate;
        if (endDate) matchStage.timestamp.$lte = endDate;
      }

      const [actionStats, resourceStats, severityStats, totalCount] =
        await Promise.all([
          // Actions breakdown
          this.auditLogModel.aggregate([
            ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
            { $group: { _id: "$action", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
          // Resources breakdown
          this.auditLogModel.aggregate([
            ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
            { $group: { _id: "$resource", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
          // Severity breakdown
          this.auditLogModel.aggregate([
            ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
            { $group: { _id: "$severity", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
          // Total count
          this.auditLogModel.countDocuments(matchStage).exec(),
        ]);

      return {
        total: totalCount,
        byAction: actionStats.reduce(
          (acc, { _id, count }) => ({ ...acc, [_id]: count }),
          {}
        ),
        byResource: resourceStats.reduce(
          (acc, { _id, count }) => ({ ...acc, [_id]: count }),
          {}
        ),
        bySeverity: severityStats.reduce(
          (acc, { _id, count }) => ({ ...acc, [_id]: count }),
          {}
        ),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get statistics: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Get user activity timeline
   */
  async getUserTimeline(userId: string, limit = 20) {
    try {
      return await this.auditLogModel
        .find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .select("action resource resourceId timestamp")
        .lean()
        .exec();
    } catch (error) {
      this.logger.error(
        `Failed to get user timeline: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Delete old audit logs (cleanup)
   */
  async cleanup(daysToKeep = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.auditLogModel
        .deleteMany({
          timestamp: { $lt: cutoffDate },
        })
        .exec();

      this.logger.log(
        `Deleted ${result.deletedCount} audit logs older than ${daysToKeep} days`
      );

      return result.deletedCount;
    } catch (error) {
      this.logger.error(
        `Failed to cleanup audit logs: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Export audit logs to JSON
   */
  async export(queryDto: QueryAuditLogsDto): Promise<AuditLog[]> {
    try {
      const result = await this.findAll({ ...queryDto, limit: 10000 });
      return result.data;
    } catch (error) {
      this.logger.error(
        `Failed to export audit logs: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Get database health status
   */
  async getHealth() {
    try {
      const db = this.auditLogModel.db;
      const state = db.readyState;
      const stateMap = [
        "disconnected",
        "connected",
        "connecting",
        "disconnecting",
      ];

      return {
        status: state === 1 ? "up" : "down",
        state: stateMap[state],
        name: db.name,
        host: db.host,
      };
    } catch (error) {
      return {
        status: "down",
        error: error.message,
      };
    }
  }
}
