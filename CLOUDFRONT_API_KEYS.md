# 🔑 CloudFront API Keys Setup

## ✅ Files Created

1. **template-with-keys.yaml** - SAM template with API Gateway keys + Secrets Manager
2. **cloudfront-api-config.js** - JavaScript config for all 20 CloudFront apps
3. **scripts/connect-api-keys.js** - Automated deployment script
4. **.env.cloudfront** - Environment variables (auto-generated)

## 🏗️ Architecture

```
20 CloudFront Apps → API Gateway (with API Key) → 11 Lambda Functions → DynamoDB
                  ↓
            Secrets Manager (JWT, Stripe, etc.)
```

## 🚀 Deploy & Connect

### Option 1: Automated Script
```bash
node scripts/connect-api-keys.js
```

### Option 2: Manual Steps
```bash
# Build
sam build -t template-with-keys.yaml

# Deploy
sam deploy -t template-with-keys.yaml --stack-name hootner-api-keys --guided

# Get API Key
aws apigateway get-api-keys --include-values --query "items[?name=='hootner-cloudfront-key'].value" --output text
```

## 📱 CloudFront Apps Connected

✅ **All 20 Apps with API Access:**
- 🎥 Video Player
- 🎬 AI Video Generator
- 📺 Live Stream
- 💻 Code Editor (3 variants)
- 👥 Collaboration
- 💬 Messages
- 📊 Analytics
- 🛍️ Marketplace
- 🤖 AI Agents
- 🔧 DevOps
- 🎨 Design Showcase
- 📱 Social Feed
- ⚡ Live Activity
- 👤 Profile
- ⚙️ Settings
- 📞 Contact
- 🏠 Dashboard
- 🔐 Login

## 🔧 Usage in CloudFront Apps

### 1. Include Config Script
```html
<script src="https://daxqx65ar35pp.cloudfront.net/cloudfront-api-config.js"></script>
```

### 2. Make API Calls
```javascript
// REST API
const videos = await apiRequest(API_CONFIG.endpoints.videos);

// GraphQL
const data = await graphqlRequest(`
  query {
    videos { id title url }
  }
`);
```

## 🔐 API Keys Stored In

- **API Gateway Key**: Auto-generated, stored in AWS
- **JWT Secret**: Secrets Manager (`hootner/jwt-secret`)
- **Stripe Key**: Secrets Manager (`hootner/stripe-key`)
- **All Config**: SSM Parameter (`/hootner/config`)

## 📊 Endpoints

```
Base: https://{api-id}.execute-api.us-east-1.amazonaws.com/prod

/graphql              - GraphQL API
/api/videos           - Video Player
/api/ai-video         - AI Video Generator
/api/live-stream      - Live Streaming
/api/editor           - Code Editors
/api/collaboration    - Collaboration
/api/messages         - Messages
/api/analytics        - Analytics
/api/marketplace      - Marketplace
/api/agents           - AI Agents
/api/devops           - DevOps Monitoring
```

## 🔄 Update API Key

```bash
# Rotate API key
aws apigateway create-api-key --name hootner-cloudfront-key-v2 --enabled

# Update config
node scripts/connect-api-keys.js
```

## 📤 Upload to CloudFront

```bash
# Upload config to S3
aws s3 cp cloudfront-api-config.js s3://YOUR_BUCKET/

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## ✅ Verification

```bash
# Test API with key
curl -H "x-api-key: YOUR_KEY" https://YOUR_API/graphql \
  -d '{"query": "{ videos { id } }"}'
```

## 🎯 Next Steps

1. ✅ Run `node scripts/connect-api-keys.js`
2. ✅ Upload `cloudfront-api-config.js` to CloudFront
3. ✅ Include script in all 20 HTML pages
4. ✅ Test API calls from CloudFront apps
5. ✅ Monitor usage in API Gateway console
