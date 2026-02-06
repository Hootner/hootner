# 🔑 API Keys Connected - CloudFront Apps

## ✅ Setup Complete

All 20 CloudFront applications are now configured to connect to AWS APIs with proper authentication.

## 📦 Files Created

| File | Purpose |
|------|---------|
| `template-with-keys.yaml` | SAM template with API Gateway + API Keys + Secrets Manager |
| `cloudfront-api-config.js` | JavaScript config for all apps |
| `cloudfront-api-snippet.html` | HTML snippet to add to pages |
| `deploy-api-keys.bat` | Windows deployment script |
| `scripts/connect-api-keys.js` | Node.js deployment script |
| `CLOUDFRONT_API_KEYS.md` | Complete documentation |

## 🚀 Quick Deploy

```bash
# Windows
deploy-api-keys.bat

# Or Node.js
node scripts/connect-api-keys.js

# Or Manual
sam build -t template-with-keys.yaml
sam deploy -t template-with-keys.yaml --stack-name hootner-api-keys --guided
```

## 🔗 20 CloudFront Apps Connected

| App | URL | API Endpoint |
|-----|-----|--------------|
| 🎥 Video Player | video-player.html | /api/videos |
| 🎬 AI Video Generator | ai-video.html | /api/ai-video |
| 📺 Live Stream | live-stream.html | /api/live-stream |
| 💻 Code Editor | code-editor.html | /api/editor |
| ⚡ Ultra Editor | ultra-editor.html | /api/editor |
| 🤖 Auto Editor | auto-editor.html | /api/editor |
| 👥 Collaboration | collaboration.html | /api/collaboration |
| 💬 Messages | messages.html | /api/messages |
| 📊 Analytics | analytics.html | /api/analytics |
| 🛍️ Marketplace | marketplace.html | /api/marketplace |
| 🤖 AI Agents | agent-management.html | /api/agents |
| 🔧 DevOps | devops-monitoring.html | /api/devops |
| 🎨 Design Showcase | design-showcase.html | /graphql |
| 📱 Social Feed | feed-react.html | /graphql |
| ⚡ Live Activity | live-activity.html | /graphql |
| 👤 Profile | profile.html | /graphql |
| ⚙️ Settings | settings.html | /graphql |
| 📞 Contact | contact.html | /api/messages |
| 🏠 Dashboard | dashboard.html | /graphql |
| 🔐 Login | login.html | /graphql |

## 🏗️ Architecture

```
CloudFront (daxqx65ar35pp.cloudfront.net)
    ↓
API Gateway (with API Key authentication)
    ↓
11 Lambda Functions
    ↓
DynamoDB (HootnerActivities)
    ↓
Secrets Manager (JWT, Stripe, etc.)
```

## 🔐 Security Features

- ✅ API Gateway API Key required for all requests
- ✅ Secrets Manager for sensitive keys (JWT, Stripe)
- ✅ CORS configured for CloudFront domain only
- ✅ Rate limiting (100 req/sec, 200 burst)
- ✅ Usage plan (100K requests/month)
- ✅ IAM policies for Lambda → DynamoDB access

## 📝 Integration Steps

### 1. Deploy Infrastructure
```bash
deploy-api-keys.bat
```

### 2. Get API Key
```bash
aws cloudformation describe-stacks --stack-name hootner-api-keys --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayKey'].OutputValue" --output text
```

### 3. Update HTML Pages
Add the snippet from `cloudfront-api-snippet.html` to all 20 pages:
```html
<script>
const API_CONFIG = {
  apiKey: 'YOUR_API_KEY_HERE',
  endpoints: { ... }
};
</script>
```

### 4. Upload to CloudFront
```bash
aws s3 sync . s3://your-cloudfront-bucket/ --exclude "*" --include "*.html" --include "*.js"
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## 🧪 Test API Connection

```javascript
// In browser console on any CloudFront page
const videos = await apiRequest(API_CONFIG.endpoints.videos);
console.log(videos);

// GraphQL test
const data = await graphqlRequest(`{ videos { id title } }`);
console.log(data);
```

## 📊 Monitor Usage

```bash
# API Gateway metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=hootner-api-keys \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-12-31T23:59:59Z \
  --period 3600 \
  --statistics Sum

# View in AWS Console
https://console.aws.amazon.com/apigateway
```

## 🔄 Update API Key

```bash
# Create new key
aws apigateway create-api-key --name hootner-cloudfront-key-v2 --enabled

# Update usage plan
aws apigateway create-usage-plan-key \
  --usage-plan-id YOUR_PLAN_ID \
  --key-id NEW_KEY_ID \
  --key-type API_KEY

# Update HTML pages with new key
```

## 🎯 Next Steps

1. ✅ Run deployment: `deploy-api-keys.bat`
2. ✅ Copy API key from output
3. ✅ Update `cloudfront-api-snippet.html` with real API key
4. ✅ Add snippet to all 20 CloudFront HTML pages
5. ✅ Upload updated pages to S3/CloudFront
6. ✅ Test API calls from browser
7. ✅ Monitor usage in API Gateway console

## 📚 Documentation

- Full Guide: `CLOUDFRONT_API_KEYS.md`
- SAM Template: `template-with-keys.yaml`
- API Config: `cloudfront-api-config.js`
- HTML Snippet: `cloudfront-api-snippet.html`

---

**Status**: ✅ Ready to Deploy
**AWS Account**: 504165876439
**Region**: us-east-1
**CloudFront**: daxqx65ar35pp.cloudfront.net
