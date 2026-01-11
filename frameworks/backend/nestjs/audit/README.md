# NestJS Audit Service

Comprehensive audit service built with NestJS, MongoDB, and health checks for tracking user activities and system events.

## Features

✅ **Audit Logging**

- Track all user actions (CREATE, READ, UPDATE, DELETE, etc.)
- Resource-based tracking (USER, VIDEO, PAYMENT, etc.)
- Severity levels (LOW, MEDIUM, HIGH, CRITICAL)
- IP address and user agent tracking
- Request/session ID tracking

✅ **MongoDB Integration**

- Mongoose ODM with TypeScript
- Indexed collections for performance
- TTL indexes for automatic cleanup (90 days)
- Bulk insert support

✅ **Health Checks**

- Kubernetes liveness probe
- Kubernetes readiness probe
- Kubernetes startup probe
- MongoDB connection health
- Memory usage monitoring
- Disk space monitoring

✅ **REST API**

- Full CRUD operations
- Advanced filtering and pagination
- Statistics and analytics
- User activity timeline
- Export functionality

✅ **Documentation**

- Swagger/OpenAPI documentation
- DTO validation with class-validator
- TypeScript interfaces

## Architecture

```
audit/
├── main.ts                      # Bootstrap
├── audit.module.ts              # Main module
├── audit.controller.ts          # REST endpoints
├── audit.service.ts             # Business logic
├── health.controller.ts         # Health endpoints
├── schemas/
│   └── audit-log.schema.ts      # MongoDB schema
├── dto/
│   ├── create-audit-log.dto.ts  # Create DTO
│   └── query-audit-logs.dto.ts  # Query DTO
├── health/
│   └── mongo.health.ts          # Custom health indicator
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
└── .env.example                # Environment template
```

## Installation

```bash
cd frameworks/backend/nestjs/audit
npm install
```

## Environment Variables

Copy `.env.example` to `.env`:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/hootner-audit
CORS_ORIGIN=http://localhost:3000
AUDIT_RETENTION_DAYS=90
```

## Running the Service

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

## API Documentation

Swagger UI available at: `http://localhost:3001/api/docs`

## API Endpoints

### Audit Logs

| Method | Endpoint                              | Description              |
| ------ | ------------------------------------- | ------------------------ |
| POST   | `/api/v1/audit`                       | Create audit log         |
| POST   | `/api/v1/audit/bulk`                  | Create multiple logs     |
| GET    | `/api/v1/audit`                       | Get all logs (paginated) |
| GET    | `/api/v1/audit/:id`                   | Get log by ID            |
| GET    | `/api/v1/audit/user/:userId`          | Get user logs            |
| GET    | `/api/v1/audit/user/:userId/timeline` | Get user timeline        |
| GET    | `/api/v1/audit/statistics`            | Get statistics           |
| GET    | `/api/v1/audit/export`                | Export logs              |
| POST   | `/api/v1/audit/cleanup`               | Cleanup old logs         |

### Health Checks

| Method | Endpoint                   | Description          |
| ------ | -------------------------- | -------------------- |
| GET    | `/api/v1/health`           | Comprehensive health |
| GET    | `/api/v1/health/liveness`  | Liveness probe       |
| GET    | `/api/v1/health/readiness` | Readiness probe      |
| GET    | `/api/v1/health/startup`   | Startup probe        |

## Usage Examples

### Create Audit Log

```typescript
POST /api/v1/audit
{
  "userId": "user123",
  "username": "john.doe",
  "action": "UPDATE",
  "resource": "VIDEO",
  "resourceId": "video456",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "severity": "MEDIUM",
  "oldValue": { "title": "Old Title" },
  "newValue": { "title": "New Title" }
}
```

### Query Logs with Filters

```bash
GET /api/v1/audit?userId=user123&action=UPDATE&page=1&limit=20
```

### Get Statistics

```bash
GET /api/v1/audit/statistics?startDate=2026-01-01&endDate=2026-01-31
```

Response:

```json
{
  "total": 1250,
  "byAction": {
    "CREATE": 400,
    "UPDATE": 350,
    "DELETE": 100,
    "READ": 400
  },
  "byResource": {
    "VIDEO": 600,
    "USER": 300,
    "COMMENT": 350
  },
  "bySeverity": {
    "LOW": 800,
    "MEDIUM": 300,
    "HIGH": 100,
    "CRITICAL": 50
  }
}
```

## MongoDB Schema

```typescript
{
  userId: string,           // User ID
  username: string,         // Username
  action: AuditAction,      // Action performed
  resource: AuditResource,  // Resource type
  resourceId?: string,      // Resource ID
  metadata?: object,        // Additional data
  ipAddress: string,        // Request IP
  userAgent: string,        // User agent
  requestId?: string,       // Request tracking ID
  sessionId?: string,       // Session ID
  severity: AuditSeverity,  // Severity level
  status?: string,          // Status
  oldValue?: object,        // Previous value
  newValue?: object,        // New value
  errorMessage?: string,    // Error if any
  duration?: number,        // Action duration (ms)
  timestamp: Date,          // When it happened
  expiresAt?: Date,        // TTL expiration
}
```

### Indexes

- `userId + timestamp` (compound, descending)
- `action + resource + timestamp` (compound)
- `timestamp` (TTL index, 90 days)
- `severity + timestamp` (compound)
- `resourceId + timestamp` (compound)

## Health Check Response

```json
{
  "status": "ok",
  "info": {
    "mongoose": {
      "status": "up"
    },
    "mongodb": {
      "status": "up",
      "state": "connected",
      "host": "localhost",
      "name": "hootner-audit"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    },
    "disk": {
      "status": "up"
    }
  }
}
```

## Kubernetes Integration

### Liveness Probe

```yaml
livenessProbe:
  httpGet:
    path: /api/v1/health/liveness
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10
```

### Readiness Probe

```yaml
readinessProbe:
  httpGet:
    path: /api/v1/health/readiness
    port: 3001
  initialDelaySeconds: 10
  periodSeconds: 5
```

### Startup Probe

```yaml
startupProbe:
  httpGet:
    path: /api/v1/health/startup
    port: 3001
  failureThreshold: 30
  periodSeconds: 10
```

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Security

- Helmet.js for HTTP security headers
- CORS configuration
- Input validation with class-validator
- MongoDB injection prevention
- Rate limiting (implement if needed)

## Performance

- Indexed MongoDB collections
- Pagination for large datasets
- Bulk insert operations
- TTL indexes for automatic cleanup
- Lean queries for read operations

## Monitoring

- Health check endpoints
- Memory usage monitoring
- Disk space monitoring
- MongoDB connection status
- Custom metrics (implement if needed)

## Cleanup

Automatic cleanup via TTL index (90 days) or manual:

```bash
POST /api/v1/audit/cleanup?days=90
```

## Integration Example

```typescript
// In your service
import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class VideoService {
  async updateVideo(id: string, data: any, userId: string) {
    const oldVideo = await this.getVideo(id);
    const newVideo = await this.update(id, data);

    // Log audit event
    await this.http
      .post("http://audit-service:3001/api/v1/audit", {
        userId,
        username: oldVideo.owner,
        action: "UPDATE",
        resource: "VIDEO",
        resourceId: id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        severity: "MEDIUM",
        oldValue: { title: oldVideo.title },
        newValue: { title: newVideo.title },
      })
      .toPromise();

    return newVideo;
  }
}
```

## Production Checklist

- [ ] Configure MongoDB connection string
- [ ] Set appropriate retention period
- [ ] Enable authentication/authorization
- [ ] Configure rate limiting
- [ ] Set up monitoring alerts
- [ ] Configure log aggregation
- [ ] Set up backup strategy
- [ ] Test health checks
- [ ] Configure resource limits
- [ ] Enable compression

## Next Steps

1. Add authentication middleware
2. Implement rate limiting
3. Add metrics (Prometheus)
4. Set up log aggregation (ELK)
5. Add advanced analytics
6. Implement archival strategy
7. Add audit log streaming (Kafka)
8. Create admin dashboard
