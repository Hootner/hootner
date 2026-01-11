/**
 * Container Management System
 * Docker/Kubernetes orchestration for all domains
 */

import { createLogger } from '../../0-core/utils/logger.js';
import { eventBus } from '../../0-core/orchestration/event-bus.js';
import { EventTypes, DomainEvent } from '../../0-core/contracts/domain-events.js';

const logger = createLogger('foundation', 'containers');

class ContainerManager {
  constructor() {
    this.containers = new Map();
    this.networks = new Map();
    this.volumes = new Map();
    this.services = new Map();
  }

  /**
   * Create container configuration for domain
   */
  createDomainContainer(domainName, config) {
    const containerConfig = {
      name: `hexarchy-${domainName}`,
      image: config.image || `hexarchy/${domainName}:latest`,
      ports: config.ports || [`${5000 + this._getDomainNumber(domainName)}:3000`],
      environment: {
        NODE_ENV: config.environment || 'production',
        DOMAIN_NAME: domainName,
        PORT: 3000,
        ...config.environment
      },
      volumes: config.volumes || [],
      networks: ['hexarchy-network'],
      restartPolicy: config.restartPolicy || 'unless-stopped',
      healthCheck: {
        test: config.healthCheck?.test || `curl -f http://localhost:3000/health || exit 1`,
        interval: config.healthCheck?.interval || '30s',
        timeout: config.healthCheck?.timeout || '10s',
        retries: config.healthCheck?.retries || 3
      },
      labels: {
        'hexarchy.domain': domainName,
        'hexarchy.type': 'service',
        ...config.labels
      },
      resources: {
        memory: config.memory || '512M',
        cpus: config.cpus || '0.5',
        ...config.resources
      }
    };

    this.containers.set(domainName, containerConfig);

    logger.info('Domain container configured', { domainName, image: containerConfig.image });

    return containerConfig;
  }

  _getDomainNumber(domainName) {
    const domainMap = {
      'foundation': 1,
      'intelligence': 2,
      'communication': 3,
      'interface': 4,
      'economy': 5,
      'governance': 6,
      'data': 7,
      'operations': 8
    };
    return domainMap[domainName] || 0;
  }

  /**
   * Generate Docker Compose configuration
   */
  generateDockerCompose() {
    const services = {};
    const networks = {
      'hexarchy-network': {
        driver: 'bridge'
      }
    };
    const volumes = {
      'hexarchy-data': {},
      'hexarchy-logs': {},
      'hexarchy-cache': {}
    };

    // Add database services
    services.postgres = {
      image: 'postgres:15',
      environment: {
        POSTGRES_DB: 'hexarchy',
        POSTGRES_USER: 'hexarchy',
        POSTGRES_PASSWORD: 'hexarchy123'
      },
      volumes: ['hexarchy-data:/var/lib/postgresql/data'],
      networks: ['hexarchy-network'],
      ports: ['5432:5432']
    };

    services.redis = {
      image: 'redis:7-alpine',
      volumes: ['hexarchy-cache:/data'],
      networks: ['hexarchy-network'],
      ports: ['6379:6379']
    };

    // Add domain services
    for (const [domainName, config] of this.containers.entries()) {
      services[config.name] = {
        image: config.image,
        ports: config.ports,
        environment: config.environment,
        volumes: config.volumes,
        networks: config.networks,
        restart: config.restartPolicy,
        healthcheck: {
          test: config.healthCheck.test,
          interval: config.healthCheck.interval,
          timeout: config.healthCheck.timeout,
          retries: config.healthCheck.retries
        },
        labels: config.labels,
        deploy: {
          resources: {
            limits: {
              memory: config.resources.memory,
              cpus: config.resources.cpus
            }
          }
        },
        depends_on: ['postgres', 'redis']
      };
    }

    return {
      version: '3.8',
      services,
      networks,
      volumes
    };
  }

  /**
   * Generate Kubernetes manifests
   */
  generateKubernetesManifests() {
    const manifests = [];

    // Namespace
    manifests.push({
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: 'hexarchy'
      }
    });

    // ConfigMap for environment variables
    manifests.push({
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: 'hexarchy-config',
        namespace: 'hexarchy'
      },
      data: {
        NODE_ENV: 'production',
        POSTGRES_HOST: 'postgres-service',
        REDIS_HOST: 'redis-service'
      }
    });

    // Services and Deployments for each domain
    for (const [domainName, config] of this.containers.entries()) {
      // Deployment
      manifests.push({
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
          name: `${config.name}-deployment`,
          namespace: 'hexarchy',
          labels: config.labels
        },
        spec: {
          replicas: 2,
          selector: {
            matchLabels: {
              app: config.name
            }
          },
          template: {
            metadata: {
              labels: {
                app: config.name,
                ...config.labels
              }
            },
            spec: {
              containers: [{
                name: config.name,
                image: config.image,
                ports: [{
                  containerPort: 3000
                }],
                env: Object.entries(config.environment).map(([name, value]) => ({
                  name,
                  value: String(value)
                })),
                resources: {
                  limits: {
                    memory: config.resources.memory,
                    cpu: config.resources.cpus
                  },
                  requests: {
                    memory: '256M',
                    cpu: '0.25'
                  }
                },
                livenessProbe: {
                  httpGet: {
                    path: '/health',
                    port: 3000
                  },
                  initialDelaySeconds: 30,
                  periodSeconds: 10
                },
                readinessProbe: {
                  httpGet: {
                    path: '/ready',
                    port: 3000
                  },
                  initialDelaySeconds: 5,
                  periodSeconds: 5
                }
              }]
            }
          }
        }
      });

      // Service
      manifests.push({
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: `${config.name}-service`,
          namespace: 'hexarchy'
        },
        spec: {
          selector: {
            app: config.name
          },
          ports: [{
            port: 80,
            targetPort: 3000,
            protocol: 'TCP'
          }],
          type: 'ClusterIP'
        }
      });
    }

    return manifests;
  }

  /**
   * Generate Helm chart values
   */
  generateHelmValues() {
    const values = {
      global: {
        image: {
          registry: 'registry.hexarchy.com',
          tag: 'latest'
        },
        ingress: {
          enabled: true,
          className: 'nginx',
          annotations: {
            'cert-manager.io/cluster-issuer': 'letsencrypt-prod'
          }
        }
      },
      domains: {}
    };

    for (const [domainName, config] of this.containers.entries()) {
      values.domains[domainName] = {
        enabled: true,
        replicaCount: 2,
        image: {
          repository: `hexarchy/${domainName}`,
          tag: config.image.split(':')[1] || 'latest'
        },
        service: {
          type: 'ClusterIP',
          port: 80
        },
        ingress: {
          enabled: true,
          hosts: [`${domainName}.hexarchy.com`],
          tls: [{
            secretName: `${domainName}-tls`,
            hosts: [`${domainName}.hexarchy.com`]
          }]
        },
        resources: {
          limits: {
            cpu: config.resources.cpus,
            memory: config.resources.memory
          },
          requests: {
            cpu: '0.25',
            memory: '256M'
          }
        },
        autoscaling: {
          enabled: true,
          minReplicas: 2,
          maxReplicas: 10,
          targetCPUUtilizationPercentage: 80
        }
      };
    }

    return values;
  }

  /**
   * Monitor container health
   */
  async monitorHealth() {
    const healthStatus = new Map();

    for (const [domainName, config] of this.containers.entries()) {
      try {
        // In real implementation, this would check actual container status
        const health = await this._checkContainerHealth(config);
        healthStatus.set(domainName, health);

        if (!health.healthy) {
          logger.warn('Container unhealthy', { 
            domain: domainName,
            status: health.status 
          });

          // Publish health event
          const healthEvent = new DomainEvent(
            EventTypes.SYSTEM_HEALTH_CHECK,
            {
              domain: domainName,
              status: health.status,
              healthy: health.healthy,
              lastCheck: Date.now()
            },
            { source: 'container-manager' }
          );

          await eventBus.publish(healthEvent);
        }
      } catch (error) {
        logger.error('Health check failed', {
          domain: domainName,
          error: error.message
        });
        
        healthStatus.set(domainName, {
          healthy: false,
          status: 'error',
          error: error.message
        });
      }
    }

    return Object.fromEntries(healthStatus);
  }

  async _checkContainerHealth(config) {
    // Simulate health check - in real implementation would use Docker/K8s APIs
    return {
      healthy: true,
      status: 'running',
      uptime: Math.floor(Math.random() * 86400), // Random uptime
      memoryUsage: '45%',
      cpuUsage: '23%'
    };
  }

  /**
   * Get container statistics
   */
  getStats() {
    return {
      totalContainers: this.containers.size,
      runningContainers: this.containers.size, // Simplified
      networks: this.networks.size,
      volumes: this.volumes.size,
      domains: Array.from(this.containers.keys())
    };
  }
}

export const containerManager = new ContainerManager();

// Configure containers for all domains
containerManager.createDomainContainer('foundation', {
  image: 'hexarchy/foundation:latest',
  memory: '256M',
  cpus: '0.25'
});

containerManager.createDomainContainer('intelligence', {
  image: 'hexarchy/intelligence:latest',
  memory: '1G',
  cpus: '1.0',
  environment: {
    PYTORCH_VERSION: '2.0'
  }
});

containerManager.createDomainContainer('communication', {
  image: 'hexarchy/communication:latest',
  memory: '512M',
  cpus: '0.5'
});

containerManager.createDomainContainer('interface', {
  image: 'hexarchy/interface:latest',
  memory: '512M',
  cpus: '0.5'
});

containerManager.createDomainContainer('economy', {
  image: 'hexarchy/economy:latest',
  memory: '512M',
  cpus: '0.5'
});

containerManager.createDomainContainer('governance', {
  image: 'hexarchy/governance:latest',
  memory: '256M',
  cpus: '0.25'
});

containerManager.createDomainContainer('data', {
  image: 'hexarchy/data:latest',
  memory: '1G',
  cpus: '0.75'
});

containerManager.createDomainContainer('operations', {
  image: 'hexarchy/operations:latest',
  memory: '256M',
  cpus: '0.25'
});

export default containerManager;