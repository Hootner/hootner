import integrationHub from '../0-core/aws/integration-hub.js'
import aiConnector from '../2-intelligence/ai-services/aws-connector.js'
import usageTracking from '../5-economy/business/analytics/usage-tracking.js'
import securityIntegration from '../6-governance/compliance/security-integration.js'
import monitoringService from '../8-operations/monitoring/monitoring-service.js'
import fraudDetection from '../5-economy/fraud-detection/payment-fraud-service.js'

export class ServiceOrchestrator {
  constructor() {
    this.services = new Map()
    this.pipelines = new Map()
    this.isInitialized = false
  }

  async initialize() {
    console.log('🚀 Initializing 120-Pipe Service Orchestrator...')

    // Initialize all services
    await integrationHub.initialize()
    await monitoringService.initialize()

    // Register services
    this.services.set('integration-hub', integrationHub)
    this.services.set('ai-connector', aiConnector)
    this.services.set('usage-tracking', usageTracking)
    this.services.set('security-integration', securityIntegration)
    this.services.set('monitoring', monitoringService)
    this.services.set('fraud-detection', fraudDetection)

    // Setup interconnected pipelines
    await this.setupPipelines()

    this.isInitialized = true
    console.log('✅ 120-Pipe Service Orchestrator initialized')
  }

  async setupPipelines() {
    // Video Processing Pipeline (PIPES 1-30)
    this.pipelines.set('video-processing', {
      trigger: 's3:ObjectCreated',
      steps: [
        { service: 'ai-connector', method: 'processVideoGeneration' },
        { service: 'monitoring', method: 'trackVideoProcessing' },
        { service: 'usage-tracking', method: 'trackUsage' }
      ]
    })

    // Security Pipeline (PIPES 31-60)
    this.pipelines.set('security-scanning', {
      trigger: 'api:request',
      steps: [
        { service: 'security-integration', method: 'scanAPIEndpoint' },
        { service: 'monitoring', method: 'trackAPIPerformance' },
        { service: 'usage-tracking', method: 'trackUsage' }
      ]
    })

    // Payment Pipeline (PIPES 61-90)
    this.pipelines.set('payment-processing', {
      trigger: 'stripe:webhook',
      steps: [
        { service: 'fraud-detection', method: 'analyzeTransaction' },
        { service: 'usage-tracking', method: 'updateStripeUsage' },
        { service: 'monitoring', method: 'trackBusinessMetrics' }
      ]
    })

    // Analytics Pipeline (PIPES 91-120)
    this.pipelines.set('analytics-processing', {
      trigger: 'user:activity',
      steps: [
        { service: 'monitoring', method: 'trackUserActivity' },
        { service: 'usage-tracking', method: 'trackUsage' },
        { service: 'ai-connector', method: 'moderateContent' }
      ]
    })
  }

  async executePipeline(pipelineName, data) {
    if (!this.isInitialized) {
      throw new Error('Service orchestrator not initialized')
    }

    const pipeline = this.pipelines.get(pipelineName)
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineName} not found`)
    }

    console.log(`🔄 Executing pipeline: ${pipelineName}`)
    const results = []

    for (const step of pipeline.steps) {
      try {
        const service = this.services.get(step.service)
        if (!service || !service[step.method]) {
          throw new Error(`Service method ${step.service}.${step.method} not found`)
        }

        const result = await service[step.method](data)
        results.push({ step: step.service, result })
        
        console.log(`  ✅ ${step.service}.${step.method} completed`)
      } catch (error) {
        console.error(`  ❌ ${step.service}.${step.method} failed:`, error.message)
        results.push({ step: step.service, error: error.message })
      }
    }

    return { pipeline: pipelineName, results }
  }

  async processVideoUpload(videoData) {
    return await this.executePipeline('video-processing', videoData)
  }

  async processAPIRequest(requestData) {
    return await this.executePipeline('security-scanning', requestData)
  }

  async processPayment(paymentData) {
    return await this.executePipeline('payment-processing', paymentData)
  }

  async processUserActivity(activityData) {
    return await this.executePipeline('analytics-processing', activityData)
  }

  getServiceStatus() {
    const status = {}
    for (const [name, service] of this.services) {
      status[name] = {
        initialized: !!service,
        methods: Object.getOwnPropertyNames(Object.getPrototypeOf(service))
          .filter(name => name !== 'constructor' && typeof service[name] === 'function')
      }
    }
    return status
  }

  getPipelineStatus() {
    return Array.from(this.pipelines.keys()).map(name => ({
      name,
      steps: this.pipelines.get(name).steps.length,
      trigger: this.pipelines.get(name).trigger
    }))
  }

  async healthCheck() {
    const health = {
      orchestrator: this.isInitialized,
      services: {},
      pipelines: this.pipelines.size,
      timestamp: new Date().toISOString()
    }

    for (const [name, service] of this.services) {
      try {
        // Try to call a basic method if available
        if (service.healthCheck) {
          health.services[name] = await service.healthCheck()
        } else {
          health.services[name] = { status: 'active' }
        }
      } catch (error) {
        health.services[name] = { status: 'error', error: error.message }
      }
    }

    return health
  }
}

export default new ServiceOrchestrator()