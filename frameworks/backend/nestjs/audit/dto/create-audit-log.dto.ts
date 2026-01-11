/**
 * Create Audit Log DTO
 * Data transfer object for creating audit logs
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";
import {
  AuditAction,
  AuditResource,
  AuditSeverity,
} from "../schemas/audit-log.schema";

export class CreateAuditLogDto {
  @ApiProperty({ description: "User ID performing the action" })
  @IsString()
  userId: string;

  @ApiProperty({ description: "Username performing the action" })
  @IsString()
  username: string;

  @ApiProperty({ enum: AuditAction, description: "Action performed" })
  @IsEnum(AuditAction)
  action: AuditAction;

  @ApiProperty({ enum: AuditResource, description: "Resource affected" })
  @IsEnum(AuditResource)
  resource: AuditResource;

  @ApiPropertyOptional({ description: "ID of the affected resource" })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({ description: "Additional metadata" })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: "IP address of the request" })
  @IsString()
  ipAddress: string;

  @ApiProperty({ description: "User agent of the request" })
  @IsString()
  userAgent: string;

  @ApiPropertyOptional({ description: "Request tracking ID" })
  @IsOptional()
  @IsString()
  requestId?: string;

  @ApiPropertyOptional({ description: "Session ID" })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ enum: AuditSeverity, default: AuditSeverity.LOW })
  @IsEnum(AuditSeverity)
  @IsOptional()
  severity?: AuditSeverity;

  @ApiPropertyOptional({ description: "Status of the action" })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: "Previous value before change" })
  @IsOptional()
  @IsObject()
  oldValue?: Record<string, any>;

  @ApiPropertyOptional({ description: "New value after change" })
  @IsOptional()
  @IsObject()
  newValue?: Record<string, any>;

  @ApiPropertyOptional({ description: "Error message if action failed" })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({
    description: "Duration of the action in milliseconds",
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ description: "Expiration date for the log" })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}
