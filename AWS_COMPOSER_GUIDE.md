# AWS Application Composer - API to DB Connection

## ✅ Created Files

1. **template.yaml** - SAM template with all APIs connected to DynamoDB
2. **samconfig.toml** - Deployment configuration
3. **scripts/deploy-composer.js** - Automated deployment script

## 🏗️ Architecture

**7 Lambda Functions → 1 DynamoDB Table (Single-Table Design)**

### APIs Connected:
- ✅ GraphQL API → HootnerTable
- ✅ Video API → HootnerTable
- ✅ User API → HootnerTable
- ✅ Playlist API → HootnerTable
- ✅ Marketplace API → HootnerTable
- ✅ Contact API → HootnerTable
- ✅ Webhook API → HootnerTable

### DynamoDB Table Schema:
```
HootnerActivities
├── PK (Partition Key)
├── SK (Sort Key)
└── GSI1 (Global Secondary Index)
    ├── GSI1PK
    └── GSI1SK
```

## 🚀 Deploy Options

### Option 1: AWS Application Composer (Visual)
```bash
# Open Composer (already opened in browser)
# Import template.yaml
# Visualize connections
# Deploy from Composer UI
```

### Option 2: AWS SAM CLI
```bash
# Build
sam build

# Deploy (guided)
sam deploy --guided

# Or use script
node scripts/deploy-composer.js
```

### Option 3: Quick Deploy
```bash
npm run aws:package
npm run aws:deploy
```

## 📊 Endpoints After Deployment

```
API Gateway Base: https://{api-id}.execute-api.us-east-1.amazonaws.com/prod

GraphQL:      POST /graphql
Videos:       GET/POST /api/videos
Users:        GET/POST /api/users
Playlists:    GET/POST /api/playlists
Marketplace:  GET/POST /api/marketplace/products
Contacts:     GET/POST /api/contacts
Webhooks:     POST /webhooks/stripe
```

## 🔧 Local Testing

```bash
# Start local API + DynamoDB
sam local start-api --docker-network host

# Test GraphQL
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ videos { id title } }"}'
```

## 📝 Next Steps

1. Open AWS Composer (already opened)
2. Click "Create new project" or "Import template"
3. Select `template.yaml` from project root
4. Visualize all API → DB connections
5. Click "Deploy" to push to AWS
6. Copy API Gateway URL from outputs

## 🔗 Resources

- AWS Composer: https://console.aws.amazon.com/composer
- SAM Docs: https://docs.aws.amazon.com/serverless-application-model/
- DynamoDB Single-Table: https://aws.amazon.com/blogs/compute/creating-a-single-table-design-with-amazon-dynamodb/
