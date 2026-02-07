/**
 * Service Integration Hub
 * Central orchestration for all HOOTNER microservices
 */

const EventEmitter = require("events");
const path = require("path");
const crypto = require("crypto");
const http = require("http");
const https = require("https");

class ServiceIntegrationHub extends EventEmitter {
  constructor() {
    super();
    this.services = new Map();
    this.healthChecks = new Map();
    this.dependencies = new Map();
    this.sessionId = crypto.randomUUID();
    this.csrfTokens = new Map(); // Track CSRF tokens per service
    this.csrfTokenExpiry = 3600000; // 1 hour in milliseconds
    this.allowedServices = new Set([
      "audit",
      "security",
      "payment",
      "personalization",
      "fraudDetection",
      "contentModeration",
      "businessMetrics",
      "healthChecks",
      "performanceMonitor",
    ]);
    // Pre-load all service modules to avoid lazy loading
    this.serviceModules = this.loadServiceModules();
    this.initializeServices();
    this.startCsrfTokenCleanup();
  }

  loadServiceModules() {
    const modules = {};
    const safeModules = {
      audit: "./audit-service.js",
      security: "./security-service.js",
      payment: "./payment-service.js",
      personalization: "./personalization-agent.js",
      fraudDetection: "./payment-fraud-detection-agent.js",
      contentModeration: "./content-moderation-ai.js",
      businessMetrics: "./business-metrics.js",
      healthChecks: "./health-checks.js",
      performanceMonitor: "./performance-monitor.js",
    };

    for (const [name, modulePath] of Object.entries(safeModules)) {
      try {
        const fullPath = path.join(__dirname, modulePath);
        modules[name] = require(fullPath);
      } catch (error) {
        console.warn(`Failed to load module ${name}: ${error.message}`);
        modules[name] = null;
      }
    }

    return modules;
  }

  validateServiceName(serviceName) {
    // Sanitize and validate service name
    const sanitized = String(serviceName).replace(/[^a-zA-Z0-9_-]/g, "");

    if (!this.allowedServices.has(sanitized)) {
      throw new Error(`Invalid or unauthorized service name: ${serviceName}`);
    }

    return sanitized;
  }

  generateCsrfToken(serviceName) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenKey = `${serviceName}-${Date.now()}`;
    this.csrfTokens.set(tokenKey, {
      token,
      timestamp: Date.now(),
      serviceName,
    });
    return token;
  }

  validateCsrfToken(token, serviceName) {
    for (const [key, data] of this.csrfTokens.entries()) {
      if (data.token === token && data.serviceName === serviceName) {
        const age = Date.now() - data.timestamp;
        if (age < this.csrfTokenExpiry) {
          this.csrfTokens.delete(key); // Single-use token
          return true;
        }
      }
    }
    return false;
  }

  startCsrfTokenCleanup() {
    // Clean up expired tokens every 10 minutes
    this.csrfCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.csrfTokens.entries()) {
        if (now - data.timestamp > this.csrfTokenExpiry) {
          this.csrfTokens.delete(key);
        }
      }
    }, 600000);
  }

  initializeServices() {
    // Core Services
    this.registerService("audit", {
      path: "./audit-service.js",
      port: 3010,
      dependencies: ["database"],
      healthEndpoint: "/health",
    });

    this.registerService("security", {
      path: "./security-service.js",
      port: 3011,
      dependencies: ["audit"],
      healthEndpoint: "/health",
    });

    this.registerService("payment", {
      path: "./payment-service.js",
      port: 3012,
      dependencies: ["security", "audit"],
      healthEndpoint: "/health",
    });

    // AI Services
    this.registerService("personalization", {
      path: "./personalization-agent.js",
      port: 3013,
      dependencies: ["database"],
      healthEndpoint: "/health",
    });

    this.registerService("fraudDetection", {
      path: "./payment-fraud-detection-agent.js",
      port: 3014,
      dependencies: ["payment", "security"],
      healthEndpoint: "/health",
    });

    // Content Services
    this.registerService("contentModeration", {
      path: "./content-moderation-ai.js",
      port: 3015,
      dependencies: ["security"],
      healthEndpoint: "/health",
    });

    // Analytics Services
    this.registerService("businessMetrics", {
      path: "./business-metrics.js",
      port: 3016,
      dependencies: ["audit"],
      healthEndpoint: "/health",
    });

    // Infrastructure Services
    this.registerService("healthChecks", {
      path: "./health-checks.js",
      port: 3017,
      dependencies: [],
      healthEndpoint: "/health",
    });

    this.registerService("performanceMonitor", {
      path: "./performance-monitor.js",
      port: 3018,
      dependencies: ["healthChecks"],
      healthEndpoint: "/health",
    });
  }

  registerService(name, config) {
    // Validate service name using strict validation
    const validatedName = this.validateServiceName(name);

    this.services.set(validatedName, {
      name: validatedName,
      ...config,
      status: "stopped",
      instance: null,
      startTime: null,
      restartCount: 0,
      sessionId: this.sessionId,
    });

    // Validate all dependency names
    const validatedDeps = (config.dependencies || [])
      .map((dep) => {
        try {
          return this.validateServiceName(dep);
        } catch (error) {
          console.warn(
            `Invalid dependency ${dep} for service ${validatedName}: ${error.message}`
          );
          return null;
        }
      })
      .filter(Boolean);

    this.dependencies.set(validatedName, validatedDeps);
  }

  async startService(serviceName) {
    // Validate service name to prevent injection and path traversal
    const validatedName = this.validateServiceName(serviceName);

    const service = this.services.get(validatedName);
    if (!service) {
      throw new Error(`Service ${validatedName} not found`);
    }

    // Check dependencies first
    const deps = this.dependencies.get(validatedName);
    for (const dep of deps) {
      // Validate dependency name before recursive call
      const validatedDep = this.validateServiceName(dep);
      const depService = this.services.get(validatedDep);
      if (!depService || depService.status !== "running") {
        await this.startService(validatedDep);
      }
    }

    try {
      console.log(`Starting service: ${validatedName}`);

      // Use pre-loaded module instead of dynamic require
      const ServiceClass = this.serviceModules[validatedName];

      if (!ServiceClass) {
        throw new Error(`Service module not loaded: ${validatedName}`);
      }

      // Validate that the module exports a constructor
      if (typeof ServiceClass !== "function") {
        throw new Error(
          `Service module must export a constructor function: ${validatedName}`
        );
      }

      service.instance = new ServiceClass(service.port);
      service.status = "running";
      service.startTime = new Date();

      this.emit("serviceStarted", { serviceName: validatedName, service });
      console.log(
        `✅ Service ${validatedName} started on port ${service.port}`
      );

      // Start health monitoring
      this.startHealthMonitoring(validatedName);
    } catch (error) {
      service.status = "failed";
      this.emit("serviceFailed", { serviceName: validatedName, error });
      console.error(
        `❌ Failed to start service ${validatedName}:`,
        error.message
      );
      throw error;
    }
  }

  async stopService(serviceName) {
    const service = this.services.get(serviceName);
    if (!service || service.status !== "running") {
      return;
    }

    try {
      if (service.instance && typeof service.instance.stop === "function") {
        await service.instance.stop();
      }
      service.status = "stopped";
      service.instance = null;

      this.emit("serviceStopped", { serviceName });
      console.log(`🛑 Service ${serviceName} stopped`);
    } catch (error) {
      console.error(`Error stopping service ${serviceName}:`, error.message);
    }
  }

  async startAllServices() {
    console.log("🚀 Starting all services...");

    // Start services in dependency order
    const startOrder = this.getStartOrder();

    for (const serviceName of startOrder) {
      try {
        await this.startService(serviceName);
        // Small delay between service starts
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `Failed to start ${serviceName}, continuing with others...`
        );
      }
    }

    console.log("✅ All services startup complete");
    this.printServiceStatus();
  }

  async stopAllServices() {
    console.log("🛑 Stopping all services...");

    const services = Array.from(this.services.keys()).reverse();
    for (const serviceName of services) {
      await this.stopService(serviceName);
    }

    console.log("✅ All services stopped");
  }

  getStartOrder() {
    const visited = new Set();
    const order = [];

    const visit = (serviceName) => {
      if (visited.has(serviceName)) return;
      visited.add(serviceName);

      const deps = this.dependencies.get(serviceName) || [];
      for (const dep of deps) {
        visit(dep);
      }

      order.push(serviceName);
    };

    for (const serviceName of this.services.keys()) {
      visit(serviceName);
    }

    return order;
  }

  startHealthMonitoring(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) return;

    // Ensure any previous monitor is cleared
    this.stopHealthMonitoring(serviceName);

    const check = async () => {
      try {
        const result = await this.performHealthCheck(service);
        const status = result.healthy ? "healthy" : "unhealthy";
        this.emit("healthCheck", { serviceName, status, details: result });

        // Optional auto-restart attempt on repeated failures could be placed here
        if (!result.healthy) {
          // increment restart counter and emit notice
          service.restartCount = (service.restartCount || 0) + 1;
        }
      } catch (error) {
        this.emit("healthCheck", { serviceName, status: "unhealthy", error });
      }
    };

    // Run an immediate check then schedule periodic checks
    check();
    const healthCheck = setInterval(check, 30000); // Check every 30 seconds
    this.healthChecks.set(serviceName, healthCheck);
  }

  stopHealthMonitoring(serviceName) {
    const id = this.healthChecks.get(serviceName);
    if (id) {
      clearInterval(id);
      this.healthChecks.delete(serviceName);
    }
  }

  async performHealthCheck(service) {
    // If the service instance exposes a health() method, prefer it
    if (service.instance && typeof service.instance.health === "function") {
      try {
        const r = await service.instance.health();
        return { healthy: !!(r && (r.healthy || r.status === "ok")), raw: r };
      } catch (err) {
        return { healthy: false, error: err.message || err };
      }
    }

    // Fallback to HTTP/HTTPS health endpoint if available
    const endpoint = service.healthEndpoint || "/health";
    if (!service.port) {
      return { healthy: false, reason: "no-port" };
    }

    const protocol = service.port === 443 ? "https" : "http";
    const url = `${protocol}://localhost:${service.port}${endpoint}`;

    return new Promise((resolve) => {
      try {
        // Use pre-loaded modules instead of lazy loading
        const lib = protocol === "https" ? https : http;

        // Generate CSRF token for this health check request
        const csrfToken = this.generateCsrfToken(service.name);

        const options = {
          timeout: 3000,
          headers: {
            "X-CSRF-Token": csrfToken,
            "X-Requested-With": "XMLHttpRequest",
            "X-Service-Session": this.sessionId,
            Origin: `${protocol}://localhost:${service.port}`,
            Referer: `${protocol}://localhost:${service.port}/`,
          },
        };

        const req = lib.get(url, options, (res) => {
          const healthy = res.statusCode >= 200 && res.statusCode < 300;
          // consume response to avoid socket hang
          res.on("data", () => {});
          res.on("end", () => resolve({ healthy, statusCode: res.statusCode }));
        });

        req.on("error", (err) =>
          resolve({ healthy: false, error: err.message })
        );
        req.on("timeout", () => {
          req.destroy();
          resolve({ healthy: false, timeout: true });
        });
      } catch (err) {
        resolve({ healthy: false, error: err.message || err });
      }
    });
  }

  printServiceStatus() {
    console.log("\n📊 Service Status:");
    console.log("─".repeat(60));

    for (const [name, service] of this.services) {
      const status =
        service.status === "running"
          ? "🟢"
          : service.status === "failed"
            ? "🔴"
            : "⚪";
      const uptime = service.startTime
        ? Math.floor((Date.now() - service.startTime) / 1000) + "s"
        : "N/A";

      console.log(
        `${status} ${name.padEnd(20)} Port: ${service.port} Uptime: ${uptime}`
      );
    }
    console.log("─".repeat(60));
  }

  getServiceMetrics() {
    const metrics = {
      total: this.services.size,
      running: 0,
      stopped: 0,
      failed: 0,
      services: {},
    };

    for (const [name, service] of this.services) {
      metrics[service.status]++;
      metrics.services[name] = {
        status: service.status,
        port: service.port,
        uptime: service.startTime ? Date.now() - service.startTime : 0,
        restartCount: service.restartCount,
      };
    }

    return metrics;
  }

  // Integration with existing Hootner servers
  integrateWithHootnerServers() {
    // Connect to existing server orchestration
    const existingServers = [
      { name: "main", port: 3000 },
      { name: "mcp", port: 3001 },
      { name: "collaboration", port: 3002 },
      { name: "codeEditor", port: 3003 },
      { name: "htmlPages", port: 3004 },
      { name: "hubApp", port: 3005 },
      { name: "secure", port: 3006 },
      { name: "videoPlayer", port: 3007 },
      { name: "hooterMcp", port: 3008 },
    ];

    console.log("🔗 Integrating with existing HOOTNER servers...");

    // Register existing servers for monitoring with session validation
    existingServers.forEach((server) => {
      this.emit("externalServerDetected", {
        ...server,
        sessionId: this.sessionId,
      });
    });
  }
}

// Event handlers for service lifecycle
const serviceHub = new ServiceIntegrationHub();

serviceHub.on("serviceStarted", ({ serviceName }) => {
  console.log(`📡 Service ${serviceName} is now available for integration`);
});

serviceHub.on("serviceFailed", ({ serviceName, error }) => {
  console.error(`🚨 Service ${serviceName} failed: ${error.message}`);
});

serviceHub.on("healthCheck", ({ serviceName, status }) => {
  if (status === "unhealthy") {
    console.warn(`⚠️  Health check failed for ${serviceName}`);
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Graceful shutdown initiated...");
  if (serviceHub.csrfCleanupInterval) {
    clearInterval(serviceHub.csrfCleanupInterval);
  }
  await serviceHub.stopAllServices();
  process.exit(0);
});

module.exports = serviceHub;
