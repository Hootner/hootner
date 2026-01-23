/**
 * Enhanced GraphQL Server with Apollo Server
 * Real-time subscriptions, error boundaries, and comprehensive features
 *
 * Author: HOOTNER Code Guardian
 * Date: January 10, 2026
 */

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
const require = createRequire(import.meta.url)

const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { createServer } = require('http')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const helmet = require('helmet')

// ESM-friendly __dirname replacement
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import resolvers and utilities
const resolvers = require('./resolvers').default
const { getUserFromRequest } = require('./utils/auth')
const { formatError } = require('./utils/errorBoundary')

// Load GraphQL schema
const typeDefs = fs.readFileSync(
  path.join(__dirname, 'schema-enhanced.graphql'),
  'utf8'
)

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

// Initialize Express
const app = express()
const httpServer = createServer(app)

// ==================== MIDDLEWARE ====================

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
  })
)

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://hootner.com',
    'https://studio.apollographql.com',
  ],
  credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// ==================== WEBSOCKET SERVER ====================

// Create WebSocket server for subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
})

// WebSocket connection handling
const serverCleanup = useServer(
  {
    schema,
    context: async (ctx) => {
      // Get user from connection params (for subscriptions)
      const token = ctx.connectionParams?.authorization?.replace('Bearer ', '')

      if (token) {
        try {
          const { verifyToken } = require('./utils/auth')
          const decoded = verifyToken(token)

          return {
            user: {
              id: decoded.id,
              email: decoded.email,
              role: decoded.role || 'USER',
            },
          }
        } catch (error) {
          console.error('WebSocket auth error:', error)
        }
      }

      return {}
    },
    onConnect: async () => {
      console.log('🔌 Client connected to WebSocket')
    },
    onDisconnect: async () => {
      console.log('🔌 Client disconnected from WebSocket')
    },
  },
  wsServer
)

// ==================== APOLLO SERVER ====================

// Create Apollo Server
const apolloServer = new ApolloServer({
  schema,

  // Context function for HTTP requests
  context: async ({ req, res }) => {
    const user = await getUserFromRequest(req)

    return {
      req,
      res,
      user,
    }
  },

  // Error formatting
  formatError,

  // Enable introspection and playground in development
  introspection: true,

  // Plugins
  plugins: [
    // Drain HTTP server on shutdown
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Custom logging plugin
    {
      async requestDidStart() {
        const start = Date.now()

        return {
          async willSendResponse(responseContext) {
            const duration = Date.now() - start
            console.log(
              `⚡ ${responseContext.operationName || 'Anonymous'} completed in ${duration}ms`
            )
          },

          async didEncounterErrors(errorContext) {
            console.error('GraphQL Errors:', errorContext.errors)
          },
        }
      },
    },

    // Shutdown cleanup
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          },
        }
      },
    },
  ],

  // Enable file uploads
  uploads: {
    maxFileSize: 100000000, // 100 MB
    maxFiles: 10,
  },
})

// ==================== HEALTH CHECKS ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    services: {
      graphql: 'running',
      websocket: 'running',
      subscriptions: 'enabled',
    },
  })
})

app.get('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
  })
})

app.get('/ready', (req, res) => {
  res.json({ ready: true })
})

// ==================== START SERVER ====================

async function startServer() {
  try {
    // Start Apollo Server
    await apolloServer.start()

    // Apply Apollo middleware
    apolloServer.applyMiddleware({
      app,
      path: '/graphql',
      cors: corsOptions,
    })

    // Start HTTP server
    const PORT = process.env.PORT || 4000

    httpServer.listen(PORT, () => {
      console.log('\n' + '='.repeat(60))
      console.log('🦉 HOOTNER GraphQL Server')
      console.log('='.repeat(60))
      console.log(
        `\n🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
      )
      console.log(
        `🔌 Subscriptions ready at ws://localhost:${PORT}${apolloServer.graphqlPath}`
      )
      console.log(`📊 Health check: http://localhost:${PORT}/health`)
      console.log(`📈 Metrics: http://localhost:${PORT}/metrics`)
      console.log('\n✨ Features:')
      console.log('   • Real-time subscriptions (WebSocket)')
      console.log('   • Error boundaries & validation')
      console.log('   • Authentication & authorization')
      console.log('   • Rate limiting')
      console.log('   • File uploads')
      console.log('   • Video generation integration')
      console.log('   • Live streaming support')
      console.log('\n' + '='.repeat(60) + '\n')
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// ==================== GRACEFUL SHUTDOWN ====================

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')

  await apolloServer.stop()
  await serverCleanup.dispose()
  httpServer.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...')

  await apolloServer.stop()
  await serverCleanup.dispose()
  httpServer.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

// Start the server
startServer()

export { app, apolloServer, httpServer }
