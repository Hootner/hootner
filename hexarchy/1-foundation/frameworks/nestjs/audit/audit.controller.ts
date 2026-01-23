/**
 * Audit Controller
 * REST API endpoints for audit service
 */

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { CreateAuditLogDto } from "./dto/create-audit-log.dto";
import { QueryAuditLogsDto } from "./dto/query-audit-logs.dto";

@ApiTags("audit")
@Controller("audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create audit log entry" })
  @ApiResponse({ status: 201, description: "Audit log created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input" })
  async create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditService.create(createAuditLogDto);
  }

  @Post("bulk")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create multiple audit logs" })
  @ApiResponse({ status: 201, description: "Audit logs created successfully" })
  async createBulk(@Body() logs: CreateAuditLogDto[]) {
    return this.auditService.createBulk(logs);
  }

  @Get()
  @ApiOperation({ summary: "Get all audit logs with filters" })
  @ApiResponse({ status: 200, description: "Returns paginated audit logs" })
  async findAll(@Query() queryDto: QueryAuditLogsDto) {
    return this.auditService.findAll(queryDto);
  }

  @Get("statistics")
  @ApiOperation({ summary: "Get audit statistics" })
  @ApiResponse({ status: 200, description: "Returns audit statistics" })
  async getStatistics(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    return this.auditService.getStatistics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get audit logs for specific user" })
  @ApiResponse({ status: 200, description: "Returns user audit logs" })
  async findByUser(
    @Param("userId") userId: string,
    @Query() queryDto: QueryAuditLogsDto
  ) {
    return this.auditService.findByUser(userId, queryDto);
  }

  @Get("user/:userId/timeline")
  @ApiOperation({ summary: "Get user activity timeline" })
  @ApiResponse({ status: 200, description: "Returns user activity timeline" })
  async getUserTimeline(
    @Param("userId") userId: string,
    @Query("limit") limit?: number
  ) {
    return this.auditService.getUserTimeline(userId, limit);
  }

  @Get("export")
  @ApiOperation({ summary: "Export audit logs" })
  @ApiResponse({ status: 200, description: "Returns exported audit logs" })
  async export(@Query() queryDto: QueryAuditLogsDto) {
    return this.auditService.export(queryDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get audit log by ID" })
  @ApiResponse({ status: 200, description: "Returns audit log" })
  @ApiResponse({ status: 404, description: "Audit log not found" })
  async findOne(@Param("id") id: string) {
    return this.auditService.findOne(id);
  }

  @Post("cleanup")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cleanup old audit logs" })
  @ApiResponse({ status: 200, description: "Cleanup completed" })
  async cleanup(@Query("days") days?: number) {
    const deletedCount = await this.auditService.cleanup(days);
    return {
      message: "Cleanup completed",
      deletedCount,
    };
  }
}
