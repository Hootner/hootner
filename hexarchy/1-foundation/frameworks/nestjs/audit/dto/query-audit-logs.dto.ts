/**
 * Query Audit Logs DTO
 * Data transfer object for querying audit logs
 */

import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { AuditAction, AuditResource, AuditSeverity } from '../schemas/audit-log.schema'

export class QueryAuditLogsDto {
  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  userId?: string

  @ApiPropertyOptional({ enum: AuditAction, description: 'Filter by action' })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction

  @ApiPropertyOptional({
    enum: AuditResource,
    description: 'Filter by resource',
  })
  @IsOptional()
  @IsEnum(AuditResource)
  resource?: AuditResource

  @ApiPropertyOptional({ description: 'Filter by resource ID' })
  @IsOptional()
  @IsString()
  resourceId?: string

  @ApiPropertyOptional({
    enum: AuditSeverity,
    description: 'Filter by severity',
  })
  @IsOptional()
  @IsEnum(AuditSeverity)
  severity?: AuditSeverity

  @ApiPropertyOptional({ description: 'Filter by IP address' })
  @IsOptional()
  @IsString()
  ipAddress?: string

  @ApiPropertyOptional({ description: 'Filter logs from this date' })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({ description: 'Filter logs until this date' })
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 50,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50

  @ApiPropertyOptional({ description: 'Sort field', default: 'timestamp' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp'

  @ApiPropertyOptional({
    description: 'Sort order (asc/desc)',
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc'
}
