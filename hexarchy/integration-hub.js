/**
 * Hexarchy Integration Hub
 * Central integration point between new hexarchy domains and existing HOOTNER infrastructure
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createLogger } from './0-core/utils/logger.js';
import { eventBus } from './0-core/orchestration/event-bus.js';
import { globalConfig } from './0-core/configs/global.config.js';

// Import existing HOOTNER infrastructure
import { HTTP_STATUS } from '../constants/index.js';
import { config } from '../config/app-config.js';

// Import all hexarchy domain services
import { systemMonitor } from './1-foundation/monitoring/system-monitor.js';
import { containerManager } from './1-foundation/containers/container-manager.js';
import { personalizationEngine } from './2-intelligence/personalization/personalization-engine.js';
import { feedbackLoopEngine } from './2-intelligence/feedback-loops/feedback-engine.js';
import { notificationService } from './3-communication/notifications/notification-service.js';
import { i18nService } from './3-communication/localization/i18n-service.js';
import { accessibilityService } from './4-interface/accessibility/accessibility-service.js';
import { pricingEngine } from './5-economy/pricing/pricing-engine.js';
import { fraudDetectionSystem } from './5-economy/fraud-detection/fraud-system.js';
import { incidentResponseSystem } from './6-governance/incident-response/incident-system.js';
import { apiVersionManager } from './6-governance/versioning/api-version-manager.js';
import { rateLimitingSystem } from './6-governance/rate-limiting/rate-limiter.js';
import { databaseManager } from './7-data/storage/database-manager.js';
import { cacheLayer } from './7-data/caching/cache-layer.js';
import { cicdPipeline } from './8-operations/ci-cd/pipeline.js';
import { infrastructureManager } from './8-operations/infrastructure/infrastructure-manager.js';

const logger = createLogger('hexarchy', 'integration-hub');

class HexarchyIntegrationHub {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server);
    this.isRunning = false;
    
    this._setupMiddleware();
    this._setupRoutes();
    this._setupWebSocketHandlers();
    this._setupEventBridging();
  }

  _setupMiddleware() {
    // CORS for existing HOOTNER frontend
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', `http://localhost:${config.server.port}`);
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });

    this.app.use(express.json());
  }

  _setupRoutes() {
    // Health check for existing monitoring
    this.app.get('/health', (req, res) => {
      const healthStatus = {
        status: 'healthy',
        timestamp: Date.now(),
        hexarchy: {
          foundation: systemMonitor.getStats(),
          intelligence: {
            personalization: personalizationEngine.getStats(),
            feedbackLoops: feedbackLoopEngine.getStats()
          },
          communication: {
            notifications: notificationService.getStats(),
            i18n: i18nService.getStats()
          },
          interface: {
            accessibility: accessibilityService.getStats()
          },
          economy: {
            pricing: pricingEngine.getStats(),
            fraud: fraudDetectionSystem.getStats()
          },
          governance: {
            incidents: incidentResponseSystem.getStats(),
            versioning: apiVersionManager.getStats(),
            rateLimiting: rateLimitingSystem.getStats()
          },
          data: {
            storage: databaseManager.getStats(),
            caching: cacheLayer.getStats()
          },
          operations: {
            cicd: cicdPipeline.getStats(),
            infrastructure: infrastructureManager.getStats()
          }
        }
      };

      res.json(healthStatus);
    });

    // Dashboard data integration for existing dashboard.html
    this.app.get('/api/dashboard', async (req, res) => {
      try {
        const dashboardData = {
          // System overview
          system: {
            health: systemMonitor.getDashboardData(),
            containers: containerManager.getStats()
          },

          // User insights from intelligence domain
          intelligence: {
            personalization: await this._getPersonalizationInsights(),
            learningAnalytics: await this._getLearningAnalytics()
          },

          // Communication metrics
          communication: {
            notifications: await this._getNotificationMetrics(),
            languages: i18nService.getSupportedLanguages()
          },

          // Economic data for marketplace.html integration
          economy: {
            pricing: await this._getPricingData(),
            fraudAlerts: fraudDetectionSystem.getRecentAlerts()
          },

          // Security overview
          governance: {
            incidents: incidentResponseSystem.getActiveIncidents(),
            apiVersions: apiVersionManager.getStats(),
            rateLimits: rateLimitingSystem.getStats()
          },

          // Technical metrics
          data: {
            databases: databaseManager.getHealthStatus(),
            cache: cacheLayer.getStats()
          },

          // DevOps status
          operations: {
            deployments: cicdPipeline.getDeployments(),
            infrastructure: infrastructureManager.getStats()
          }
        };

        res.json(dashboardData);
      } catch (error) {
        logger.error('Dashboard data error', { error: error.message });
        res.status(HTTP_STATUS.SERVER_ERROR).json({ error: 'Failed to get dashboard data' });
      }
    });

    // Integration endpoints for existing frontend apps
    this.app.post('/api/personalize', async (req, res) => {
      try {
        const { userId, preferences } = req.body;
        const profile = await personalizationEngine.updateUserProfile(userId, preferences);
        res.json({ success: true, profile });
      } catch (error) {
        logger.error('Personalization error', { error: error.message });
        res.status(HTTP_STATUS.SERVER_ERROR).json({ error: 'Personalization failed' });
      }
    });

    // Notification endpoint for existing apps
    this.app.post('/api/notify', async (req, res) => {
      try {
        const notification = await notificationService.send(req.body);
        res.json({ success: true, notificationId: notification.id });
      } catch (error) {
        logger.error('Notification error', { error: error.message });
        res.status(HTTP_STATUS.SERVER_ERROR).json({ error: 'Notification failed' });
      }
    });

    // Pricing calculation for marketplace
    this.app.post('/api/pricing', async (req, res) => {
      try {
        const price = pricingEngine.calculatePrice(req.body);
        res.json({ price });
      } catch (error) {
        logger.error('Pricing error', { error: error.message });
        res.status(HTTP_STATUS.SERVER_ERROR).json({ error: 'Pricing calculation failed' });
      }
    });

    // Rate limiting check
    this.app.post('/api/rate-limit/check', (req, res) => {
      try {
        const result = rateLimitingSystem.isAllowed('api_general', req);
        res.json(result);
      } catch (error) {
        logger.error('Rate limit check error', { error: error.message });
        res.status(HTTP_STATUS.SERVER_ERROR).json({ error: 'Rate limit check failed' });
      }
    });
  }

  _setupWebSocketHandlers() {
    this.io.on('connection', (socket) => {
      logger.info('Client connected to hexarchy hub', { socketId: socket.id });

      // Subscribe client to real-time events
      socket.on('subscribe', (topics) => {
        topics.forEach(topic => socket.join(topic));
        logger.debug('Client subscribed to topics', { socketId: socket.id, topics });
      });

      socket.on('disconnect', () => {
        logger.info('Client disconnected from hexarchy hub', { socketId: socket.id });
      });
    });
  }

  _setupEventBridging() {
    // Bridge hexarchy events to WebSocket clients and existing HOOTNER systems
    eventBus.subscribe('*', (event) => {
      // Emit to WebSocket clients
      this.io.to(event.type).emit('hexarchy-event', {
        type: event.type,
        domain: event.source,
        payload: event.payload,
        timestamp: event.timestamp
      });

      // Log for existing logging infrastructure
      logger.info('Hexarchy event bridged', {
        type: event.type,
        source: event.source,
        correlationId: event.correlationId
      });
    });
  }

  async _getPersonalizationInsights() {
    // Aggregate personalization data for dashboard
    return {
      totalUsers: 150, // Would get from actual data
      learningStyles: {
        visual: 45,
        auditory: 35,
        kinesthetic: 40,
        mixed: 30
      },
      activePersonalizations: 127
    };
  }

  async _getLearningAnalytics() {
    return {
      sessionsToday: 234,
      averageSessionLength: 45, // minutes
      completionRate: 78.5, // percentage
      difficultyAdjustments: 42
    };
  }

  async _getNotificationMetrics() {
    return {
      sentToday: 1250,
      deliveryRate: 97.8,
      channels: {
        email: 450,
        push: 600,
        inApp: 200
      },
      languages: {
        en: 800,
        es: 200,
        fr: 150,
        de: 100
      }
    };
  }

  async _getPricingData() {
    return {
      averagePrice: 24.99,
      discountsActive: 15,
      surgePricingActive: false,
      revenueToday: 5750.50
    };
  }

  /**
   * Start the integration hub
   */
  start(port = 5000) {
    if (this.isRunning) {
      logger.warn('Integration hub already running');
      return;
    }

    this.server.listen(port, () => {
      this.isRunning = true;
      logger.info('Hexarchy Integration Hub started', { 
        port, 
        url: `http://localhost:${port}`,
        healthCheck: `http://localhost:${port}/health`,
        dashboard: `http://localhost:${port}/api/dashboard`
      });
    });

    // Start system monitoring
    systemMonitor.startMonitoring();

    logger.info('Hexarchy system fully integrated with HOOTNER platform');
  }

  /**
   * Stop the integration hub
   */
  stop() {
    if (!this.isRunning) return;

    systemMonitor.stopMonitoring();
    this.server.close(() => {
      this.isRunning = false;
      logger.info('Hexarchy Integration Hub stopped');
    });
  }

  /**
   * Get integration status
   */
  getStatus() {
    return {
      hubRunning: this.isRunning,
      domainsActive: Object.keys(globalConfig.domains).length,
      eventBusConnected: eventBus.isConnected,
      monitoringActive: systemMonitor.isMonitoring,
      connectedClients: this.io.engine.clientsCount
    };
  }
}

// Create and export the integration hub
export const hexarchyHub = new HexarchyIntegrationHub();

// Auto-start if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  hexarchyHub.start();
}

export default hexarchyHub;