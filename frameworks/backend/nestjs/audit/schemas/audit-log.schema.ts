/**
 * Audit Log Schema
 * MongoDB schema for audit logs
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type AuditLogDocument = AuditLog & Document

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  UPLOAD = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
  SHARE = 'SHARE',
  PAYMENT = 'PAYMENT',
  SUBSCRIPTION = 'SUBSCRIPTION',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
}

export enum AuditResource {
  USER = 'USER',
  VIDEO = 'VIDEO',
  COMMENT = 'COMMENT',
  SUBSCRIPTION = 'SUBSCRIPTION',
  PAYMENT = 'PAYMENT',
  SETTINGS = 'SETTINGS',
  ADMIN = 'ADMIN',
  API = 'API',
  SYSTEM = 'SYSTEM',
}

export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Schema({
  timestamps: true,
  collection: 'audit_logs',
  strict: true,
})
export class AuditLog {
  @Prop({ required: true, index: true })
  userId: string

  @Prop({ required: true })
  username: string

  @Prop({ required: true, enum: AuditAction, index: true })
  action: AuditAction

  @Prop({ required: true, enum: AuditResource, index: true })
  resource: AuditResource

  @Prop({ required: false })
  resourceId?: string

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>

  @Prop({ required: true })
  ipAddress: string

  @Prop({ required: true })
  userAgent: string

  @Prop({ required: false })
  requestId?: string

  @Prop({ required: false })
  sessionId?: string

  @Prop({ required: true, enum: AuditSeverity, default: AuditSeverity.LOW })
  severity: AuditSeverity

  @Prop({ required: false })
  status?: string

  @Prop({ type: Object, required: false })
  oldValue?: Record<string, any>

  @Prop({ type: Object, required: false })
  newValue?: Record<string, any>

  @Prop({ required: false })
  errorMessage?: string

  @Prop({ required: false })
  duration?: number

  @Prop({ required: true, default: Date.now, index: true })
  timestamp: Date

  @Prop({ required: false })
  expiresAt?: Date
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog)

// Indexes for efficient querying
AuditLogSchema.index({ userId: 1, timestamp: -1 })
AuditLogSchema.index({ action: 1, resource: 1, timestamp: -1 })
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }) // 90 days TTL
AuditLogSchema.index({ severity: 1, timestamp: -1 })
AuditLogSchema.index({ resourceId: 1, timestamp: -1 })
