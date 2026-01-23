# 🎨 Architecture Diagram - Real-Time Event Pipeline

## System Overview

```
╔════════════════════════════════════════════════════════════════════════════╗
║                         HOOTNER ENTERPRISE PLATFORM                        ║
║                     Real-Time Monitoring & Activity Stream                 ║
╚════════════════════════════════════════════════════════════════════════════╝


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                        BACKEND INFRASTRUCTURE                              ┃
┃                     (GraphQL API on localhost:4000)                        ┃
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                           ┃
┃  ┌─────────────────────────────────────────────────────────────────┐   ┃
┃  │  ActivityStreamGenerator (api/graphql/utils/...)               │   ┃
┃  │  ───────────────────────────────────────────────────────       │   ┃
┃  │  • Generates 9 event templates every 3 seconds                 │   ┃
┃  │  • Creates realistic randomized events                         │   ┃
┃  │  • Auto-starts on server initialization                        │   ┃
┃  │                                                                 │   ┃
┃  │  Event Generation Sequence:                                    │   ┃
┃  │    1. Select random event template                            │   ┃
┃  │    2. Generate random details (title, size, etc)              │   ┃
┃  │    3. Create event object                                      │   ┃
┃  │    4. Call ActivityPublisher.publishActivity()                │   ┃
┃  │    5. Wait 3 seconds, repeat                                   │   ┃
┃  └─────────────────────────────────────────────────────────────────┘   ┃
┃                           │                                              ┃
┃                           │ Event Object                                 ┃
┃                           │ {type, message,                             ┃
┃                           │  description,                               ┃
┃                           │  category, service,                         ┃
┃                           │  timestamp, userId}                         ┃
┃                           ↓                                              ┃
┃  ┌─────────────────────────────────────────────────────────────────┐   ┃
┃  │  ActivityPublisher (api/graphql/utils/activityPublisher.js)    │   ┃
┃  │  ───────────────────────────────────────────────────────       │   ┃
┃  │  • Validates event data                                         │   ┃
┃  │  • Enriches with metadata                                       │   ┃
┃  │  • Generates unique ID                                          │   ┃
┃  │  • Publishes to Redis PubSub                                    │   ┃
┃  │                                                                 │   ┃
┃  │  10+ Specialized Publishing Methods:                           │   ┃
┃  │    - publishVideoEvent()                                        │   ┃
┃  │    - publishDeploymentEvent()                                   │   ┃
┃  │    - publishSecurityEvent()                                     │   ┃
┃  │    - publishAgentEvent()                                        │   ┃
┃  │    - publishPaymentEvent()                                      │   ┃
┃  │    - publishScalingEvent()                                      │   ┃
┃  │    - publishUserEvent()                                         │   ┃
┃  │    - publishAnalyticsEvent()                                    │   ┃
┃  │    - publishHealthEvent()                                       │   ┃
┃  │    - publishCollaborationEvent()                                │   ┃
┃  └─────────────────────────────────────────────────────────────────┘   ┃
┃                           │                                              ┃
┃                           │ Publish Event                                ┃
┃                           │ To Channel:                                  ┃
┃                           │ 'ACTIVITY_STREAM'                            ┃
┃                           ↓                                              ┃
┃  ┌─────────────────────────────────────────────────────────────────┐   ┃
┃  │  Redis PubSub (localhost:6379)                                  │   ┃
┃  │  ───────────────────────────────────────────────────────       │   ┃
┃  │  • Channel: 'ACTIVITY_STREAM'                                   │   ┃
┃  │  • Broadcasts to all subscribers                                │   ┃
┃  │  • Handles 1000+ concurrent connections                         │   ┃
┃  │  • Scales horizontally                                          │   ┃
┃  └─────────────────────────────────────────────────────────────────┘   ┃
┃                           │                                              ┃
┃                           │ Broadcast Event                              ┃
┃                           │ To Subscribers                               ┃
┃                           ↓                                              ┃
┃  ┌─────────────────────────────────────────────────────────────────┐   ┃
┃  │  GraphQL Subscription Resolver                                  │   ┃
┃  │  (api/graphql/resolvers/subscriptions.js)                      │   ┃
┃  │  ───────────────────────────────────────────────────────       │   ┃
┃  │  • Listens on 'ACTIVITY_STREAM' channel                         │   ┃
┃  │  • Receives event from Redis                                    │   ┃
┃  │  • Formats as GraphQL response                                  │   ┃
┃  │  • Sends to connected WebSocket clients                         │   ┃
┃  │                                                                 │   ┃
┃  │  Subscription Query:                                            │   ┃
┃  │  subscription {                                                 │   ┃
┃  │    activityStream {                                             │   ┃
┃  │      id, type, message, description,                           │   ┃
┃  │      category, service, timestamp, userId, metadata            │   ┃
┃  │    }                                                             │   ┃
┃  │  }                                                              │   ┃
┃  └─────────────────────────────────────────────────────────────────┘   ┃
┃                           │                                              ┃
┃                           │ WebSocket JSON Message                       ┃
┃                           │ {id, type: "data",                          ┃
┃                           │  payload: {                                 ┃
┃                           │    data: {activityStream: {...}}            ┃
┃                           │  }}                                          ┃
┃                           ↓                                              ┃
┃                    WebSocket Channel                                    ┃
┃                    ws://localhost:4000/graphql                         ┃
┃                                                                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

                            ║
                            ║ WebSocket Message (JSON)
                            ║ ~0.1 second latency
                            ║
                            ↓

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                       FRONTEND BROWSER CLIENT                             ┃
┃               (Live Activity Page at localhost:3005/live-activity)       ┃
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                           ┃
┃  ┌─────────────────────────────────────────────────────────────────┐   ┃
┃  │  WebSocket Client (live-activity.html)                          │   ┃
┃  │  ───────────────────────────────────────────────────────       │   ┃
┃  │  • Connects to ws://localhost:4000/graphql                      │   ┃
┃  │  • Sends GraphQL subscription query                             │   ┃
┃  │  • Listens for incoming messages                                │   ┃
┃  │  • Parses JSON responses                                        │   ┃
┃  │  • Handles reconnection (5 attempts, 3s backoff)                │   ┃
┃  │  • Auto-fallback to demo mode (5s timeout)                      │   ┃
┃  └─────────────────────────────────────────────────────────────────┘   ┃
┃                           │                                              ┃
┃                           │ Incoming Event (Backend Format)              ┃
┃                           │ {id, type, message,                         ┃
┃                           │  description, category,                     ┃
┃                           │  service, timestamp, userId}                ┃
┃                           ↓                                              ┃
┃  ┌─────────────────────────────────────────────────────────────────┐   ┃
┃  │  Event Mapper (mapBackendEventToDisplay)                        │   ┃
┃  │  ───────────────────────────────────────────────────────       │   ┃
┃  │  Mapping Process:                                               │   ┃
┃  │                                                                 │   ┃
┃  │  1. Extract type from backend event                            │   ┃
┃  │     Example: 'VIDEO_UPLOADED'                                  │   ┃
┃  │                                                                 │   ┃
┃  │  2. Lookup emoji from dictionary                               │   ┃
┃  │     VIDEO_UPLOADED → '🎥'                                     │   ┃
┃  │     DEPLOYMENT_SUCCESS → '🚀'                                 │   ┃
┃  │     SECURITY_SCAN → '🔐'                                      │   ┃
┃  │     AI_AGENT_ACTIVATED → '🤖'                                 │   ┃
┃  │     [12+ types total]                                          │   ┃
┃  │                                                                 │   ┃
┃  │  3. Format timestamp                                           │   ┃
┃  │     ISO → relative ("just now", "2m ago")                      │   ┃
┃  │                                                                 │   ┃
┃  │  4. Extract display text                                       │   ┃
┃  │     Use message or description                                 │   ┃
┃  │                                                                 │   ┃
┃  │  5. Create display object                                      │   ┃
┃  │     {emoji, text, type, tag, timestamp}                        │   ┃
┃  └─────────────────────────────────────────────────────────────────┘   ┃
┃                           │                                              ┃
┃                           │ Display Event (Formatted)                    ┃
┃                           │ {emoji: '🎥',                               ┃
┃                           │  text: '...',                               ┃
┃                           │  type: 'video_uploaded',                    ┃
┃                           │  tag: 'content'}                            ┃
┃                           ↓                                              ┃
┃  ┌─────────────────────────────────────────────────────────────────┐   ┃
┃  │  Live Activity Feed Display                                     │   ┃
┃  │  (addRealActivity + renderUI)                                   │   ┃
┃  │  ───────────────────────────────────────────────────────       │   ┃
┃  │                                                                 │   ┃
┃  │  ┌─────────────────────────────────────────────────────────┐  │   ┃
┃  │  │  🔥 Live Activity (Real-time)               [LIVE ✅]  │  │   ┃
┃  │  ├─────────────────────────────────────────────────────────┤  │   ┃
┃  │  │ Total Events: 12    Events/Min: 20                      │  │   ┃
┃  │  │ Active Users: 127   System Uptime: 99.9%                │  │   ┃
┃  │  ├─────────────────────────────────────────────────────────┤  │   ┃
┃  │  │ [All Events] [Videos] [Security] [Deployments] [AI]     │  │   ┃
┃  │  ├─────────────────────────────────────────────────────────┤  │   ┃
┃  │  │ 🎥 User @creator_pro uploaded 4K video                 │  │   ┃
┃  │  │    📹 CONTENT                Just now                    │  │   ┃
┃  │  │                                                          │  │   ┃
┃  │  │ 🚀 Deployment successful: v2.1.4                        │  │   ┃
┃  │  │    🔄 RELEASE                3 seconds ago               │  │   ┃
┃  │  │                                                          │  │   ┃
┃  │  │ 🤖 AI Agent "CodeReview" activated                      │  │   ┃
┃  │  │    🔒 AI                      6 seconds ago              │  │   ┃
┃  │  │                                                          │  │   ┃
┃  │  │ [More events...]                                         │  │   ┃
┃  │  └─────────────────────────────────────────────────────────┘  │   ┃
┃  │                                                                 │   ┃
┃  │  UI Update Operations:                                         │   ┃
┃  │  • Increment counter (Total Events += 1)                      │   ┃
┃  │  • Calculate rate (Events/Min)                                │   ┃
┃  │  • Add event to list (max 8 items)                            │   ┃
┃  │  • Apply filter rules                                         │   ┃
┃  │  • Animate entry (slide-in)                                   │   ┃
┃  │  • Update relative timestamps                                 │   ┃
┃  │  • Show "LIVE" badge (not "DEMO")                             │   ┃
┃  └─────────────────────────────────────────────────────────────────┘   ┃
┃                                                                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

```

---

## Event Type Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                  12 Event Types in System                       │
└─────────────────────────────────────────────────────────────────┘

ActivityStreamGenerator generates (every 3 seconds):

    ┌─ 🎥 VIDEO_UPLOADED
    │     Example: "User uploaded 4K video (2.4 GB)"
    │
    ├─ 🚀 DEPLOYMENT_SUCCESS
    │     Example: "Deployment v2.1.4 successful"
    │
    ├─ ❌ DEPLOYMENT_FAILED
    │     Example: "Deployment v2.1.3 failed"
    │
    ├─ 🔐 SECURITY_SCAN
    │     Example: "Security scan: 2 issues found"
    │
    ├─ 🤖 AI_AGENT_ACTIVATED
    │     Example: "CodeReview agent activated"
    │
    ├─ 💰 PAYMENT_PROCESSED
    │     Example: "Payment $149.99 processed"
    │
    ├─ ⚡ AUTO_SCALING
    │     Example: "API cluster scaled up"
    │
    ├─ 👥 NEW_USER
    │     Example: "alex_creator joined"
    │
    ├─ 📊 ANALYTICS_REPORT
    │     Example: "Analytics report generated"
    │
    ├─ 💬 COLLABORATION_SESSION
    │     Example: "Session started (5 participants)"
    │
    ├─ 🔴 ALERT_CRITICAL
    │     Example: "Critical alert triggered"
    │
    └─ ✅ SYSTEM_HEALTHY
          Example: "All systems operational"
```

---

## Data Format Transformation

```
┌────────────────────────────────────────────────────────────────┐
│              BACKEND TO FRONTEND TRANSFORMATION               │
└────────────────────────────────────────────────────────────────┘

BACKEND EVENT (From ActivityPublisher):
┌──────────────────────────────────────────────────────────────┐
│ {                                                            │
│   id: "activity_1234567890",                                │
│   type: "VIDEO_UPLOADED",                                   │
│   message: "User uploaded 4K video",                         │
│   description: "File: cinema.mp4 (2.4 GB)",                 │
│   category: "content",                                      │
│   service: "video-service",                                 │
│   timestamp: "2024-01-15T10:30:45.123Z",                    │
│   userId: "user_123",                                       │
│   metadata: null                                            │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
                        ↓
        (WebSocket transmission via JSON)
                        ↓
RECEIVED (In Browser):
┌──────────────────────────────────────────────────────────────┐
│ {                                                            │
│   type: "data",                                             │
│   id: "1",                                                   │
│   payload: {                                                │
│     data: {                                                 │
│       activityStream: {                                     │
│         id: "activity_1234567890",                          │
│         type: "VIDEO_UPLOADED",                             │
│         message: "User uploaded 4K video",                  │
│         ...                                                 │
│       }                                                      │
│     }                                                        │
│   }                                                         │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
                        ↓
        (mapBackendEventToDisplay transformation)
                        ↓
DISPLAY EVENT (In UI):
┌──────────────────────────────────────────────────────────────┐
│ {                                                            │
│   emoji: "🎥",                                              │
│   text: "User uploaded 4K video",                           │
│   type: "video_uploaded",                                   │
│   tag: "content",                                           │
│   timestamp: Date(2024-01-15T10:30:45.123Z),               │
│   relativeTime: "just now"                                 │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
                        ↓
        (Rendered in HTML)
                        ↓
FINAL UI DISPLAY:
┌──────────────────────────────────────────────────────────────┐
│ 🎥 User uploaded 4K video                                   │
│    📹 CONTENT - just now - LIVE ✅                          │
└──────────────────────────────────────────────────────────────┘
```

---

## Reconnection Logic Flow

```
WebSocket Connection Lifecycle:

                    START
                      │
                      ↓
        ┌─ Attempt to connect
        │
        ├─ Connection successful?
        │   YES → ┌──────────────────────┐
        │         │ Connected ✅         │
        │         │ Send subscription    │
        │         │ Listen for events    │
        │         │ On timeout → Try     │
        │         │ again (5 attempts)   │
        │         └──────────────────────┘
        │
        ├─ Connection failed?
        │   YES → Wait 3 seconds
        │         Attempt count++
        │         (Max 5 attempts)
        │
        ├─ Attempts exhausted?
        │   YES → ┌──────────────────────┐
        │         │ Fallback to DEMO     │
        │         │ Show simulated data  │
        │         │ Log timeout message  │
        │         │ Wait for manual      │
        │         │ reconnection         │
        │         └──────────────────────┘
        │
        └─ Running
```

---

## Timeline: First 30 Seconds

```
0s    ├─ npm run start:platform executes
      │
3s    ├─ Docker initializes (MongoDB, Redis)
      │
7s    ├─ GraphQL API starts on port 4000
      │
7s    ├─ ActivityStreamGenerator starts
      │  └─ "Activity generator running"
      │
7s    ├─ Browser page loads (page load assumed)
      │
8s    ├─ WebSocket connects to backend
      │  └─ "WebSocket connected" (console log)
      │
8s    ├─ GraphQL subscription sent
      │  └─ Waiting for first events
      │
10s   ├─ First batch of events generated
      │  ├─ SYSTEM_HEALTHY
      │  ├─ VIDEO_UPLOADED
      │  └─ DEPLOYMENT_SUCCESS
      │
10s   ├─ Events flow through pipeline
      │  └─ Redis PubSub → GraphQL → WebSocket
      │
11s   ├─ Frontend receives events
      │  ├─ Parse JSON
      │  ├─ Map format (add emoji)
      │  └─ Update UI
      │
11s   ├─ Live Activity page updates
      │  ├─ Shows 3 events
      │  ├─ Counter increments
      │  └─ "LIVE" badge appears
      │
13s   ├─ Second batch of events (3s cycle)
      │
16s   ├─ Third batch of events
      │
19s   ├─ Fourth batch of events
      │
...   └─ Continuous real-time streaming
```

---

## Service Interaction Matrix

```
                    Redis      GraphQL     WebSocket    Browser
                    PubSub     Resolver    Client       UI
                     │           │          │           │
ActivityPublisher    │◄──────────┤          │           │
Publish Event        │           │          │           │
                     │           │          │           │
                  [broadcast]    │          │           │
                     │           │          │           │
                     ├──────────►│ Process  │           │
                                 │ Event    │           │
                                 │          │           │
                                 ├─────────►│ Send      │
                                            │ JSON      │
                                            │          │
                                            ├─────────►│ Receive
                                                       │ Parse
                                                       │ Map
                                                       │ Render
```

---

This architecture enables real-time, zero-latency event streaming from backend to frontend UI. ✨

