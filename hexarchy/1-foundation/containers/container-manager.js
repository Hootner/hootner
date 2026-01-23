/**
 * HOOTNER Container Manager - Docker & Kubernetes Orchestration
 * Manages containerized services across all hexagonal domains
 */

const EventEmitter = require('events')
const { performance } = require('perf_hooks')

class ContainerManager extends EventEmitter {
  constructor() {
    super()
    this.containers = new Map()
    this.services = new Map()
    this.networks = new Map()
    this.volumes = new Map()
    this.domains = [
      'foundation',
      'intelligence',
      'communication',
      'interface',
      'economy',
      'governance',
      'data',
      'operations',
    ]

    this.initializeDomainContainers()
  }

  initializeDomainContainers() {
    // Configure containers for each hexagonal domain
    this.domains.forEach((domain, index) => {
      this.createDomainContainer(domain, {
        port: 5000 + index,
        memory: this.getDomainMemory(domain),
        cpu: this.getDomainCPU(domain),
      })
    })

    console.log(`🐳 Initialized ${this.containers.size} domain containers`)
  }

  createDomainContainer(domainName, config = {}) {
    const containerConfig = {
      name: `hootner-${domainName}`,
      image: `hootner/${domainName}:latest`,
      ports: [`${config.port || 3000}:3000`],
      environment: {
        NODE_ENV: 'production',
        DOMAIN_NAME: domainName,
        PORT: 3000,
        DATABASE_URL: 'postgresql://hootner:hootner123@postgres:5432/hootner',
        REDIS_URL: 'redis://redis:6379',
        ...config.environment,
      },
      volumes: config.volumes || [
        `hootner-${domainName}-data:/app/data`,
        `hootner-logs:/app/logs`,
      ],
      networks: ['hootner-network'],
      restart: 'unless-stopped',
      healthCheck: {
        test: `curl -f http://localhost:3000/health || exit 1`,
        interval: '30s',
        timeout: '10s',
        retries: 3,
        startPeriod: '40s',
      },
      labels: {
        'hootner.domain': domainName,
        'hootner.type': 'service',
        'hootner.version': '1.0.0',
      },
      resources: {
        memory: config.memory || '512M',
        cpus: config.cpu || '0.5',
      },
      depends_on: ['postgres', 'redis'],
    }

    this.containers.set(domainName, containerConfig)
    this.emit('containerConfigured', { domain: domainName, config: containerConfig })

    return containerConfig
  }

  getDomainMemory(domain) {
    const memoryMap = {
      intelligence: '1G', // AI services need more memory
      data: '1G', // Database operations
      economy: '512M', // Business logic
      interface: '512M', // Frontend services
      communication: '512M', // API services
      operations: '256M', // Monitoring
      governance: '256M', // Security
      foundation: '256M', // Core services
    }
    return memoryMap[domain] || '512M'
  }

  getDomainCPU(domain) {
    const cpuMap = {
      intelligence: '1.0', // AI processing
      data: '0.75', // Database operations
      economy: '0.5', // Business logic
      interface: '0.5', // Frontend
      communication: '0.5', // APIs
      operations: '0.25', // Monitoring
      governance: '0.25', // Security
      foundation: '0.25', // Core
    }
    return cpuMap[domain] || '0.5'
  }

  // Generate Docker Compose configuration
  generateDockerCompose() {
    const services = {}

    // Add infrastructure services
    services.postgres = {
      image: 'postgres:15',
      environment: {
        POSTGRES_DB: 'hootner',
        POSTGRES_USER: 'hootner',
        POSTGRES_PASSWORD: 'hootner123',
      },
      volumes: ['postgres_data:/var/lib/postgresql/data'],
      networks: ['hootner-network'],
      ports: ['5432:5432'],
      restart: 'unless-stopped',
      healthcheck: {
        test: 'pg_isready -U hootner -d hootner',
        interval: '10s',
        timeout: '5s',
        retries: 5,
      },
    }

    services.redis = {
      image: 'redis:7-alpine',
      volumes: ['redis_data:/data'],
      networks: ['hootner-network'],
      ports: ['6379:6379'],
      restart: 'unless-stopped',
      healthcheck: {
        test: 'redis-cli ping',
        interval: '10s',
        timeout: '3s',
        retries: 3,
      },
    }

    // Add domain services
    for (const [domainName, config] of this.containers.entries()) {
      services[config.name] = {
        image: config.image,
        ports: config.ports,
        environment: config.environment,
        volumes: config.volumes,
        networks: config.networks,
        restart: config.restart,
        healthcheck: {
          test: config.healthCheck.test,
          interval: config.healthCheck.interval,
          timeout: config.healthCheck.timeout,
          retries: config.healthCheck.retries,
          start_period: config.healthCheck.startPeriod,
        },
        labels: config.labels,
        deploy: {
          resources: {
            limits: {
              memory: config.resources.memory,
              cpus: config.resources.cpus,
            },
            reservations: {
              memory: this.getReservationMemory(config.resources.memory),
              cpus: this.getReservationCPU(config.resources.cpus),
            },
          },
        },
        depends_on: config.depends_on,
      }
    }

    return {
      version: '3.8',
      services,
      networks: {
        'hootner-network': {
          driver: 'bridge',
          ipam: {
            config: [
              {
                subnet: '172.20.0.0/16',
              },
            ],
          },
        },
      },
      volumes: {
        postgres_data: {},
        redis_data: {},
        'hootner-logs': {},
        ...this.generateDomainVolumes(),
      },
    }
  }

  generateDomainVolumes() {
    const volumes = {}
    for (const domain of this.domains) {
      volumes[`hootner-${domain}-data`] = {}
    }
    return volumes
  }

  getReservationMemory(limit) {
    const limitValue = parseInt(limit)
    const unit = limit.replace(/[0-9]/g, '')
    return Math.floor(limitValue * 0.5) + unit
  }

  getReservationCPU(limit) {
    return (parseFloat(limit) * 0.5).toString()
  }

  // Generate Kubernetes manifests
  generateKubernetesManifests() {
    const manifests = []

    // Namespace
    manifests.push({
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: 'hootner',
        labels: {
          'app.kubernetes.io/name': 'hootner',
          'app.kubernetes.io/version': '1.0.0',
        },
      },
    })

    // ConfigMap
    manifests.push({
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: 'hootner-config',
        namespace: 'hootner',
      },
      data: {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://hootner:hootner123@postgres-service:5432/hootner',
        REDIS_URL: 'redis://redis-service:6379',
      },
    })

    // Infrastructure services
    manifests.push(...this.generateInfrastructureManifests())

    // Domain services
    for (const [domainName, config] of this.containers.entries()) {
      manifests.push(...this.generateDomainManifests(domainName, config))
    }

    return manifests
  }

  generateInfrastructureManifests() {
    return [
      // PostgreSQL
      {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
          name: 'postgres',
          namespace: 'hootner',
        },
        spec: {
          replicas: 1,
          selector: { matchLabels: { app: 'postgres' } },
          template: {
            metadata: { labels: { app: 'postgres' } },
            spec: {
              containers: [
                {
                  name: 'postgres',
                  image: 'postgres:15',
                  ports: [{ containerPort: 5432 }],
                  env: [
                    { name: 'POSTGRES_DB', value: 'hootner' },
                    { name: 'POSTGRES_USER', value: 'hootner' },
                    { name: 'POSTGRES_PASSWORD', value: 'hootner123' },
                  ],
                  volumeMounts: [
                    {
                      name: 'postgres-storage',
                      mountPath: '/var/lib/postgresql/data',
                    },
                  ],
                },
              ],
              volumes: [
                {
                  name: 'postgres-storage',
                  persistentVolumeClaim: {
                    claimName: 'postgres-pvc',
                  },
                },
              ],
            },
          },
        },
      },
      {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: 'postgres-service',
          namespace: 'hootner',
        },
        spec: {
          selector: { app: 'postgres' },
          ports: [{ port: 5432, targetPort: 5432 }],
        },
      },
      // Redis
      {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
          name: 'redis',
          namespace: 'hootner',
        },
        spec: {
          replicas: 1,
          selector: { matchLabels: { app: 'redis' } },
          template: {
            metadata: { labels: { app: 'redis' } },
            spec: {
              containers: [
                {
                  name: 'redis',
                  image: 'redis:7-alpine',
                  ports: [{ containerPort: 6379 }],
                },
              ],
            },
          },
        },
      },
      {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: 'redis-service',
          namespace: 'hootner',
        },
        spec: {
          selector: { app: 'redis' },
          ports: [{ port: 6379, targetPort: 6379 }],
        },
      },
    ]
  }

  generateDomainManifests(domainName, config) {
    return [
      // Deployment
      {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
          name: `${config.name}-deployment`,
          namespace: 'hootner',
          labels: config.labels,
        },
        spec: {
          replicas: domainName === 'interface' ? 3 : 2, // More replicas for frontend
          selector: {
            matchLabels: { app: config.name },
          },
          template: {
            metadata: {
              labels: {
                app: config.name,
                domain: domainName,
                ...config.labels,
              },
            },
            spec: {
              containers: [
                {
                  name: config.name,
                  image: config.image,
                  ports: [{ containerPort: 3000 }],
                  env: Object.entries(config.environment).map(([name, value]) => ({
                    name,
                    value: String(value),
                  })),
                  resources: {
                    limits: {
                      memory: config.resources.memory,
                      cpu: config.resources.cpus,
                    },
                    requests: {
                      memory: this.getReservationMemory(config.resources.memory),
                      cpu: this.getReservationCPU(config.resources.cpus),
                    },
                  },
                  livenessProbe: {
                    httpGet: {
                      path: '/health',
                      port: 3000,
                    },
                    initialDelaySeconds: 30,
                    periodSeconds: 10,
                  },
                  readinessProbe: {
                    httpGet: {
                      path: '/ready',
                      port: 3000,
                    },
                    initialDelaySeconds: 5,
                    periodSeconds: 5,
                  },
                },
              ],
            },
          },
        },
      },
      // Service
      {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: `${config.name}-service`,
          namespace: 'hootner',
        },
        spec: {
          selector: { app: config.name },
          ports: [
            {
              port: 80,
              targetPort: 3000,
              protocol: 'TCP',
            },
          ],
          type: domainName === 'interface' ? 'LoadBalancer' : 'ClusterIP',
        },
      },
    ]
  }

  // Container health monitoring
  async monitorHealth() {
    const healthStatus = new Map()

    for (const [domainName, config] of this.containers.entries()) {
      try {
        const health = await this.checkContainerHealth(domainName, config)
        healthStatus.set(domainName, health)

        if (!health.healthy) {
          console.warn(`⚠️ Container ${domainName} unhealthy:`, health.status)
          this.emit('containerUnhealthy', { domain: domainName, health })
        }
      } catch (error) {
        console.error(`❌ Health check failed for ${domainName}:`, error.message)
        healthStatus.set(domainName, {
          healthy: false,
          status: 'error',
          error: error.message,
        })
      }
    }

    return Object.fromEntries(healthStatus)
  }

  async checkContainerHealth(domainName, config) {
    // Simulate health check - in production would use Docker/K8s APIs
    const isHealthy = Math.random() > 0.1 // 90% uptime simulation

    return {
      healthy: isHealthy,
      status: isHealthy ? 'running' : 'unhealthy',
      uptime: Math.floor(Math.random() * 86400),
      memoryUsage: Math.floor(Math.random() * 80) + '%',
      cpuUsage: Math.floor(Math.random() * 60) + '%',
      lastCheck: Date.now(),
    }
  }

  // Start all containers
  async startAll() {
    console.log('🚀 Starting all HOOTNER containers...')

    const results = []
    for (const [domainName, config] of this.containers.entries()) {
      try {
        const result = await this.startContainer(domainName)
        results.push({ domain: domainName, status: 'started', ...result })
        console.log(`✅ Started ${domainName} container`)
      } catch (error) {
        results.push({ domain: domainName, status: 'failed', error: error.message })
        console.error(`❌ Failed to start ${domainName}:`, error.message)
      }
    }

    return results
  }

  async startContainer(domainName) {
    const config = this.containers.get(domainName)
    if (!config) {
      throw new Error(`Container configuration not found: ${domainName}`)
    }

    // Simulate container startup
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 1000))

    this.emit('containerStarted', { domain: domainName, config })

    return {
      containerId: `container_${domainName}_${Date.now()}`,
      image: config.image,
      ports: config.ports,
    }
  }

  // Stop all containers
  async stopAll() {
    console.log('🛑 Stopping all containers...')

    for (const domainName of this.containers.keys()) {
      try {
        await this.stopContainer(domainName)
        console.log(`✅ Stopped ${domainName} container`)
      } catch (error) {
        console.error(`❌ Failed to stop ${domainName}:`, error.message)
      }
    }
  }

  async stopContainer(domainName) {
    // Simulate container stop
    await new Promise((resolve) => setTimeout(resolve, 500))
    this.emit('containerStopped', { domain: domainName })
  }

  // Get container statistics
  getStats() {
    return {
      totalContainers: this.containers.size,
      domains: Array.from(this.containers.keys()),
      totalMemoryAllocated: this.calculateTotalMemory(),
      totalCPUAllocated: this.calculateTotalCPU(),
      networks: this.networks.size,
      volumes: this.volumes.size,
    }
  }

  calculateTotalMemory() {
    let total = 0
    for (const config of this.containers.values()) {
      const memory = config.resources.memory
      const value = parseInt(memory)
      total += memory.includes('G') ? value * 1024 : value
    }
    return `${total}M`
  }

  calculateTotalCPU() {
    let total = 0
    for (const config of this.containers.values()) {
      total += parseFloat(config.resources.cpus)
    }
    return total.toFixed(2)
  }

  // Health check endpoint
  healthCheck() {
    return {
      status: 'healthy',
      containers: this.containers.size,
      domains: this.domains.length,
      uptime: process.uptime(),
    }
  }
}

// Create and export container manager instance
const containerManager = new ContainerManager()

// Auto-start if run directly
if (require.main === module) {
  // Example usage
  async function demo() {
    try {
      console.log('🐳 Container Manager Demo')

      // Generate Docker Compose
      const dockerCompose = containerManager.generateDockerCompose()
      console.log(
        '📄 Docker Compose services:',
        Object.keys(dockerCompose.services).length
      )

      // Generate Kubernetes manifests
      const k8sManifests = containerManager.generateKubernetesManifests()
      console.log('☸️ Kubernetes manifests:', k8sManifests.length)

      // Show stats
      console.log('📊 Container Stats:', containerManager.getStats())
    } catch (error) {
      console.error('Demo failed:', error.message)
    }
  }

  demo()

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down Container Manager...')
    await containerManager.stopAll()
    process.exit(0)
  })
}

module.exports = containerManager
