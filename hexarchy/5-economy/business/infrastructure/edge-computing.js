/**
 * Edge Computing Service
 * Global content delivery with distributed processing
 */

class EdgeComputing {
  constructor() {
    this.edgeNodes = new Map();
    this.functions = new Map();
    this.deployments = new Map();
    this.executions = new Map();
    
    this.initializeEdgeNodes();
  }

  initializeEdgeNodes() {
    const nodes = [
      { id: 'edge_us_east', region: 'us-east-1', city: 'Virginia', lat: 38.13, lng: -78.45 },
      { id: 'edge_us_west', region: 'us-west-1', city: 'California', lat: 37.35, lng: -121.96 },
      { id: 'edge_eu_west', region: 'eu-west-1', city: 'Ireland', lat: 53.41, lng: -8.24 },
      { id: 'edge_eu_central', region: 'eu-central-1', city: 'Frankfurt', lat: 50.1, lng: 8.68 },
      { id: 'edge_ap_southeast', region: 'ap-southeast-1', city: 'Singapore', lat: 1.37, lng: 103.8 },
      { id: 'edge_ap_northeast', region: 'ap-northeast-1', city: 'Tokyo', lat: 35.41, lng: 139.42 }
    ];

    nodes.forEach(node => {
      this.edgeNodes.set(node.id, {
        ...node,
        status: 'active',
        capacity: {
          cpu: Math.floor(Math.random() * 32) + 16, // 16-48 cores
          memory: Math.floor(Math.random() * 64) + 32, // 32-96 GB
          storage: Math.floor(Math.random() * 500) + 250 // 250-750 GB
        },
        utilization: {
          cpu: Math.random() * 0.7 + 0.1, // 10-80%
          memory: Math.random() * 0.6 + 0.2, // 20-80%
          storage: Math.random() * 0.5 + 0.1 // 10-60%
        },
        functions: [],
        connections: Math.floor(Math.random() * 10000) + 1000,
        latency: Math.floor(Math.random() * 20) + 5, // 5-25ms
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      });
    });
  }

  async deployFunction({ name, code, runtime = 'nodejs', regions = ['us-east'], memory = 128, timeout = 30 }) {
    console.log(`🚀 Deploying edge function: ${name} to regions: ${regions.join(', ')}`);
    
    const functionId = `func_${Date.now()}`;
    
    const edgeFunction = {
      id: functionId,
      name,
      code,
      runtime,
      memory,
      timeout,
      createdAt: new Date().toISOString(),
      status: 'deploying',
      deployments: new Map(),
      executions: 0,
      totalLatency: 0,
      errors: 0
    };

    this.functions.set(functionId, edgeFunction);
    
    try {
      // Deploy to each specified region
      for (const region of regions) {
        const deployment = await this.deployToRegion(functionId, region);
        edgeFunction.deployments.set(region, deployment);
      }
      
      edgeFunction.status = 'active';
      edgeFunction.deployedAt = new Date().toISOString();
      
    } catch (error) {
      edgeFunction.status = 'failed';
      edgeFunction.error = error.message;
    }
    
    return edgeFunction;
  }

  async deployToRegion(functionId, region) {
    console.log(`  📍 Deploying to region: ${region}`);
    
    // Find edge nodes in the region
    const regionNodes = Array.from(this.edgeNodes.values())
      .filter(node => node.region.startsWith(region.split('-')[0]));
    
    if (regionNodes.length === 0) {
      throw new Error(`No edge nodes found in region: ${region}`);
    }

    // Select best node based on utilization
    const targetNode = regionNodes.reduce((best, node) => 
      node.utilization.cpu < best.utilization.cpu ? node : best
    );

    const deployment = {
      nodeId: targetNode.id,
      region,
      deployedAt: new Date().toISOString(),
      status: 'active',
      version: 1,
      size: Math.floor(Math.random() * 10) + 5, // 5-15 MB
      coldStarts: 0,
      warmStarts: 0
    };

    // Simulate deployment time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    // Add function to node
    targetNode.functions.push(functionId);
    
    // Update node utilization
    targetNode.utilization.memory += 0.05; // Small memory increase
    
    return deployment;
  }

  async executeFunction({ functionId, payload = {}, region = 'auto', userId = null }) {
    console.log(`⚡ Executing edge function: ${functionId} in region: ${region}`);
    
    const executionId = `exec_${Date.now()}`;
    const edgeFunction = this.functions.get(functionId);
    
    if (!edgeFunction) {
      throw new Error(`Function ${functionId} not found`);
    }

    const execution = {
      id: executionId,
      functionId,
      payload,
      userId,
      startTime: new Date().toISOString(),
      status: 'running'
    };

    try {
      // Select optimal region
      const targetRegion = region === 'auto' ? 
        await this.selectOptimalRegion(functionId, userId) : region;
      
      const deployment = edgeFunction.deployments.get(targetRegion);
      if (!deployment) {
        throw new Error(`Function not deployed in region: ${targetRegion}`);
      }

      // Execute function
      const result = await this.runFunction(edgeFunction, deployment, payload);
      
      execution.result = result;
      execution.region = targetRegion;
      execution.nodeId = deployment.nodeId;
      execution.duration = result.duration;
      execution.status = 'completed';
      execution.endTime = new Date().toISOString();
      
      // Update function stats
      edgeFunction.executions++;
      edgeFunction.totalLatency += result.duration;
      
      // Update deployment stats
      if (result.coldStart) {
        deployment.coldStarts++;
      } else {
        deployment.warmStarts++;
      }
      
    } catch (error) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.endTime = new Date().toISOString();
      
      edgeFunction.errors++;
    }
    
    this.executions.set(executionId, execution);
    
    return execution;
  }

  async selectOptimalRegion(functionId, userId) {
    const edgeFunction = this.functions.get(functionId);
    const deployedRegions = Array.from(edgeFunction.deployments.keys());
    
    if (deployedRegions.length === 1) {
      return deployedRegions[0];
    }

    // Simple region selection based on user location (mock)
    // In production, this would use geolocation data
    const userRegionMap = {
      'user-us': 'us-east',
      'user-eu': 'eu-west',
      'user-asia': 'ap-southeast'
    };
    
    const userPrefix = userId ? userId.split('-')[0] + '-' + userId.split('-')[1] : 'user-us';
    const preferredRegion = userRegionMap[userPrefix] || 'us-east';
    
    // Return preferred region if function is deployed there
    if (deployedRegions.includes(preferredRegion)) {
      return preferredRegion;
    }
    
    // Otherwise return region with lowest latency
    const regionLatencies = deployedRegions.map(region => {
      const nodes = Array.from(this.edgeNodes.values())
        .filter(node => node.region.startsWith(region.split('-')[0]));
      
      const avgLatency = nodes.reduce((sum, node) => sum + node.latency, 0) / nodes.length;
      return { region, latency: avgLatency };
    });
    
    return regionLatencies.sort((a, b) => a.latency - b.latency)[0].region;
  }

  async runFunction(edgeFunction, deployment, payload) {
    console.log(`  🔧 Running function on node: ${deployment.nodeId}`);
    
    const node = this.edgeNodes.get(deployment.nodeId);
    
    // Determine if this is a cold start
    const coldStart = Math.random() < 0.1; // 10% cold start rate
    
    // Calculate execution time
    const baseTime = coldStart ? 200 : 50; // Cold start penalty
    const executionTime = baseTime + Math.random() * 100; // Add variability
    
    // Simulate function execution
    await new Promise(resolve => setTimeout(resolve, Math.min(executionTime, 200)));
    
    // Simulate occasional failures
    if (Math.random() < 0.02) { // 2% failure rate
      throw new Error('Function execution failed: Runtime error');
    }

    // Mock function result
    const result = {
      success: true,
      output: {
        processed: true,
        timestamp: new Date().toISOString(),
        nodeId: deployment.nodeId,
        region: deployment.region,
        payload: payload
      },
      duration: Math.round(executionTime),
      coldStart,
      memoryUsed: Math.floor(Math.random() * edgeFunction.memory * 0.8) + edgeFunction.memory * 0.2,
      billingDuration: Math.ceil(executionTime / 100) * 100 // Round up to nearest 100ms
    };
    
    return result;
  }

  async distribute({ functions = [], regions = 'global', latency = 'ultra-low' }) {
    console.log(`🌐 Distributing edge functions globally`);
    
    const distribution = {
      id: `dist_${Date.now()}`,
      functions,
      regions: regions === 'global' ? Array.from(this.edgeNodes.keys()) : regions,
      latency,
      distributedAt: new Date().toISOString(),
      status: 'active',
      configuration: {
        autoScaling: true,
        loadBalancing: 'round_robin',
        failover: 'automatic',
        caching: latency === 'ultra-low'
      }
    };
    
    return distribution;
  }

  async getEdgeMetrics(region = null, timeRange = '24h') {
    const nodes = region ? 
      Array.from(this.edgeNodes.values()).filter(node => node.region.startsWith(region.split('-')[0])) :
      Array.from(this.edgeNodes.values());
    
    const functions = Array.from(this.functions.values());
    const executions = Array.from(this.executions.values());
    
    return {
      timeRange,
      generatedAt: new Date().toISOString(),
      nodeMetrics: {
        totalNodes: nodes.length,
        activeNodes: nodes.filter(n => n.status === 'active').length,
        totalCapacity: {
          cpu: nodes.reduce((sum, n) => sum + n.capacity.cpu, 0),
          memory: nodes.reduce((sum, n) => sum + n.capacity.memory, 0),
          storage: nodes.reduce((sum, n) => sum + n.capacity.storage, 0)
        },
        averageUtilization: {
          cpu: Math.round(nodes.reduce((sum, n) => sum + n.utilization.cpu, 0) / nodes.length * 100),
          memory: Math.round(nodes.reduce((sum, n) => sum + n.utilization.memory, 0) / nodes.length * 100),
          storage: Math.round(nodes.reduce((sum, n) => sum + n.utilization.storage, 0) / nodes.length * 100)
        },
        averageLatency: Math.round(nodes.reduce((sum, n) => sum + n.latency, 0) / nodes.length)
      },
      functionMetrics: {
        totalFunctions: functions.length,
        activeFunctions: functions.filter(f => f.status === 'active').length,
        totalExecutions: functions.reduce((sum, f) => sum + f.executions, 0),
        totalErrors: functions.reduce((sum, f) => sum + f.errors, 0),
        averageLatency: this.calculateAverageLatency(functions),
        coldStartRate: this.calculateColdStartRate()
      },
      performance: {
        requestsPerSecond: Math.floor(Math.random() * 10000) + 5000,
        errorRate: this.calculateErrorRate(functions),
        p95Latency: this.calculateP95Latency(executions),
        throughput: this.calculateThroughput(nodes),
        availability: this.calculateAvailability(nodes)
      },
      regionalDistribution: this.getRegionalDistribution(nodes, functions)
    };
  }

  calculateAverageLatency(functions) {
    const totalExecutions = functions.reduce((sum, f) => sum + f.executions, 0);
    const totalLatency = functions.reduce((sum, f) => sum + f.totalLatency, 0);
    
    return totalExecutions > 0 ? Math.round(totalLatency / totalExecutions) : 0;
  }

  calculateColdStartRate() {
    const allDeployments = Array.from(this.functions.values())
      .flatMap(f => Array.from(f.deployments.values()));
    
    const totalStarts = allDeployments.reduce((sum, d) => sum + d.coldStarts + d.warmStarts, 0);
    const coldStarts = allDeployments.reduce((sum, d) => sum + d.coldStarts, 0);
    
    return totalStarts > 0 ? Math.round((coldStarts / totalStarts) * 100) : 0;
  }

  calculateErrorRate(functions) {
    const totalExecutions = functions.reduce((sum, f) => sum + f.executions, 0);
    const totalErrors = functions.reduce((sum, f) => sum + f.errors, 0);
    
    return totalExecutions > 0 ? Math.round((totalErrors / totalExecutions) * 10000) / 100 : 0;
  }

  calculateP95Latency(executions) {
    const durations = executions
      .filter(e => e.duration)
      .map(e => e.duration)
      .sort((a, b) => a - b);
    
    if (durations.length === 0) return 0;
    
    const p95Index = Math.floor(durations.length * 0.95);
    return durations[p95Index] || 0;
  }

  calculateThroughput(nodes) {
    return nodes.reduce((sum, node) => sum + node.connections, 0);
  }

  calculateAvailability(nodes) {
    const activeNodes = nodes.filter(n => n.status === 'active').length;
    return nodes.length > 0 ? Math.round((activeNodes / nodes.length) * 100) : 0;
  }

  getRegionalDistribution(nodes, functions) {
    const regions = {};
    
    nodes.forEach(node => {
      const region = node.region.split('-').slice(0, 2).join('-'); // us-east, eu-west, etc.
      
      if (!regions[region]) {
        regions[region] = {
          nodes: 0,
          functions: 0,
          executions: 0,
          latency: 0
        };
      }
      
      regions[region].nodes++;
      regions[region].functions += node.functions.length;
      regions[region].latency += node.latency;
    });
    
    // Calculate averages
    Object.keys(regions).forEach(region => {
      regions[region].latency = Math.round(regions[region].latency / regions[region].nodes);
      
      // Add execution count
      const regionFunctions = functions.filter(f => 
        Array.from(f.deployments.keys()).some(r => r.startsWith(region))
      );
      regions[region].executions = regionFunctions.reduce((sum, f) => sum + f.executions, 0);
    });
    
    return regions;
  }

  async listEdgeNodes(region = null) {
    const nodes = Array.from(this.edgeNodes.values());
    
    if (region) {
      return nodes.filter(node => node.region.startsWith(region.split('-')[0]));
    }
    
    return nodes.map(node => ({
      id: node.id,
      region: node.region,
      city: node.city,
      status: node.status,
      capacity: node.capacity,
      utilization: node.utilization,
      functions: node.functions.length,
      latency: node.latency
    }));
  }

  async getFunction(functionId) {
    return this.functions.get(functionId) || null;
  }

  async getFunctionLogs(functionId, limit = 100) {
    const executions = Array.from(this.executions.values())
      .filter(exec => exec.functionId === functionId)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, limit);
    
    return executions.map(exec => ({
      executionId: exec.id,
      startTime: exec.startTime,
      duration: exec.duration,
      status: exec.status,
      region: exec.region,
      error: exec.error
    }));
  }

  async scaleFunction({ functionId, regions, minInstances = 1, maxInstances = 10 }) {
    console.log(`📈 Scaling function: ${functionId} across regions: ${regions.join(', ')}`);
    
    const edgeFunction = this.functions.get(functionId);
    if (!edgeFunction) {
      throw new Error(`Function ${functionId} not found`);
    }

    const scaling = {
      functionId,
      regions,
      minInstances,
      maxInstances,
      scaledAt: new Date().toISOString(),
      currentInstances: edgeFunction.deployments.size,
      targetInstances: Math.min(regions.length, maxInstances)
    };
    
    // Deploy to new regions if needed
    for (const region of regions) {
      if (!edgeFunction.deployments.has(region)) {
        const deployment = await this.deployToRegion(functionId, region);
        edgeFunction.deployments.set(region, deployment);
      }
    }
    
    return scaling;
  }

  async deleteFunction(functionId) {
    console.log(`🗑️ Deleting edge function: ${functionId}`);
    
    const edgeFunction = this.functions.get(functionId);
    if (!edgeFunction) {
      throw new Error(`Function ${functionId} not found`);
    }

    // Remove from all edge nodes
    for (const [region, deployment] of edgeFunction.deployments.entries()) {
      const node = this.edgeNodes.get(deployment.nodeId);
      if (node) {
        node.functions = node.functions.filter(id => id !== functionId);
      }
    }
    
    // Delete function
    this.functions.delete(functionId);
    
    return { functionId, deletedAt: new Date().toISOString() };
  }
}

module.exports = new EdgeComputing();