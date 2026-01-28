# AWS Application Composer - Import Instructions

## Steps to Connect APIs to DB in Composer:

1. **AWS Composer is now open in your browser**

2. **Import Template:**
   - Click "Import template"
   - Select: `template.yaml` from project root
   - Composer will visualize all connections

3. **Visual Connections (Auto-configured):**
   ```
   20 Lambda Functions → DynamoDB (HootnerActivities)
   20 Lambda Functions → Secrets Manager (hootner/api-keys)
   20 Lambda Functions → API Gateway (with API Key)
   1 Lambda Layer → All 20 Functions
   ```

4. **Deploy from Composer:**
   - Click "Deploy" button
   - Select AWS account (504165876439)
   - Stack name: hootner-platform
   - Click "Deploy"

5. **Get API Key:**
   - After deployment, check Outputs tab
   - Copy "ApiKey" value
   - Use in CloudFront apps

## Current Template Path:
`c:\Users\12182\Projects\my-local-repo\template.yaml`

## All 20 CloudFront Apps Connected:
✅ video-player.html → /api/videos
✅ ai-video.html → /api/ai-video
✅ live-stream.html → /api/live-stream
✅ code-editor.html → /api/editor
✅ ultra-editor.html → /api/editor
✅ auto-editor.html → /api/editor
✅ collaboration.html → /api/collaboration
✅ messages.html → /api/messages
✅ analytics.html → /api/analytics
✅ marketplace.html → /api/marketplace
✅ agent-management.html → /api/agents
✅ devops-monitoring.html → /api/devops
✅ design-showcase.html → /api/design
✅ feed-react.html → /api/feed
✅ live-activity.html → /api/activity
✅ profile.html → /api/profile
✅ settings.html → /api/settings
✅ contact.html → /api/contact
✅ dashboard.html → /api/dashboard
✅ login.html → /api/login
