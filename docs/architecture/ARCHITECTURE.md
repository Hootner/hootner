# Service Architecture

## Overview

Microservices architecture with 11 NestJS-based services handling different domains.

## Services

### Analytics Service

**Port:** 3001  
**Purpose:** User behavior tracking and metrics  
**Tech:** NestJS, TypeScript

### Audit Service

**Port:** 3002  
**Purpose:** System audit logging and compliance  
**Tech:** NestJS, MongoDB schemas

### Auth Service

**Port:** 3003  
**Purpose:** User and agent authentication, JWT management  
**Tech:** NestJS, JWT, bcrypt  
**Controllers:** auth.controller, agent-auth.controller

### Content Moderation Service

**Port:** 3004  
**Purpose:** Content filtering and moderation  
**Tech:** NestJS, ML models

### Event Service

**Port:** 3005  
**Purpose:** Event-driven messaging and notifications  
**Tech:** NestJS, Event emitters

### Marketplace Service

**Port:** 3006  
**Purpose:** Digital marketplace transactions  
**Tech:** NestJS

### Police Bot Service

**Port:** 3007  
**Purpose:** Automated content monitoring  
**Tech:** NestJS

### Profile Service

**Port:** 3008  
**Purpose:** User profile management  
**Tech:** NestJS

### Search Service

**Port:** 3009  
**Purpose:** Full-text search across content  
**Tech:** NestJS, Elasticsearch

### Security Service

**Port:** 3010  
**Purpose:** Security scanning and threat detection  
**Tech:** NestJS, Security schemas

### Subscription Service

**Port:** 3011  
**Purpose:** Subscription and payment management  
**Tech:** NestJS, Stripe integration

### Video Service

**Port:** 3012  
**Purpose:** Video processing and streaming  
**Tech:** NestJS, VLC, FFmpeg  
**Security:** Path traversal protection

## Communication Patterns

- **REST APIs:** HTTP/JSON between services
- **GraphQL Gateway:** api/graphql aggregates service data
- **Event Bus:** Event service for async messaging
- **Auth Flow:** JWT tokens validated by auth-service

## Shared Resources

- **Database:** Shared MongoDB/PostgreSQL instances
- **Config:** shared/config for environment variables
- **Utils:** shared/utils for common functions
- **Middleware:** shared/middleware for security

## Deployment

Each service runs independently with:

- Individual package.json
- Separate project.json (Nx configuration)
- Independent test suites
- Docker containerization support
