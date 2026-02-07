// Environment Configuration & Validation
import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment schema
const envSchema = z.object({
  // Node
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),

  // AWS
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  // Database
  DYNAMODB_ENDPOINT: z.string().optional(),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // API
  GRAPHQL_PORT: z.string().default('4000'),
  API_PORT: z.string().default('8080'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Auth
  JWT_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
  FIREBASE_API_KEY: z.string().optional(),

  // Payment
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info')
});

// Validate environment
let env;
try {
  env = envSchema.parse(process.env);
  console.log('✅ Environment configuration validated');
} catch (error) {
  console.error('❌ Environment validation failed:', error.errors);
  process.exit(1);
}

export default env;
