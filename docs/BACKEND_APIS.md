# 🚀 Backend APIs - Complete Implementation

## ✅ Implemented Features

### 1. GraphQL Resolvers ✅

- Video queries with filtering and pagination
- User authentication (login, JWT)
- Comments persistence
- Likes persistence
- Real-time subscriptions

### 2. WebSocket Events ✅

- Video likes (real-time)
- Comments (real-time)
- Video processing updates
- Stream events
- User activity tracking

### 3. Database Schemas ✅

- User model with bcrypt password hashing
- Video model with embedded comments and likes
- MongoDB indexes for performance
- Relationships and population

---

## 📊 GraphQL API Examples

### Authentication

```graphql
# Login
mutation {
  login(email: "user@example.com", password: "password123") {
    success
    message
    token
    refreshToken
    user {
      id
      name
      email
    }
  }
}

# Create User
mutation {
  createUser(
    input: { email: "newuser@example.com", name: "New User", password: "securepass123" }
  ) {
    success
    message
    user {
      id
      email
    }
  }
}
```

### Video Operations

```graphql
# Get Videos (with filtering)
query {
  videos(
    filter: { status: READY, visibility: PUBLIC, search: "robot" }
    limit: 10
    offset: 0
  ) {
    edges {
      node {
        id
        title
        url
        views
        likes
        comments {
          id
          text
          user {
            name
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      totalCount
    }
  }
}

# Get Single Video
query {
  video(id: "video-id-123") {
    id
    title
    description
    url
    views
    likes
    comments {
      id
      text
      createdAt
      user {
        name
        avatar
      }
    }
  }
}

# My Videos
query {
  myVideos {
    id
    title
    status
    views
    likes
  }
}

# Trending Videos
query {
  trendingVideos(limit: 10) {
    id
    title
    views
    likes
  }
}
```

### Comments & Likes

```graphql
# Like Video
mutation {
  likeVideo(videoId: "video-id-123") {
    success
    message
    video {
      id
      likes
    }
  }
}

# Add Comment
mutation {
  addComment(videoId: "video-id-123", text: "Great video!") {
    success
    message
    video {
      id
      comments {
        id
        text
        user {
          name
        }
        createdAt
      }
    }
  }
}

# Delete Comment
mutation {
  deleteComment(videoId: "video-id-123", commentId: "comment-id-456") {
    success
    message
  }
}
```

### Real-time Subscriptions

```graphql
# Subscribe to Video Likes
subscription {
  videoLiked(videoId: "video-id-123") {
    video {
      id
      likes
    }
    timestamp
  }
}

# Subscribe to Comments
subscription {
  commentAdded(videoId: "video-id-123") {
    video {
      id
    }
    comment {
      id
      text
      user {
        name
      }
      createdAt
    }
    timestamp
  }
}

# Subscribe to Video Processing
subscription {
  videoProgress(videoId: "video-id-123") {
    videoId
    progress
    status
    message
  }
}
```

---

## 🔌 WebSocket Integration

### Client Setup

```javascript
import { WebSocketLink } from '@apollo/client/link/ws'
import { split, HttpLink } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'

// HTTP connection
const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
})

// WebSocket connection
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    reconnect: true,
    connectionParams: {
      authorization: `Bearer ${token}`,
    },
  },
})

// Split based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)
```

### Subscribe to Events

```javascript
// Subscribe to likes
const { data } = useSubscription(
  gql`
    subscription OnVideoLiked($videoId: ID!) {
      videoLiked(videoId: $videoId) {
        video {
          id
          likes
        }
        timestamp
      }
    }
  `,
  {
    variables: { videoId: 'video-123' },
  }
)

// Subscribe to comments
const { data } = useSubscription(
  gql`
    subscription OnCommentAdded($videoId: ID!) {
      commentAdded(videoId: $videoId) {
        comment {
          id
          text
          user {
            name
            avatar
          }
          createdAt
        }
      }
    }
  `,
  {
    variables: { videoId: 'video-123' },
  }
)
```

---

## 💾 Database Schemas

### User Schema

```javascript
{
  email: String (unique, required),
  name: String (required),
  password: String (hashed with bcrypt),
  avatar: String,
  subscription: Enum ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'],
  role: Enum ['USER', 'CREATOR', 'MODERATOR', 'ADMIN'],
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Video Schema

```javascript
{
  title: String (required),
  description: String,
  url: String,
  thumbnailUrl: String,
  duration: Number,
  status: Enum ['UPLOADING', 'PROCESSING', 'READY', 'FAILED', 'DELETED'],
  visibility: Enum ['PUBLIC', 'UNLISTED', 'PRIVATE'],
  views: Number (default: 0),
  likes: [ObjectId] (references User),
  comments: [{
    userId: ObjectId (required),
    text: String (required),
    createdAt: DateTime
  }],
  userId: ObjectId (required, references User),
  resolution: String,
  format: String,
  size: Number,
  metadata: Mixed,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Indexes

```javascript
// User indexes
{ email: 1 } (unique)
{ createdAt: -1 }

// Video indexes
{ userId: 1, createdAt: -1 } (compound)
{ status: 1 }
{ visibility: 1 }
```

---

## 🔐 Authentication Flow

```javascript
// 1. Login
const { data } = await client.mutate({
  mutation: LOGIN_MUTATION,
  variables: { email, password },
})

// 2. Store token
localStorage.setItem('token', data.login.token)

// 3. Add to requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

// 4. Use in client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})
```

---

## 📡 API Endpoints

| Endpoint   | Method | Description                   |
| ---------- | ------ | ----------------------------- |
| `/graphql` | POST   | GraphQL queries and mutations |
| `/graphql` | WS     | GraphQL subscriptions         |
| `/health`  | GET    | Health check                  |
| `/metrics` | GET    | Performance metrics           |

---

## 🧪 Testing Examples

```bash
# Test GraphQL endpoint
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ health { status } }"}'

# Test with authentication
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "{ myVideos { id title } }"}'
```

---

## 🚀 Integration with Frontend

### Cinema Player Integration

```javascript
// Fetch video data
const { data, loading } = useQuery(GET_VIDEO, {
  variables: { id: videoId },
})

// Like video
const [likeVideo] = useMutation(LIKE_VIDEO)

// Add comment
const [addComment] = useMutation(ADD_COMMENT)

// Subscribe to real-time updates
useSubscription(VIDEO_LIKED_SUBSCRIPTION, {
  variables: { videoId },
  onSubscriptionData: ({ subscriptionData }) => {
    // Update UI with new like count
  },
})
```

---

## ✅ Implementation Status

- [x] User authentication (JWT)
- [x] Video CRUD operations
- [x] Comments persistence
- [x] Likes persistence
- [x] Real-time WebSocket subscriptions
- [x] Database schemas with indexes
- [x] GraphQL resolvers
- [x] Error handling
- [x] Authorization checks

---

**All backend APIs are ready for frontend integration!** 🎉
