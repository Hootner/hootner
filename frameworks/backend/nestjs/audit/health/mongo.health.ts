/**
 * MongoDB Health Indicator
 * Custom health indicator for MongoDB connection
 */

import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from "@nestjs/terminus";
import { Connection } from "mongoose";

@Injectable()
export class MongoHealthIndicator extends HealthIndicator {
  constructor(@InjectConnection() private connection: Connection) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = this.connection.readyState === 1;

    const result = this.getStatus(key, isHealthy, {
      state: this.getReadyStateString(this.connection.readyState),
      host: this.connection.host,
      name: this.connection.name,
      port: this.connection.port,
    });

    if (isHealthy) {
      return result;
    }

    throw new HealthCheckError("MongoDB check failed", result);
  }

  private getReadyStateString(state: number): string {
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    return states[state] || "unknown";
  }
}
