# 🗺️ HOOTNER Development Deployment Map

## 🚀 Server Architecture

### Port Allocation
```
Port 3000  → HTML Pages Server (serve-html.js)
Port 3005  → React Dashboard (Vite dev server)
Port 4000  → GraphQL API + REST endpoints
Port 27017 → MongoDB Database
Port 6379  → Redis Cache
```

## 📍 Service Endpoints

### 🔐 Authentication & Entry Points
- **Login/Register**: `http://localhost:3000/` (Root entry point)
- **React Dashboard**: `http://localhost:3005/` (Post-login landing)

### 🛒 E-commerce & Marketplace
- **Marketplace Feed**: `http://localhost:3000/marketplace`
- **Product API**: `http://localhost:4000/api/marketplace/products`
- **Checkout API**: `http://localhost:4000/api/marketplace/checkout`
- **Contact Seller**: `http://localhost:4000/api/marketplace/contact-seller`

### 💬 Messaging & Communication
- **Messages App**: `http://localhost:3000/messages`
- **Conversations API**: `http://localhost:4000/api/messages/conversations`
- **Send Message API**: `http://localhost:4000/api/messages/send`
- **Contact Form**: `http://localhost:3000/contact`
- **Contact API**: `http://localhost:4000/api/contact`

### 🤝 Collaboration & Management
- **Real-time Collaboration**: `http://localhost:3000/collaboration`
- **AI Agent Management**: `http://localhost:3000/agent-management`
- **DevOps Monitoring**: `http://localhost:3000/devops-monitoring`

### 🎬 Media & Content
- **Video Player**: `http://localhost:3000/video-player`
- **Code Editor**: `http://localhost:3000/code-editor`
- **Social Feed**: `http://localhost:3000/feed`

### 📊 Analytics & Data
- **GraphQL Playground**: `http://localhost:4000/graphql`
- **Health Check**: `http://localhost:4000/health`
- **Metrics**: `http://localhost:4000/metrics`

## 🔄 Data Flow Architecture

### Authentication Flow
```
1. User → localhost:3000/ (Login)
2. Auth Success → localStorage tokens
3. Redirect → localhost:3005 (React Dashboard)
4. Protected Pages → Check tokens → Allow/Redirect
```

### Marketplace Flow
```
1. Browse → localhost:3000/marketplace
2. Products → API: localhost:4000/api/marketplace/products
3. Contact Seller → API: localhost:4000/api/marketplace/contact-seller
4. Checkout → API: localhost:4000/api/marketplace/checkout → Stripe
```

### Messaging Flow
```
1. Messages → localhost:3000/messages
2. Conversations → API: localhost:4000/api/messages/conversations
3. Send Message → API: localhost:4000/api/messages/send
4. Real-time → Socket.IO (when implemented)
```

## 🗄️ Database Schema

### MongoDB Collections
```
- products (marketplace items)
- orders (purchase transactions)
- conversations (message threads)
- messages (individual messages)
- contacts (contact form submissions)
- users (user accounts - future)
```

### Key Models
- **Product**: name, price, category, thumbnail, preview, verified
- **Order**: userId, items[], total, status, stripeSessionId
- **Message**: conversationId, senderId, text, type, readBy[]
- **Conversation**: participants[], type, lastMessage, lastMessageAt

## 🛠️ Development Commands

### Start All Services
```bash
# Terminal 1: MongoDB + Redis
docker-compose up -d

# Terminal 2: HTML Pages Server
node serve-html.js

# Terminal 3: GraphQL API Server
cd api/graphql && npm start

# Terminal 4: React Dashboard (if needed)
cd apps/frontend && npm run dev

# Terminal 5: Seed Database (optional)
cd api/graphql && node seed.js
```

### Individual Services
```bash
# HTML Server only
node serve-html.js

# API Server only
cd api/graphql && npm start

# Database only
docker-compose up -d mongodb redis

# Seed products
cd api/graphql && node seed.js
```

## 📁 File Structure Map

### Frontend Pages
```
hexarchy/4-interface/ui/pages/
├── login.html           → Root entry point
├── marketplace.html     → E-commerce feed
├── messages.html        → Chat application
├── contact.html         → Contact form
├── collaboration.html   → Real-time collab
├── agent-management.html → AI agents
├── devops-monitoring.html → DevOps dashboard
├── dashboard.html       → HTML dashboard
├── video-player.html    → Media player
└── code-editor.html     → Code editor
```

### Backend API
```
api/graphql/
├── server.js           → Main API server
├── db.js              → MongoDB connection
├── models/            → Database schemas
│   ├── Product.js     → Marketplace products
│   ├── Order.js       → Purchase orders
│   ├── Message.js     → Chat messages
│   ├── Conversation.js → Message threads
│   └── Contact.js     → Contact submissions
├── routes/            → REST API endpoints
│   ├── marketplace.js → E-commerce API
│   ├── messages.js    → Chat API
│   └── contact.js     → Contact API
└── seed.js           → Database seeder
```

### Shared Components
```
hexarchy/4-interface/ui/components/
├── header-enhanced.js   → Navigation header
├── footer-enhanced.js   → Site footer
└── auth-guard.js       → Route protection
```

## 🔐 Security Implementation

### Authentication System
- **Entry Point**: `localhost:3000/` (login page)
- **Token Storage**: localStorage + sessionStorage
- **Protected Routes**: All pages except login
- **Redirect Flow**: auth-guard.js → sessionStorage → login → back

### API Security
- **CORS**: Configured for localhost origins
- **Rate Limiting**: 100 requests per 15 minutes
- **Helmet.js**: Security headers
- **Input Validation**: Email, username, password formats

## 🚀 Deployment Readiness

### Environment Variables
```bash
# API Server
PORT=4000
MONGODB_URI=mongodb://localhost:27017/hootner
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:3000

# Frontend
VITE_API_URL=http://localhost:4000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### Production Considerations
- [ ] JWT token implementation
- [ ] Token expiration (24h TTL)
- [ ] Password hashing (bcrypt)
- [ ] Email verification
- [ ] Rate limiting per user
- [ ] HTTPS certificates
- [ ] Environment-specific configs
- [ ] Database migrations
- [ ] Backup strategies
- [ ] Monitoring & logging

## 📊 Feature Status

### ✅ Implemented
- Authentication system with route protection
- Marketplace with infinite scroll feed
- Product thumbnails and preview modals
- Shopping cart with localStorage persistence
- Contact seller messaging
- Real-time messaging app interface
- Contact form with backend storage
- MongoDB integration with REST APIs
- Stripe checkout simulation

### 🚧 In Progress
- Socket.IO real-time messaging
- User registration backend
- Order processing workflow
- Email notifications

### 📋 Planned
- JWT token validation
- User profile management
- Admin dashboard
- Analytics integration
- Mobile responsiveness
- PWA features

## 🔗 Integration Points

### External Services
- **Stripe**: Payment processing (test mode)
- **Socket.IO**: Real-time messaging (ready)
- **MongoDB**: Primary database
- **Redis**: Caching and sessions

### Internal APIs
- **GraphQL**: `localhost:4000/graphql`
- **REST Marketplace**: `localhost:4000/api/marketplace/*`
- **REST Messages**: `localhost:4000/api/messages/*`
- **REST Contact**: `localhost:4000/api/contact`

## 📝 Development Notes

### Current Limitations
- No user registration backend (frontend only)
- Mock Stripe integration (no real payments)
- No email sending (console logs only)
- No file upload for product images
- No real-time Socket.IO connection

### Next Steps for Production
1. Implement JWT authentication with backend
2. Add user registration API
3. Connect real Stripe webhooks
4. Add email service (SendGrid/AWS SES)
5. Implement file upload for images
6. Add Socket.IO real-time features
7. Set up production database
8. Configure CI/CD pipeline

---

**Last Updated**: January 2025  
**Status**: Development Ready  
**Next Milestone**: Production Backend Integration

## 🧭 Header Navigation Mapping

### Current Header Links (header-enhanced.js)
```
🤝 Collaborate    → /collaboration     → localhost:3000/collaboration
🤖 AI Agents      → /agent-management  → localhost:3000/agent-management  
⚙️ DevOps         → /devops-monitoring → localhost:3000/devops-monitoring
📊 Analytics      → /analytics         → NOT IMPLEMENTED
🛒 Marketplace    → /marketplace       → localhost:3000/marketplace
📊 Dashboard      → /dashboard         → localhost:3000/dashboard (HTML) OR localhost:3005 (React)
🎬 Video          → /video-player      → localhost:3000/video-player
💻 Code           → /code-editor       → localhost:3000/code-editor
```

### Missing Pages That Need Creation
- **Analytics Page**: `/analytics` → Should show charts, metrics, user data
- **Profile Page**: User menu links to profile (not in main nav)
- **Settings Page**: User menu links to settings (not in main nav)

### Recommended Header Link Updates
```javascript
// Current header links should be:
{ text: '🤝 Collaborate', href: '/collaboration' },      // ✅ EXISTS
{ text: '🤖 AI Agents', href: '/agent-management' },     // ✅ EXISTS  
{ text: '⚙️ DevOps', href: '/devops-monitoring' },       // ✅ EXISTS
{ text: '📊 Analytics', href: '/analytics' },            // ❌ NEEDS CREATION
{ text: '🛒 Marketplace', href: '/marketplace' },        // ✅ EXISTS
{ text: '💬 Messages', href: '/messages' },              // ✅ EXISTS (should add to header)
{ text: '📧 Contact', href: '/contact' },                // ✅ EXISTS (should add to header)
{ text: '🎬 Video', href: '/video-player' },             // ✅ EXISTS
{ text: '💻 Code', href: '/code-editor' }                // ✅ EXISTS
```

### User Menu Links (Dropdown)
```javascript
// User menu should include:
{ text: '👤 Profile', href: '/profile' },               // ❌ NEEDS CREATION
{ text: '⚙️ Settings', href: '/settings' },             // ❌ NEEDS CREATION  
{ text: '🚪 Logout', action: 'logout' }                 // ✅ EXISTS
```