/**
 * Audit Service Main
 * Bootstrap NestJS application
 */

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as compression from "compression";
import * as helmet from "helmet";
import { AuditModule } from "./audit.module";

async function bootstrap() {
  const app = await NestFactory.create(AuditModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  });

  // Compression
  app.use(compression());

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Audit Service API")
    .setDescription(
      "HOOTNER Audit Service for tracking user activities and system events"
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("audit", "Audit log operations")
    .addTag("health", "Health check endpoints")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // Global prefix
  app.setGlobalPrefix("api/v1");

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Audit Service running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`❤️  Health Check: http://localhost:${port}/api/v1/health`);
}

bootstrap();
