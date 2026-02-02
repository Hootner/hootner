# HOOTNER Quick Reference

## Setup
```bash
npm install
npm run aws:onboard
sam build && sam deploy --guided
```

## Development
```bash
npm run start:all          # Start platform
npm run dev               # Development mode
npm test                  # Run tests
```

## AWS Services
- **DynamoDB**: HootnerActivities table
- **Lambda**: Node.js 22 runtime
- **S3**: Upload bucket
- **Secrets**: API keys management

## API Endpoints
- GraphQL: `/graphql`
- Health: `/health`
- Upload: `/api/upload`

## Environment
```bash
TABLE_NAME=HootnerActivities
AWS_REGION=us-east-1
JWT_SECRET=your-secret
```

## Deployment
```bash
sam build
sam deploy --guided
```