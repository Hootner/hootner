/**
 * Health Controller
 * Health check endpoints for audit service
 */

import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from "@nestjs/terminus";
import { MongoHealthIndicator } from "./health/mongo.health";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongooseHealth: MongooseHealthIndicator,
    private mongoHealth: MongoHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: "Comprehensive health check" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  @ApiResponse({ status: 503, description: "Service is unhealthy" })
  check() {
    return this.health.check([
      // MongoDB connection via Mongoose
      () => this.mongooseHealth.pingCheck("mongoose", { timeout: 1500 }),

      // Custom MongoDB health check
      () => this.mongoHealth.isHealthy("mongodb"),

      // Memory check (RSS < 300MB)
      () => this.memory.checkHeap("memory_heap", 300 * 1024 * 1024),

      // Memory RSS check
      () => this.memory.checkRSS("memory_rss", 300 * 1024 * 1024),

      // Disk storage check (80% threshold)
      () =>
        this.disk.checkStorage("disk", {
          thresholdPercent: 0.8,
          path: "/",
        }),
    ]);
  }

  @Get("liveness")
  @ApiOperation({ summary: "Liveness probe for Kubernetes" })
  @ApiResponse({ status: 200, description: "Service is alive" })
  liveness() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("readiness")
  @HealthCheck()
  @ApiOperation({ summary: "Readiness probe for Kubernetes" })
  @ApiResponse({ status: 200, description: "Service is ready" })
  @ApiResponse({ status: 503, description: "Service is not ready" })
  readiness() {
    return this.health.check([
      () => this.mongooseHealth.pingCheck("mongoose", { timeout: 1500 }),
      () => this.mongoHealth.isHealthy("mongodb"),
    ]);
  }

  @Get("startup")
  @HealthCheck()
  @ApiOperation({ summary: "Startup probe for Kubernetes" })
  @ApiResponse({ status: 200, description: "Service started successfully" })
  startup() {
    return this.health.check([
      () => this.mongooseHealth.pingCheck("mongoose", { timeout: 3000 }),
    ]);
  }
}
