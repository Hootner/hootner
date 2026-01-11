/**
 * Database Sharding Service
 * Horizontal scaling with distributed data management
 */

class DatabaseSharding {
  constructor() {
    this.shards = new Map();
    this.shardMaps = new Map();
    this.rebalanceJobs = new Map();
    this.replicationGroups = new Map();
    
    this.initializeShards();
  }

  initializeShards() {
    const shards = [
      { id: 'shard_users_001', database: 'users', keyRange: { min: 0, max: 999999 }, status: 'active' },
      { id: 'shard_users_002', database: 'users', keyRange: { min: 1000000, max: 1999999 }, status: 'active' },
      { id: 'shard_videos_001', database: 'videos', keyRange: { min: 0, max: 499999 }, status: 'active' },
      { id: 'shard_videos_002', database: 'videos', keyRange: { min: 500000, max: 999999 }, status: 'active' }
    ];

    shards.forEach(shard => {
      this.shards.set(shard.id, {
        ...shard,
        host: `db-${shard.id}.hootner.com`,
        port: 5432,
        size: Math.floor(Math.random() * 50) + 10, // 10-60 GB
        connections: Math.floor(Math.random() * 100) + 20,
        maxConnections: 200,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastRebalanced: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    });
  }

  async createShard({ database, shardKey, strategy = 'range', replicationFactor = 2 }) {
    console.log(`🔀 Creating shard for database: ${database} with key: ${shardKey}`);
    
    const shardId = `shard_${database}_${Date.now()}`;
    
    const shard = {
      id: shardId,
      database,
      shardKey,
      strategy,
      replicationFactor,
      status: 'creating',
      createdAt: new Date().toISOString(),
      keyRange: this.calculateKeyRange(database, strategy),
      host: `db-${shardId}.hootner.com`,
      port: 5432,
      size: 0,
      connections: 0,
      maxConnections: 200
    };

    this.shards.set(shardId, shard);
    
    try {
      // Simulate shard creation
      await this.provisionShard(shard);
      
      // Setup replication
      if (replicationFactor > 1) {
        await this.setupReplication(shard, replicationFactor);
      }
      
      // Update shard map
      await this.updateShardMap(database, shard);
      
      shard.status = 'active';
      shard.readyAt = new Date().toISOString();
      
    } catch (error) {
      shard.status = 'failed';
      shard.error = error.message;
    }
    
    return shard;
  }

  calculateKeyRange(database, strategy) {
    const existingShards = Array.from(this.shards.values())
      .filter(s => s.database === database && s.status === 'active');
    
    if (existingShards.length === 0) {
      return { min: 0, max: 999999 };
    }
    
    // Find the largest max value and create next range
    const maxValue = Math.max(...existingShards.map(s => s.keyRange.max));
    
    return {
      min: maxValue + 1,
      max: maxValue + 1000000
    };
  }

  async provisionShard(shard) {
    console.log(`  🏗️ Provisioning shard: ${shard.id}`);
    
    // Simulate provisioning time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Failed to provision shard: Resource allocation failed');
    }
    
    return { provisioned: true, host: shard.host, port: shard.port };
  }

  async setupReplication(shard, replicationFactor) {
    console.log(`  🔄 Setting up replication for ${shard.id} (factor: ${replicationFactor})`);
    
    const replicationGroup = {
      id: `repl_${shard.id}`,
      primaryShard: shard.id,
      replicas: [],
      replicationFactor,
      status: 'active'
    };

    // Create replica shards
    for (let i = 1; i < replicationFactor; i++) {
      const replicaId = `${shard.id}_replica_${i}`;
      const replica = {
        id: replicaId,
        type: 'replica',
        primaryShard: shard.id,
        host: `db-${replicaId}.hootner.com`,
        port: 5432,
        status: 'active',
        lagTime: Math.floor(Math.random() * 100) // 0-100ms lag
      };
      
      replicationGroup.replicas.push(replica);
    }
    
    this.replicationGroups.set(replicationGroup.id, replicationGroup);
    
    return replicationGroup;
  }

  async updateShardMap(database, shard) {
    if (!this.shardMaps.has(database)) {
      this.shardMaps.set(database, {
        database,
        shardKey: shard.shardKey,
        strategy: shard.strategy,
        shards: [],
        createdAt: new Date().toISOString()
      });
    }
    
    const shardMap = this.shardMaps.get(database);
    shardMap.shards.push({
      id: shard.id,
      keyRange: shard.keyRange,
      host: shard.host,
      port: shard.port,
      status: shard.status
    });
    
    shardMap.updatedAt = new Date().toISOString();
    
    return shardMap;
  }

  async routeQuery({ database, shardKey, keyValue, query }) {
    console.log(`🎯 Routing query for ${database}.${shardKey} = ${keyValue}`);
    
    const shardMap = this.shardMaps.get(database);
    if (!shardMap) {
      throw new Error(`No shard map found for database: ${database}`);
    }

    const targetShard = this.findTargetShard(shardMap, keyValue);
    if (!targetShard) {
      throw new Error(`No shard found for key value: ${keyValue}`);
    }

    const routing = {
      database,
      shardKey,
      keyValue,
      targetShard: targetShard.id,
      host: targetShard.host,
      port: targetShard.port,
      query,
      routedAt: new Date().toISOString()
    };

    // Execute query on target shard
    const result = await this.executeQuery(targetShard, query);
    routing.result = result;
    routing.executionTime = result.executionTime;
    
    return routing;
  }

  findTargetShard(shardMap, keyValue) {
    // Convert key value to numeric for range-based sharding
    const numericKey = typeof keyValue === 'string' ? 
      this.hashString(keyValue) : keyValue;
    
    return shardMap.shards.find(shard => 
      numericKey >= shard.keyRange.min && 
      numericKey <= shard.keyRange.max &&
      shard.status === 'active'
    );
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 10000000; // Normalize to 0-10M range
  }

  async executeQuery(shard, query) {
    console.log(`  💾 Executing query on ${shard.id}`);
    
    // Simulate query execution
    const executionTime = Math.random() * 100 + 10; // 10-110ms
    await new Promise(resolve => setTimeout(resolve, Math.min(executionTime, 50)));
    
    return {
      shard: shard.id,
      executionTime: Math.round(executionTime),
      rowsAffected: Math.floor(Math.random() * 1000),
      success: Math.random() > 0.02 // 98% success rate
    };
  }

  async rebalanceShards({ database, strategy = 'auto' }) {
    console.log(`⚖️ Rebalancing shards for database: ${database}`);
    
    const rebalanceId = `rebalance_${Date.now()}`;
    
    const rebalanceJob = {
      id: rebalanceId,
      database,
      strategy,
      status: 'running',
      startTime: new Date().toISOString(),
      steps: []
    };

    this.rebalanceJobs.set(rebalanceId, rebalanceJob);
    
    try {
      // Analyze current distribution
      const analysis = await this.analyzeShardDistribution(database);
      rebalanceJob.steps.push({ step: 'analysis', status: 'completed', timestamp: new Date().toISOString() });
      
      // Identify rebalancing needs
      const rebalancePlan = await this.createRebalancePlan(database, analysis);
      rebalanceJob.steps.push({ step: 'planning', status: 'completed', timestamp: new Date().toISOString() });
      
      // Execute rebalancing
      if (rebalancePlan.actions.length > 0) {
        await this.executeRebalancePlan(rebalancePlan);
        rebalanceJob.steps.push({ step: 'execution', status: 'completed', timestamp: new Date().toISOString() });
      }
      
      rebalanceJob.status = 'completed';
      rebalanceJob.endTime = new Date().toISOString();
      rebalanceJob.result = rebalancePlan;
      
    } catch (error) {
      rebalanceJob.status = 'failed';
      rebalanceJob.error = error.message;
      rebalanceJob.endTime = new Date().toISOString();
    }
    
    return rebalanceJob;
  }

  async analyzeShardDistribution(database) {
    const shards = Array.from(this.shards.values())
      .filter(s => s.database === database && s.status === 'active');
    
    const analysis = {
      database,
      totalShards: shards.length,
      totalSize: shards.reduce((sum, s) => sum + s.size, 0),
      averageSize: 0,
      sizeVariance: 0,
      hotSpots: [],
      recommendations: []
    };

    if (shards.length > 0) {
      analysis.averageSize = analysis.totalSize / shards.length;
      
      // Calculate variance
      const variance = shards.reduce((sum, s) => 
        sum + Math.pow(s.size - analysis.averageSize, 2), 0) / shards.length;
      analysis.sizeVariance = Math.sqrt(variance);
      
      // Identify hot spots (shards significantly larger than average)
      analysis.hotSpots = shards.filter(s => 
        s.size > analysis.averageSize * 1.5
      ).map(s => ({
        shardId: s.id,
        size: s.size,
        deviation: ((s.size - analysis.averageSize) / analysis.averageSize * 100).toFixed(1) + '%'
      }));
      
      // Generate recommendations
      if (analysis.sizeVariance > analysis.averageSize * 0.3) {
        analysis.recommendations.push('High size variance detected - consider rebalancing');
      }
      
      if (analysis.hotSpots.length > 0) {
        analysis.recommendations.push(`${analysis.hotSpots.length} hot spots identified - consider splitting`);
      }
    }
    
    return analysis;
  }

  async createRebalancePlan(database, analysis) {
    const plan = {
      database,
      analysis,
      actions: [],
      estimatedTime: 0,
      riskLevel: 'low'
    };

    // Plan shard splits for hot spots
    analysis.hotSpots.forEach(hotSpot => {
      if (hotSpot.size > analysis.averageSize * 2) {
        plan.actions.push({
          type: 'split_shard',
          shardId: hotSpot.shardId,
          reason: `Shard size ${hotSpot.deviation} above average`,
          estimatedTime: 30 // minutes
        });
        plan.estimatedTime += 30;
      }
    });

    // Plan data migration if needed
    if (analysis.sizeVariance > analysis.averageSize * 0.5) {
      plan.actions.push({
        type: 'migrate_data',
        reason: 'High variance in shard sizes',
        estimatedTime: 60
      });
      plan.estimatedTime += 60;
      plan.riskLevel = 'medium';
    }

    return plan;
  }

  async executeRebalancePlan(plan) {
    console.log(`  🔄 Executing rebalance plan with ${plan.actions.length} actions`);
    
    for (const action of plan.actions) {
      console.log(`    ⚡ Executing: ${action.type} - ${action.reason}`);
      
      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, Math.min(action.estimatedTime * 10, 2000)));
      
      action.status = 'completed';
      action.completedAt = new Date().toISOString();
    }
    
    return { executed: plan.actions.length, totalTime: plan.estimatedTime };
  }

  async implement({ strategy = 'horizontal', shardKey, replication = 'master-slave', autoRebalancing = true }) {
    console.log(`🏗️ Implementing database sharding: ${strategy} strategy`);
    
    const implementation = {
      id: `impl_${Date.now()}`,
      strategy,
      shardKey,
      replication,
      autoRebalancing,
      implementedAt: new Date().toISOString(),
      status: 'active',
      configuration: {
        shardingStrategy: strategy,
        replicationTopology: replication,
        autoRebalancing,
        monitoringEnabled: true,
        backupStrategy: 'per-shard'
      }
    };
    
    return implementation;
  }

  async getShardingMetrics(database, timeRange = '24h') {
    const shards = Array.from(this.shards.values())
      .filter(s => s.database === database);
    
    return {
      database,
      timeRange,
      generatedAt: new Date().toISOString(),
      shardSummary: {
        totalShards: shards.length,
        activeShards: shards.filter(s => s.status === 'active').length,
        totalSize: shards.reduce((sum, s) => sum + s.size, 0),
        averageSize: shards.length > 0 ? shards.reduce((sum, s) => sum + s.size, 0) / shards.length : 0
      },
      performance: {
        averageQueryTime: Math.floor(Math.random() * 50) + 20, // 20-70ms
        throughput: Math.floor(Math.random() * 5000) + 2000, // 2000-7000 QPS
        connectionUtilization: Math.floor(Math.random() * 40) + 30, // 30-70%
        replicationLag: Math.floor(Math.random() * 50) + 10 // 10-60ms
      },
      distribution: {
        sizeVariance: this.calculateSizeVariance(shards),
        hotSpots: shards.filter(s => s.size > 40).length, // Shards > 40GB
        balanceScore: this.calculateBalanceScore(shards)
      },
      rebalancing: {
        lastRebalance: this.getLastRebalanceTime(database),
        scheduledRebalance: this.getNextRebalanceTime(database),
        rebalanceFrequency: 'weekly'
      }
    };
  }

  calculateSizeVariance(shards) {
    if (shards.length === 0) return 0;
    
    const avgSize = shards.reduce((sum, s) => sum + s.size, 0) / shards.length;
    const variance = shards.reduce((sum, s) => sum + Math.pow(s.size - avgSize, 2), 0) / shards.length;
    
    return Math.round(Math.sqrt(variance) * 100) / 100;
  }

  calculateBalanceScore(shards) {
    if (shards.length === 0) return 100;
    
    const avgSize = shards.reduce((sum, s) => sum + s.size, 0) / shards.length;
    const maxDeviation = Math.max(...shards.map(s => Math.abs(s.size - avgSize)));
    
    const score = Math.max(0, 100 - (maxDeviation / avgSize * 100));
    return Math.round(score);
  }

  getLastRebalanceTime(database) {
    const shards = Array.from(this.shards.values())
      .filter(s => s.database === database);
    
    if (shards.length === 0) return null;
    
    const lastRebalance = Math.max(...shards.map(s => new Date(s.lastRebalanced || s.createdAt).getTime()));
    return new Date(lastRebalance).toISOString();
  }

  getNextRebalanceTime(database) {
    const lastRebalance = this.getLastRebalanceTime(database);
    if (!lastRebalance) return null;
    
    const nextRebalance = new Date(new Date(lastRebalance).getTime() + 7 * 24 * 60 * 60 * 1000); // Weekly
    return nextRebalance.toISOString();
  }

  async listShards(database = null) {
    const shards = Array.from(this.shards.values());
    
    if (database) {
      return shards.filter(s => s.database === database);
    }
    
    return shards;
  }

  async getShardMap(database) {
    return this.shardMaps.get(database) || null;
  }

  async getRebalanceJob(jobId) {
    return this.rebalanceJobs.get(jobId) || null;
  }
}

module.exports = new DatabaseSharding();