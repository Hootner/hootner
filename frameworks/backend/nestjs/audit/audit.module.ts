/**
 * Audit Module
 * Main NestJS module for audit service
 */

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { TerminusModule } from "@nestjs/terminus";
import { AuditController } from "./audit.controller";
import { AuditService } from "./audit.service";
import { HealthController } from "./health.controller";
import { MongoHealthIndicator } from "./health/mongo.health";
import { AuditLog, AuditLogSchema } from "./schemas/audit-log.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || "mongodb://localhost:27017/hootner-audit",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    ),
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    TerminusModule,
  ],
  controllers: [AuditController, HealthController],
  providers: [AuditService, MongoHealthIndicator],
  exports: [AuditService],
})
export class AuditModule {}
