# Database Migration: MongoDB → DynamoDB

## Status: IN PROGRESS

### Changes Required

#### 1. Dependencies
```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
npm uninstall mongoose
```

#### 2. Configuration Files
- Update `.env` with DynamoDB config
- Remove MongoDB connection strings
- Add AWS credentials/region

#### 3. Code Changes
- Replace Mongoose models with DynamoDB schemas
- Update `api/graphql/models/` 
- Modify resolvers for DynamoDB queries
- Update database manager in `hexarchy/7-data/`

#### 4. Docker Compose
- Remove MongoDB service
- Add DynamoDB Local (optional for dev)

#### 5. Test Updates
- Update test fixtures for DynamoDB
- Modify integration tests
- Update seed scripts

### DynamoDB Local Setup (Dev)
```yaml
dynamodb-local:
  image: amazon/dynamodb-local
  ports:
    - "8000:8000"
  command: "-jar DynamoDBLocal.jar -sharedDb"
```

### AWS DynamoDB (Production)
- Configure tables via Terraform
- Set up IAM roles
- Enable Point-in-Time Recovery
- Configure auto-scaling

---
**Note**: All database references should now point to DynamoDB instead of MongoDB.
