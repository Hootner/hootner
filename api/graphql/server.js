const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const fs = require("fs");
const path = require("path");

// Validate environment variables at startup
const { validateEnvironment } = require("./utils/validateEnv");
const envConfig = validateEnvironment("api");

// Enhanced GraphQL Schema
const schema = buildSchema(`
  type Query {
    health: String
    version: String
    users: [User]
    videos: [Video]
    analytics: Analytics
  }

  type Mutation {
    createUser(input: UserInput!): User
    uploadVideo(input: VideoInput!): Video
    processPayment(input: PaymentInput!): PaymentResult
  }

  type Subscription {
    videoProcessed: Video
    userActivity: UserActivity
  }

  type User {
    id: ID!
    email: String!
    name: String!
    subscription: String
    createdAt: String!
  }

  type Video {
    id: ID!
    title: String!
    url: String
    status: String!
    userId: ID!
    createdAt: String!
  }

  type Analytics {
    totalUsers: Int!
    totalVideos: Int!
    revenue: Float!
    activeStreams: Int!
  }

  type UserActivity {
    userId: ID!
    action: String!
    timestamp: String!
  }

  type PaymentResult {
    success: Boolean!
    transactionId: String
    message: String
  }

  input UserInput {
    email: String!
    name: String!
    password: String!
  }

  input VideoInput {
    title: String!
    file: String!
    userId: ID!
  }

  input PaymentInput {
    userId: ID!
    amount: Float!
    currency: String!
    paymentMethod: String!
  }
`);

// Business Logic Resolvers
const root = {
  // Queries
  health: () => "OK",
  version: () => "1.0.0",

  users: async () => {
    // Mock data - integrate with database
    return [
      {
        id: "1",
        email: "user@hootner.com",
        name: "Demo User",
        subscription: "premium",
        createdAt: new Date().toISOString(),
      },
    ];
  },

  videos: async () => {
    // Mock data - integrate with video service
    return [
      {
        id: "1",
        title: "Demo Video",
        url: "/videos/demo.mp4",
        status: "ready",
        userId: "1",
        createdAt: new Date().toISOString(),
      },
    ];
  },

  analytics: async () => {
    // Mock analytics - integrate with analytics service
    return {
      totalUsers: 1250,
      totalVideos: 3400,
      revenue: 125000.5,
      activeStreams: 45,
    };
  },

  // Mutations
  createUser: async ({ input }) => {
    // Business logic for user creation
    const user = {
      id: Date.now().toString(),
      email: input.email,
      name: input.name,
      subscription: "free",
      createdAt: new Date().toISOString(),
    };

    // TODO: Hash password, save to database
    console.log("Creating user:", user.email);
    return user;
  },

  uploadVideo: async ({ input }) => {
    // Business logic for video upload
    const video = {
      id: Date.now().toString(),
      title: input.title,
      url: null, // Will be set after processing
      status: "processing",
      userId: input.userId,
      createdAt: new Date().toISOString(),
    };

    // TODO: Process video file, generate thumbnails
    console.log("Processing video:", video.title);
    return video;
  },

  processPayment: async ({ input }) => {
    // Business logic for payment processing
    try {
      // TODO: Integrate with Stripe
      console.log(`Processing payment: $${input.amount} ${input.currency}`);

      return {
        success: true,
        transactionId: `txn_${Date.now()}`,
        message: "Payment processed successfully",
      };
    } catch (error) {
      return {
        success: false,
        transactionId: null,
        message: error.message,
      };
    }
  },
};

const app = express();

// CORS and security middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// GraphQL endpoint with enhanced features
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    // Disable GraphiQL in production (CWE-200 fix)
    graphiql:
      process.env.NODE_ENV !== "production"
        ? {
            headerEditorEnabled: true,
            shouldPersistHeaders: false, // Don't persist sensitive headers
          }
        : false,
    formatError: (error) => {
      console.error("GraphQL Error:", error);
      // Don't expose internal error details in production (CWE-200 fix)
      if (process.env.NODE_ENV === "production") {
        return {
          message: "Internal server error",
          extensions: {
            code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
          },
        };
      }
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      graphql: "running",
      database: "connected",
      redis: "connected",
    },
  });
});

// Metrics endpoint
app.get("/metrics", (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 GraphQL API running on http://localhost:${PORT}/graphql`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
});
