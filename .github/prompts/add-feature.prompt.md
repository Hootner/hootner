# Task: Add New Feature

## Goal
[Clearly state the desired end result in 1–2 sentences]

Example: Add rate limiting to GraphQL endpoint to prevent abuse by limiting unauthenticated queries to 30/min per IP.

## Requirements / Constraints
- Must work with existing architecture: [briefly describe relevant parts]
  - Example: Express middleware, GraphQL resolvers, hexarchy structure
- Use only existing dependencies (no new packages unless security-approved)
  - Available packages: express, express-rate-limit, helmet, cors, graphql, mongoose, pg, redis
- Keep changes focused: maximum 4–6 files
- Preserve existing behavior unless explicitly stated
- Add/update tests for all new/changed logic
- Follow project coding standards (see copilot-instructions.md)
- ES modules preferred (import/export, not require)

## Context / Files to Consider
Primary files (uncomment and add specific files):
<!--
- #file:api/graphql/server.js
- #file:api/middleware/rateLimit.js
- #file:enhanced-agent-hub.js
- #file:orchestration/index.js
- #file:hexarchy/[appropriate-layer]/[module].js
-->

Related:
- #file:.github/copilot-instructions.md
- Hexarchy structure: Place new code in appropriate layer
  - Layer 1: Foundation (containers, core infrastructure)
  - Layer 2: Intelligence (AI, ML services)
  - Layer 3: Governance (compliance, security)
  - Layer 4: Society (user management, social features)
  - Layer 5: Economy (business logic, commerce)
  - Layer 6: Culture (content, media)
  - Layer 7: Data (storage, databases)
  - Layer 8: Operations (monitoring, deployment)

## Feature Specification
Describe the feature requirements:

### Functional Requirements
- [ ] Requirement 1: [describe what the feature must do]
- [ ] Requirement 2: [describe behavior]
- [ ] Requirement 3: [describe edge cases]

### Non-Functional Requirements
- [ ] Performance: [latency, throughput expectations]
- [ ] Security: [authentication, authorization requirements]
- [ ] Scalability: [expected load, concurrency]
- [ ] Monitoring: [logging, metrics to track]

## Acceptance Criteria
- [ ] Code passes lint + type check (`npm run lint:fix`)
- [ ] `npm audit` shows 0 high/critical vulnerabilities
- [ ] All new code is covered by tests (`npm test`)
- [ ] Feature works as specified (manual testing)
- [ ] Commit messages follow Conventional Commits (`feat(module): ...`)
- [ ] No regressions in existing functionality
- [ ] Documentation updated (if applicable)
- [ ] API documentation added (if new endpoints)

## Examples

### Example 1: Rate Limiting Middleware
**Goal**: Add rate limiting to protect API endpoints from abuse.

**Implementation**:
```javascript
// api/middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // stricter limit for auth endpoints
  message: 'Too many authentication attempts, please try again later'
});

export const graphqlLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: (req) => {
    // Different limits for authenticated vs unauthenticated
    return req.user ? 100 : 30;
  },
  message: 'Too many requests, please try again later'
});
```

**Usage**:
```javascript
// api/graphql/server.js
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { graphqlLimiter } from '../middleware/rateLimit.js';
import schema from './schema.js';

const app = express();

app.use('/graphql', graphqlLimiter, graphqlHTTP({
  schema,
  graphiql: process.env.NODE_ENV !== 'production'
}));
```

**Tests**:
```javascript
// tests/middleware/rateLimit.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../api/server.js';

describe('Rate Limiting', () => {
  it('should allow requests within limit', async () => {
    for (let i = 0; i < 30; i++) {
      const res = await request(app).post('/graphql').send({ query: '{ ping }' });
      expect(res.status).toBe(200);
    }
  });

  it('should block requests over limit', async () => {
    // Make 31 requests (over the 30 limit)
    for (let i = 0; i < 31; i++) {
      await request(app).post('/graphql').send({ query: '{ ping }' });
    }
    const res = await request(app).post('/graphql').send({ query: '{ ping }' });
    expect(res.status).toBe(429);
  });
});
```

### Example 2: Adding a New Agent
**Goal**: Add a new AI agent to the enhanced-agent-hub.

**Implementation**:
```javascript
// frameworks/ai/agents/content-moderator.js
export class ContentModeratorAgent {
  constructor() {
    this.name = 'content-moderator';
    this.status = 'idle';
  }

  async initialize() {
    console.log('[Content Moderator] Initializing...');
    this.status = 'ready';
  }

  async processRequest(req, res) {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Moderate content
    const result = await this.moderateContent(content);
    res.json(result);
  }

  async moderateContent(content) {
    // Implement moderation logic
    const containsProfanity = this.checkProfanity(content);
    const containsSpam = this.checkSpam(content);
    
    return {
      safe: !containsProfanity && !containsSpam,
      flags: {
        profanity: containsProfanity,
        spam: containsSpam
      }
    };
  }

  checkProfanity(content) {
    // Simple check (replace with proper service)
    const profanityList = ['badword1', 'badword2'];
    return profanityList.some(word => content.toLowerCase().includes(word));
  }

  checkSpam(content) {
    // Simple spam detection
    return content.includes('http') && content.length < 50;
  }

  getStatus() {
    return { name: this.name, status: this.status };
  }
}
```

**Register in enhanced-agent-hub.js**:
```javascript
import { ContentModeratorAgent } from './frameworks/ai/agents/content-moderator.js';

// In the initialize function
const contentModerator = new ContentModeratorAgent();
await contentModerator.initialize();
agents.push(contentModerator);
```

## Steps to Execute
1. Review existing codebase and architecture
2. Identify where the new feature fits (which hexarchy layer?)
3. Design the feature (interfaces, data flow)
4. Write tests first (TDD approach) or alongside implementation
5. Implement the feature in small, incremental steps
6. Run tests: `npm test`
7. Run lint: `npm run lint:fix`
8. Manual testing and verification
9. Document the feature (README, API docs, etc.)
10. Create commit with descriptive message

---

Now implement this task following all instructions above.
If anything is unclear — ask me before proceeding.
