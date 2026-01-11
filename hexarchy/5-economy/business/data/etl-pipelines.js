/**
 * ETL Pipelines Service
 * Data processing and transformation workflows
 */

class ETLPipelines {
  constructor() {
    this.pipelines = new Map();
    this.executions = new Map();
    this.schedules = new Map();
    
    this.initializeDefaultPipelines();
  }

  initializeDefaultPipelines() {
    // Daily user engagement pipeline
    this.registerPipeline({
      name: 'user_engagement_daily',
      description: 'Daily user engagement aggregation',
      schedule: '0 2 * * *', // 2 AM daily
      steps: [
        { type: 'extract', source: 'raw_events', query: 'SELECT * FROM events WHERE date = CURRENT_DATE - 1' },
        { type: 'transform', operation: 'aggregate_user_sessions' },
        { type: 'load', target: 'user_engagement_daily' }
      ]
    });

    // Revenue reporting pipeline
    this.registerPipeline({
      name: 'revenue_reporting',
      description: 'Revenue and subscription metrics',
      schedule: '0 1 * * *', // 1 AM daily
      steps: [
        { type: 'extract', source: 'transactions', query: 'SELECT * FROM transactions WHERE date >= CURRENT_DATE - 1' },
        { type: 'transform', operation: 'calculate_mrr' },
        { type: 'load', target: 'revenue_facts' }
      ]
    });
  }

  async registerPipeline({ name, description, schedule, steps, enabled = true }) {
    console.log(`📋 Registering ETL pipeline: ${name}`);
    
    const pipeline = {
      name,
      description,
      schedule,
      steps,
      enabled,
      createdAt: new Date().toISOString(),
      lastRun: null,
      nextRun: this.calculateNextRun(schedule),
      status: 'ready'
    };

    this.pipelines.set(name, pipeline);
    
    if (enabled && schedule) {
      this.schedules.set(name, schedule);
    }
    
    return pipeline;
  }

  async runPipeline({ name, parameters = {} }) {
    console.log(`🚀 Running ETL pipeline: ${name}`);
    
    const pipeline = this.pipelines.get(name);
    if (!pipeline) {
      throw new Error(`Pipeline ${name} not found`);
    }

    const executionId = `exec_${name}_${Date.now()}`;
    const execution = {
      id: executionId,
      pipeline: name,
      startTime: new Date().toISOString(),
      status: 'running',
      parameters,
      steps: [],
      metrics: {
        recordsProcessed: 0,
        recordsInserted: 0,
        recordsUpdated: 0,
        recordsSkipped: 0
      }
    };

    this.executions.set(executionId, execution);
    pipeline.status = 'running';
    
    try {
      for (const [index, step] of pipeline.steps.entries()) {
        const stepResult = await this.executeStep(step, execution, index);
        execution.steps.push(stepResult);
        
        if (!stepResult.success) {
          throw new Error(`Step ${index + 1} failed: ${stepResult.error}`);
        }
      }
      
      execution.status = 'completed';
      execution.endTime = new Date().toISOString();
      execution.duration = Date.now() - new Date(execution.startTime).getTime();
      
      pipeline.status = 'ready';
      pipeline.lastRun = execution.endTime;
      pipeline.nextRun = this.calculateNextRun(pipeline.schedule);
      
    } catch (error) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.endTime = new Date().toISOString();
      
      pipeline.status = 'error';
      
      console.error(`❌ Pipeline ${name} failed:`, error.message);
    }
    
    return execution;
  }

  async executeStep(step, execution, stepIndex) {
    console.log(`  📝 Executing step ${stepIndex + 1}: ${step.type}`);
    
    const stepExecution = {
      stepIndex,
      type: step.type,
      startTime: new Date().toISOString(),
      success: false,
      recordsProcessed: 0,
      error: null
    };

    try {
      switch (step.type) {
        case 'extract':
          stepExecution.data = await this.extractData(step);
          break;
        case 'transform':
          stepExecution.data = await this.transformData(step, execution.steps);
          break;
        case 'load':
          stepExecution.result = await this.loadData(step, execution.steps);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }
      
      stepExecution.success = true;
      stepExecution.recordsProcessed = Array.isArray(stepExecution.data) ? stepExecution.data.length : 1;
      
    } catch (error) {
      stepExecution.error = error.message;
    }
    
    stepExecution.endTime = new Date().toISOString();
    stepExecution.duration = Date.now() - new Date(stepExecution.startTime).getTime();
    
    // Update execution metrics
    execution.metrics.recordsProcessed += stepExecution.recordsProcessed;
    
    return stepExecution;
  }

  async extractData(step) {
    // Mock data extraction - replace with actual database queries
    const mockData = {
      raw_events: [
        { user_id: 'u1', event_type: 'video_view', timestamp: new Date().toISOString() },
        { user_id: 'u2', event_type: 'video_upload', timestamp: new Date().toISOString() }
      ],
      transactions: [
        { user_id: 'u1', amount: 9.99, plan: 'pro', timestamp: new Date().toISOString() },
        { user_id: 'u2', amount: 19.99, plan: 'enterprise', timestamp: new Date().toISOString() }
      ]
    };
    
    return mockData[step.source] || [];
  }

  async transformData(step, previousSteps) {
    const extractStep = previousSteps.find(s => s.type === 'extract');
    if (!extractStep || !extractStep.data) {
      throw new Error('No data from extract step');
    }

    const data = extractStep.data;
    
    switch (step.operation) {
      case 'aggregate_user_sessions':
        return this.aggregateUserSessions(data);
      case 'calculate_mrr':
        return this.calculateMRR(data);
      case 'deduplicate':
        return this.deduplicateRecords(data);
      case 'enrich_user_data':
        return this.enrichUserData(data);
      default:
        return data; // Pass through
    }
  }

  aggregateUserSessions(events) {
    const sessions = new Map();
    
    events.forEach(event => {
      const key = `${event.user_id}_${new Date(event.timestamp).toDateString()}`;
      
      if (!sessions.has(key)) {
        sessions.set(key, {
          user_id: event.user_id,
          date: new Date(event.timestamp).toISOString().split('T')[0],
          events: 0,
          session_duration: 0,
          last_activity: event.timestamp
        });
      }
      
      const session = sessions.get(key);
      session.events++;
      session.last_activity = event.timestamp;
    });
    
    return Array.from(sessions.values());
  }

  calculateMRR(transactions) {
    const mrr = new Map();
    
    transactions.forEach(txn => {
      const monthKey = new Date(txn.timestamp).toISOString().substring(0, 7); // YYYY-MM
      
      if (!mrr.has(monthKey)) {
        mrr.set(monthKey, { month: monthKey, revenue: 0, subscribers: new Set() });
      }
      
      const monthData = mrr.get(monthKey);
      monthData.revenue += txn.amount;
      monthData.subscribers.add(txn.user_id);
    });
    
    return Array.from(mrr.values()).map(m => ({
      ...m,
      subscribers: m.subscribers.size
    }));
  }

  deduplicateRecords(data) {
    const seen = new Set();
    return data.filter(record => {
      const key = JSON.stringify(record);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  enrichUserData(data) {
    // Mock user enrichment
    return data.map(record => ({
      ...record,
      enriched_at: new Date().toISOString(),
      user_segment: Math.random() > 0.5 ? 'premium' : 'free'
    }));
  }

  async loadData(step, previousSteps) {
    const transformStep = previousSteps.find(s => s.type === 'transform');
    const data = transformStep ? transformStep.data : previousSteps[previousSteps.length - 1].data;
    
    if (!data) {
      throw new Error('No data to load');
    }

    // Mock data loading - replace with actual database operations
    console.log(`    💾 Loading ${data.length} records to ${step.target}`);
    
    return {
      target: step.target,
      recordsLoaded: data.length,
      loadTime: new Date().toISOString()
    };
  }

  calculateNextRun(schedule) {
    if (!schedule) return null;
    
    // Simple schedule parsing - in production use cron parser
    const now = new Date();
    const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Next day
    
    return nextRun.toISOString();
  }

  async getPipelineStatus(name) {
    const pipeline = this.pipelines.get(name);
    if (!pipeline) {
      throw new Error(`Pipeline ${name} not found`);
    }

    const recentExecutions = Array.from(this.executions.values())
      .filter(exec => exec.pipeline === name)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, 10);

    return {
      pipeline: pipeline.name,
      status: pipeline.status,
      lastRun: pipeline.lastRun,
      nextRun: pipeline.nextRun,
      recentExecutions: recentExecutions.map(exec => ({
        id: exec.id,
        status: exec.status,
        startTime: exec.startTime,
        duration: exec.duration,
        recordsProcessed: exec.metrics.recordsProcessed
      }))
    };
  }

  async execute({ pipeline, source = 'raw_events', target = 'analytics_db' }) {
    console.log(`🚀 Executing ETL pipeline: ${pipeline}`);
    return await this.runPipeline({ name: pipeline, parameters: { source, target } });
  }

  async listPipelines() {
    return Array.from(this.pipelines.values()).map(p => ({
      name: p.name,
      description: p.description,
      status: p.status,
      enabled: p.enabled,
      lastRun: p.lastRun,
      nextRun: p.nextRun
    }));
  }
}

module.exports = new ETLPipelines();