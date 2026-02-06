# 🧪 HOOTNER External Testing Guide

**Last Updated:** January 23, 2026  
**Deployment:** AWS Production Environment

---

## 🚀 Quick Start for Testers

### **Option 1: Direct API Testing (No Setup Required)**

Anyone can test the API endpoints directly using the production URL:

#### **Production API Endpoint:**

```
https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod/
```

#### **Test with cURL:**

```bash
# Health Check
curl https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod/health

# GraphQL Endpoint
curl -X POST https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
```

#### **Test with Browser:**

Simply open in any browser:

- GraphQL Playground: `https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod/graphql`

---

### **Option 2: Frontend Web Application**

#### **S3 Static Website:**

The frontend is deployed to S3. To access:

1. **Enable S3 Website Hosting** (one-time setup by admin):

   ```bash
   aws s3 website s3://hootner-frontend-504165876439/ \
     --index-document index.html \
     --error-document index.html

   aws s3api put-bucket-policy --bucket hootner-frontend-504165876439 \
     --policy '{
       "Version": "2012-10-17",
       "Statement": [{
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::hootner-frontend-504165876439/*"
       }]
     }'
   ```

2. **Access URL:**
   ```
   http://hootner-frontend-504165876439.s3-website-us-east-1.amazonaws.com
   ```

---

### **Option 3: Local Development with Production API**

Testers can run the frontend locally but connect to the production backend.

#### **Step 1: Clone Repository**

```bash
git clone https://github.com/Hootner/hootner.git
cd hootner
```

#### **Step 2: Install Dependencies**

```bash
npm install
```

#### **Step 3: Configure Environment**

Create `.env.test` file:

```env
# Point to Production API
VITE_API_URL=https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod
VITE_GRAPHQL_URL=https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod/graphql

# Environment
NODE_ENV=test
VITE_ENV=production-test

# No AWS credentials needed for testers
```

#### **Step 4: Start Local Frontend**

```bash
npm run dev
```

Access at: `http://localhost:3000`

---

## 🔧 Testing Tools Setup

### **Postman Collection**

Import this collection to test all endpoints:

```json
{
  "info": {
    "name": "HOOTNER Production API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod"
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/health"
      }
    },
    {
      "name": "GraphQL Query",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/graphql",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"query\": \"{ __typename }\"}"
        }
      }
    }
  ]
}
```

Save as `hootner-postman-collection.json` and import to Postman.

---

### **Thunder Client (VS Code)**

Install Thunder Client extension and add:

**Base URL:** `https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod`

**Example Requests:**

```
GET /health
POST /graphql
GET /api/videos
POST /api/upload
```

---

## 📱 Mobile/External Device Testing

### **Access from Any Device:**

1. **Direct API Testing:**
   - Use mobile browser or REST client app
   - URL: `https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod/`

2. **Frontend Access:**
   - Once S3 website is enabled: `http://hootner-frontend-504165876439.s3-website-us-east-1.amazonaws.com`

3. **Local Network Access (if running locally):**
   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Access from other devices: `http://YOUR_IP:3000`

---

## 🧪 Test Scenarios

### **Basic Connectivity Test**

```bash
# Test 1: API Gateway is responding
curl -i https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod/

# Test 2: CORS is configured
curl -i -H "Origin: http://localhost:3000" \
  https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod/health

# Test 3: GraphQL endpoint
curl -X POST https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{__schema {types {name}}}"}'
```

### **Frontend Integration Test**

```javascript
// Test in browser console
fetch('https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod/health')
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error)
```

---

## 🔐 Authentication for Testers

If authentication is required:

### **Test Account Credentials**

```
Email: tester@hootner.com
Password: Test123!@#
```

### **API Key (if applicable)**

```
X-API-Key: test_key_provided_by_admin
```

### **Get Test Token**

```bash
curl -X POST https://p5huox4j01.execute-api.us-east-1.amazonaws.com/prod/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tester@hootner.com",
    "password": "Test123!@#"
  }'
```

---

## 📊 Monitoring & Logs

### **For Testers:**

- Report issues via GitHub Issues: `https://github.com/Hootner/hootner/issues`
- Include request/response details and timestamps

### **For Admins:**

View CloudWatch logs:

```bash
# API Gateway logs
aws logs tail /aws/apigateway/hootner-platform --follow

# Lambda function logs
aws logs tail /aws/lambda/hootner-platform-GraphQLFunction-KeWZcE3z6asL --follow
```

---

## 🌐 Network Requirements

### **Firewall Rules:**

- Allow outbound HTTPS (port 443)
- No special inbound rules needed for API testing

### **DNS:**

- Ensure `*.amazonaws.com` is not blocked
- No DNS configuration needed

---

## 🐛 Troubleshooting

### **Connection Issues:**

1. **"Missing Authentication Token"**
   - Check endpoint path is correct
   - Ensure route is configured in API Gateway

2. **CORS Errors:**

   ```javascript
   // Frontend config (admin fix)
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, OPTIONS
   ```

3. **Timeout:**
   - API Gateway timeout is 30s
   - Lambda timeout is 30s
   - Check CloudWatch logs for errors

4. **403 Forbidden:**
   - Check IAM permissions (admin)
   - Verify API key if required

---

## 📞 Support

**Questions?** Contact:

- GitHub Issues: https://github.com/Hootner/hootner/issues
- Email: support@hootner.com
- Slack: #hootner-testing

---

## 🎯 Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│              HOOTNER Testing Quick Reference            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Production API:                                        │
│  https://p5huox4j01.execute-api.us-east-1.amazonaws    │
│         .com/prod/                                      │
│                                                         │
│  Frontend (S3):                                         │
│  http://hootner-frontend-504165876439.s3-website       │
│         -us-east-1.amazonaws.com                        │
│                                                         │
│  Local Testing:                                         │
│  npm install && npm run dev                             │
│  http://localhost:3000                                  │
│                                                         │
│  GraphQL Playground:                                    │
│  /graphql endpoint                                      │
│                                                         │
│  Region: us-east-1                                      │
│  Environment: Production                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Ready to test!** 🚀 No AWS account needed for basic testing.
