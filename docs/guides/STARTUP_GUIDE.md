# 🚀 HOOTNER Complete Startup Guide

## Status: ✅ EVERYTHING IS READY

All infrastructure, services, and code are in place. Follow these steps to launch the **complete platform**.

---

## 🎬 Quick Start (3 Commands)

```bash
# Terminal 1: Start Docker (MongoDB + Redis)
docker-compose -f docker-compose.dev.yml up -d

# Terminal 2: Start GraphQL API + Services
npm run start:backend

# Terminal 3: Already running - Video Player
# http://localhost:3005/video-player ✅ LIVE
# http://localhost:3005/live-activity ✅ LIVE
# http://localhost:3005/dashboard ✅ LIVE
```

---

## 📋 Full Startup Sequence

### Step 1: Start Infrastructure (MongoDB + Redis)

```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Expected Output:**

```
hootner-mongodb-dev is up to date
hootner-redis-dev is up to date
```

**Verify:**

```bash
docker ps
# Should show:
# hootner-mongodb-dev (port 27017)
# hootner-redis-dev   (port 6379)
```

---

### Step 2: Start Backend Services

```bash
npm run start:backend
```

**Services Starting:**

- ✅ GraphQL API Server (:4000)
- ✅ Real-time Subscriptions (WebSocket)
- ✅ Video Generation Service (:5003)
- ✅ Event Pipeline
- ✅ Agent Hub

**Expected Logs:**

```
🦉 HOOTNER Backend Services Orchestrator
📊 Checking infrastructure services...
✅ MongoDB detected on port 27017
✅ Redis detected on port 6379
🚀 Starting GraphQL API...
   [GraphQL API] ✅ Server running on http://localhost:4000/graphql
🚀 Starting Video Generation...
   [Video Gen] ✅ API running on http://localhost:5003
```

---

### Step 3: Frontend Already Running

```
Video Player: http://localhost:3005/video-player
Dashboard:    http://localhost:3005/dashboard
Live Activity: http://localhost:3005/live-activity
```

---

## 🔌 Connection Points

### Live Activity Page ↔ Backend

Once backend is running, **live-activity.html** will:

1. Detect GraphQL API at `http://localhost:4000/graphql`
2. Subscribe to real events via WebSocket
3. Display actual system events instead of demo data
4. Show: deployments, security scans, AI agent actions, user activity

### What You'll See

- 🎥 Real video uploads from users
- 🚀 Actual deployment events
- 🤖 AI Agent "SecurityBot" running
- 💰 Real payment processing
- 🔐 Real security scans
- ⚡ Infrastructure auto-scaling events

---

## 🛠️ Available Commands

| Command                                       | Purpose                     |
| --------------------------------------------- | --------------------------- |
| `npm run start:backend`                       | Start all backend services  |
| `docker-compose -f docker-compose.dev.yml up` | Start MongoDB + Redis       |
| `npm run backend:validate`                    | Verify all services healthy |
| `npm run db:optimize`                         | Optimize databases          |
| `npm run security:audit`                      | Run security checks         |

---

## ✨ What This Accomplishes

### Before (Current State)

```
Frontend ✅ → Demo Data (simulated)
Dashboard ✅ → Mock stats
Live Activity ✅ → Fake events
```

### After (Once Backend Running)

```
Frontend ✅ → Video Library with REAL videos
Dashboard ✅ → REAL analytics from database
Live Activity ✅ → REAL events from orchestration
        ↓
   🎬 Complete Enterprise Platform
```

---

## 🔍 Verification Checklist

After running startup commands, verify:

- [ ] Docker containers running: `docker ps`
- [ ] MongoDB accessible: Connect to `mongodb://localhost:27017`
- [ ] Redis accessible: `redis-cli -p 6379`
- [ ] GraphQL API: `curl http://localhost:4000/graphql`
- [ ] Video Player loads: `http://localhost:3005/video-player`
- [ ] Live Activity shows real events (instead of demo)
- [ ] Dashboard displays real stats

---

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 4000
lsof -i :4000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 6379
lsof -i :6379 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Docker Not Running

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Services Won't Start

```bash
# Check npm dependencies
npm install

# Check GraphQL dependencies
cd api/graphql && npm install && cd ../..

# Restart
npm run start:backend
```

---

## 📊 Dashboard After Startup

Once everything is running, you'll have:

| Component     | Status          | Location            |
| ------------- | --------------- | ------------------- |
| Video Player  | ✅ Live         | :3005/video-player  |
| Dashboard     | ✅ Live         | :3005/dashboard     |
| Live Activity | ✅ **Now REAL** | :3005/live-activity |
| GraphQL API   | ✅ Live         | :4000/graphql       |
| Subscriptions | ✅ Live         | ws://localhost:4000 |
| Video Gen API | ✅ Live         | :5003               |
| MongoDB       | ✅ Live         | :27017              |
| Redis         | ✅ Live         | :6379               |

---

## 🎯 Final Result

**A complete enterprise video streaming platform with:**

- ✅ Real-time video player with AI features
- ✅ Live activity monitoring dashboard
- ✅ Real-time event streaming
- ✅ Analytics and KPI tracking
- ✅ Security monitoring
- ✅ Infrastructure status
- ✅ Multi-agent orchestration
- ✅ Production-ready architecture

**All running on your local machine! 🚀**
