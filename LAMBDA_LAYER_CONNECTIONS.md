# Lambda Layer Connections

## Architecture

```
APIKeysLayer (Lambda Layer)
├── api-key-manager module
│   ├── getAPIKeys() → Secrets Manager
│   └── validateAPIKey() → API Gateway
│
└── Connected to 11 Lambda Functions:
    ├── GraphQLFunction → /graphql
    ├── VideoFunction → /api/videos
    ├── AIVideoFunction → /api/ai-video
    ├── LiveStreamFunction → /api/live-stream
    ├── EditorFunction → /api/editor
    ├── CollaborationFunction → /api/collaboration
    ├── MessagesFunction → /api/messages
    ├── AnalyticsFunction → /api/analytics
    ├── MarketplaceFunction → /api/marketplace
    ├── AgentsFunction → /api/agents
    └── DevOpsFunction → /api/devops

All Functions Connect To:
├── DynamoDB (HootnerActivities)
└── Secrets Manager (hootner/api-keys)
```

## Usage in Lambda

```javascript
const { getAPIKeys, validateAPIKey } = require('api-key-manager');

exports.handler = async (event) => {
  validateAPIKey(event);
  const secrets = await getAPIKeys();
  // Use secrets.JWT_SECRET, secrets.STRIPE_KEY, etc.
};
```

## Deploy

```bash
sam build -t template-layer.yaml
sam deploy -t template-layer.yaml --stack-name hootner-layer --guided
```
