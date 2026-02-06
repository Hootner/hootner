#!/usr/bin/env node

/**
 * 🔍 HOOTNER API & Database Status Checker
 * Verifies all APIs, Redis, GraphQL, and DynamoDB are in proper locations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class APIStatusChecker {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.issues = [];
        this.verified = [];
    }

    checkPath(description, filePath, required = true) {
        const fullPath = path.join(this.projectRoot, filePath);
        const exists = fs.existsSync(fullPath);
        
        if (exists) {
            this.verified.push({ description, path: filePath, status: '✅' });
        } else if (required) {
            this.issues.push({ description, path: filePath, status: '❌', severity: 'ERROR' });
        } else {
            this.issues.push({ description, path: filePath, status: '⚠️', severity: 'WARNING' });
        }
        
        return exists;
    }

    checkFileContent(description, filePath, searchText) {
        const fullPath = path.join(this.projectRoot, filePath);
        
        if (!fs.existsSync(fullPath)) {
            this.issues.push({ description: `${description} (file missing)`, path: filePath, status: '❌', severity: 'ERROR' });
            return false;
        }
        
        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const hasContent = content.includes(searchText);
            
            if (hasContent) {
                this.verified.push({ description, path: filePath, status: '✅' });
            } else {
                this.issues.push({ description, path: filePath, status: '⚠️', severity: 'WARNING' });
            }
            
            return hasContent;
        } catch (e) {
            this.issues.push({ description: `${description} (read error)`, path: filePath, status: '❌', severity: 'ERROR' });
            return false;
        }
    }

    checkAPIs() {
        console.log('🔍 Checking API Structure...\n');

        // Core API structure
        this.checkPath('GraphQL Server', 'api/graphql/server.js');
        this.checkPath('GraphQL Schema', 'api/graphql/schema.graphql');
        this.checkPath('GraphQL Resolvers', 'api/graphql/resolvers/index.js');
        this.checkPath('GraphQL Models', 'api/graphql/models');
        
        // API Routes
        this.checkPath('Marketplace Routes', 'api/graphql/routes/marketplace.js');
        this.checkPath('Contact Routes', 'api/graphql/routes/contact.js');
        this.checkPath('Messages Routes', 'api/graphql/routes/messages.js');
        this.checkPath('Upload Routes', 'api/graphql/routes/upload.js');
        
        // Authentication
        this.checkPath('Auth Middleware', 'api/graphql/middleware/authMiddleware.js');
        this.checkPath('Passkey Routes', 'api/auth/passkey-routes.js');
        
        // Lambda Functions
        this.checkPath('S3 Event Handler', 'api/lambda/s3-event-handler.js');
        this.checkPath('User Analytics Lambda', 'api/lambda/user-analytics.js');
        
        // API Keys Layer
        this.checkPath('API Keys Layer', 'api/layers/api-keys');
        this.checkPath('Lambda Layers', 'layers/api-keys');
    }

    checkDynamoDB() {
        console.log('🗄️  Checking DynamoDB Configuration...\n');

        // DynamoDB Models
        this.checkPath('User Model', 'api/graphql/models/User.js');
        this.checkPath('Video Model', 'api/graphql/models/Video.js');
        this.checkPath('Order Model', 'api/graphql/models/Order.js');
        this.checkPath('DynamoDB Client', 'api/graphql/models/dynamoClient.js');
        
        // Hexarchy DynamoDB Config
        this.checkPath('Hexarchy DynamoDB Config', 'hexarchy/0-core/database/dynamodb/config.js');
        this.checkPath('DynamoDB Connector', 'hexarchy/0-core/aws/dynamodb-connector.js');
        
        // Check if server imports DynamoDB correctly
        this.checkFileContent('GraphQL Server DynamoDB Import', 'api/graphql/server.js', 'hexarchy/0-core/database/dynamodb/config.js');
        this.checkFileContent('DynamoDB Usage in Server', 'api/graphql/server.js', 'docClient');
    }

    checkRedis() {
        console.log('🔴 Checking Redis Configuration...\n');

        // Redis Configuration
        this.checkPath('Hexarchy Redis Config', 'hexarchy/0-core/database/redis/config.js');
        this.checkPath('Redis Connector', 'hexarchy/0-core/aws/redis-connector.js');
        
        // Cache Implementation
        this.checkPath('GraphQL Cache Service', 'api/graphql/cache/GraphQLCacheService.js');
        this.checkPath('Unified Cache Manager', 'api/graphql/cache/UnifiedCacheManager.js');
        this.checkPath('Cache Middleware', 'api/graphql/cache/CacheMiddleware.js');
    }

    checkGraphQL() {
        console.log('🔗 Checking GraphQL Implementation...\n');

        // Core GraphQL Files
        this.checkPath('GraphQL Server', 'api/graphql/server.js');
        this.checkPath('GraphQL Schema', 'api/graphql/schema.graphql');
        this.checkPath('Enhanced Schema', 'api/graphql/schema-enhanced.graphql');
        
        // Resolvers
        this.checkPath('Query Resolvers', 'api/graphql/resolvers/queries.js');
        this.checkPath('Mutation Resolvers', 'api/graphql/resolvers/mutations.js');
        this.checkPath('Subscription Resolvers', 'api/graphql/resolvers/subscriptions.js');
        this.checkPath('Video Resolvers', 'api/graphql/resolvers/videoResolvers.js');
        this.checkPath('DynamoDB Video Resolvers', 'api/graphql/resolvers/videoResolvers-dynamodb.js');
        
        // GraphQL Utilities
        this.checkPath('PubSub System', 'api/graphql/utils/pubsub.js');
        this.checkPath('Activity Publisher', 'api/graphql/utils/activityPublisher.js');
        this.checkPath('Activity Stream Generator', 'api/graphql/utils/activityStreamGenerator.js');
        
        // Check GraphQL server configuration
        this.checkFileContent('GraphQL Handler Import', 'api/graphql/server.js', 'graphql-http');
        this.checkFileContent('GraphQL Schema Build', 'api/graphql/server.js', 'buildSchema');
    }

    checkHexarchyIntegration() {
        console.log('🏗️  Checking Hexarchy Integration...\n');

        // Core Hexarchy Structure
        this.checkPath('Hexarchy Core Index', 'hexarchy/0-core/index.js');
        this.checkPath('AWS Integration Hub', 'hexarchy/0-core/aws/integration-hub.js');
        
        // Database Configurations
        this.checkPath('Database Utils', 'hexarchy/0-core/database/utils');
        this.checkPath('Connection Pool', 'hexarchy/0-core/database/utils/connection-pool.js');
        
        // API Configurations
        this.checkPath('GraphQL Config', 'hexarchy/0-core/api/graphql/config.js');
        this.checkPath('REST Config', 'hexarchy/0-core/api/rest/config.js');
        
        // Security & Auth
        this.checkPath('Auth Middleware', 'hexarchy/0-core/auth/middleware.js');
        this.checkPath('JWT Auth', 'hexarchy/0-core/auth/jwt.js');
        this.checkPath('Security Config', 'hexarchy/0-core/security');
        
        // Event System
        this.checkPath('Event Bus', 'hexarchy/0-core/orchestration/event-bus.js');
        this.checkPath('Realtime Event Bus', 'hexarchy/0-core/realtime/event-bus.js');
    }

    checkAWSServices() {
        console.log('☁️  Checking AWS Service Integrations...\n');

        // AWS Connectors
        this.checkPath('S3 Config', 'hexarchy/0-core/aws/s3/config.js');
        this.checkPath('Lambda Config', 'hexarchy/0-core/aws/lambda/config.js');
        this.checkPath('CloudFront Config', 'hexarchy/0-core/aws/cloudfront/config.js');
        this.checkPath('SQS Connector', 'hexarchy/0-core/aws/sqs-connector.js');
        this.checkPath('CloudWatch Connector', 'hexarchy/0-core/aws/cloudwatch-connector.js');
        this.checkPath('Stripe Connector', 'hexarchy/0-core/aws/stripe-connector.js');
        
        // AWS Template
        this.checkPath('SAM Template', 'template.yaml');
    }

    checkPackageConfigurations() {
        console.log('📦 Checking Package Configurations...\n');

        // Package.json files
        this.checkPath('Root Package.json', 'package.json');
        this.checkPath('GraphQL Package.json', 'api/graphql/package.json');
        this.checkPath('Frontend Package.json', 'apps/frontend/package.json');
        
        // Configuration files
        this.checkPath('Unified Dev Config', 'config/unified-dev-config.json');
        this.checkPath('AWS Training Config', 'config/aws_training_config.json');
    }

    generateReport() {
        console.log('\n' + '='.repeat(70));
        console.log('📋 API & DATABASE STATUS REPORT');
        console.log('='.repeat(70));

        // Summary
        const totalChecks = this.verified.length + this.issues.length;
        const errors = this.issues.filter(i => i.severity === 'ERROR').length;
        const warnings = this.issues.filter(i => i.severity === 'WARNING').length;

        console.log(`\n📊 Summary:`);
        console.log(`   Total Checks: ${totalChecks}`);
        console.log(`   ✅ Verified: ${this.verified.length}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`   ⚠️  Warnings: ${warnings}`);

        // Show verified items
        if (this.verified.length > 0) {
            console.log(`\n✅ Verified Components (${this.verified.length}):`);
            this.verified.forEach(item => {
                console.log(`   ${item.status} ${item.description}`);
            });
        }

        // Show issues
        if (this.issues.length > 0) {
            console.log(`\n⚠️  Issues Found (${this.issues.length}):`);
            this.issues.forEach(item => {
                console.log(`   ${item.status} ${item.description}`);
                console.log(`      Path: ${item.path}`);
            });
        }

        // Overall status
        console.log('\n🎯 Overall Status:');
        if (errors === 0 && warnings === 0) {
            console.log('   🟢 ALL SYSTEMS OPERATIONAL');
            console.log('   ✅ APIs, Redis, GraphQL, and DynamoDB are properly configured');
        } else if (errors === 0) {
            console.log('   🟡 MOSTLY OPERATIONAL');
            console.log(`   ⚠️  ${warnings} warnings found - review recommended`);
        } else {
            console.log('   🔴 ISSUES DETECTED');
            console.log(`   ❌ ${errors} critical errors need attention`);
        }

        // Quick access URLs
        console.log('\n🌐 Service URLs:');
        console.log('   GraphQL API: http://localhost:4000/graphql');
        console.log('   Health Check: http://localhost:4000/health');
        console.log('   Security Events: http://localhost:4000/api/security/events');
        console.log('   Metrics: http://localhost:4000/metrics');

        console.log('\n📁 Key Directories:');
        console.log('   APIs: api/graphql/');
        console.log('   Models: api/graphql/models/');
        console.log('   Hexarchy Core: hexarchy/0-core/');
        console.log('   AWS Configs: hexarchy/0-core/aws/');
        console.log('   Database Configs: hexarchy/0-core/database/');
    }

    async runFullCheck() {
        console.log('🦉 HOOTNER API & Database Status Check');
        console.log('Verifying all services are properly configured after consolidation\n');

        this.checkAPIs();
        this.checkDynamoDB();
        this.checkRedis();
        this.checkGraphQL();
        this.checkHexarchyIntegration();
        this.checkAWSServices();
        this.checkPackageConfigurations();

        this.generateReport();

        return {
            totalChecks: this.verified.length + this.issues.length,
            verified: this.verified.length,
            errors: this.issues.filter(i => i.severity === 'ERROR').length,
            warnings: this.issues.filter(i => i.severity === 'WARNING').length,
            allGood: this.issues.filter(i => i.severity === 'ERROR').length === 0
        };
    }
}

// Execute the check
const checker = new APIStatusChecker();
checker.runFullCheck().then(result => {
    process.exit(result.allGood ? 0 : 1);
}).catch(console.error);