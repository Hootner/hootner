#!/usr/bin/env node
/**
 * Layer 5: Load Balancer - Distribute traffic across servers
 * Dependencies: Layer 0 (Logic), Layer 3 (Scheduler), Layer 5 (HTTP)
 */

class LoadBalancer {
  constructor(algorithm = 'round-robin') {
    this.algorithm = algorithm;
    this.servers = [];
    this.currentIndex = 0;
    this.requests = [];
  }

  // Add backend server
  addServer(server) {
    this.servers.push({
      id: server.id,
      host: server.host,
      port: server.port,
      healthy: true,
      connections: 0,
      requests: 0,
      lastCheck: Date.now()
    });
  }

  // Round-robin selection
  roundRobin() {
    const healthy = this.servers.filter(s => s.healthy);
    if (healthy.length === 0) return null;
    
    const server = healthy[this.currentIndex % healthy.length];
    this.currentIndex = (this.currentIndex + 1) % healthy.length;
    return server;
  }

  // Least connections selection
  leastConnections() {
    const healthy = this.servers.filter(s => s.healthy);
    if (healthy.length === 0) return null;
    
    return healthy.reduce((min, s) => 
      s.connections < min.connections ? s : min
    );
  }

  // Weighted selection
  weighted() {
    const healthy = this.servers.filter(s => s.healthy);
    if (healthy.length === 0) return null;
    
    const total = healthy.reduce((sum, s) => sum + (s.weight || 1), 0);
    let random = Math.random() * total;
    
    for (const server of healthy) {
      random -= (server.weight || 1);
      if (random <= 0) return server;
    }
    
    return healthy[0];
  }

  // Select server
  selectServer() {
    switch (this.algorithm) {
      case 'round-robin': return this.roundRobin();
      case 'least-connections': return this.leastConnections();
      case 'weighted': return this.weighted();
      default: return this.roundRobin();
    }
  }

  // Route request
  route(request) {
    const server = this.selectServer();
    if (!server) {
      console.log('[ERROR] No healthy servers available');
      return null;
    }
    
    server.connections++;
    server.requests++;
    
    this.requests.push({
      server: server.id,
      request,
      time: Date.now()
    });
    
    console.log(`[ROUTE] ${request} -> ${server.id} (${server.host}:${server.port})`);
    
    // Simulate response
    setTimeout(() => {
      server.connections--;
    }, 100);
    
    return server;
  }

  // Health check
  healthCheck(serverId, healthy) {
    const server = this.servers.find(s => s.id === serverId);
    if (server) {
      server.healthy = healthy;
      server.lastCheck = Date.now();
      console.log(`[HEALTH] ${serverId} is ${healthy ? 'UP' : 'DOWN'}`);
    }
  }

  // Get statistics
  stats() {
    return {
      algorithm: this.algorithm,
      servers: this.servers.map(s => ({
        id: s.id,
        healthy: s.healthy,
        connections: s.connections,
        requests: s.requests
      })),
      totalRequests: this.requests.length
    };
  }
}

// Demo
if (require.main === module) {
  const lb = new LoadBalancer('round-robin');
  
  console.log('=== Load Balancer Demo ===\n');
  
  // Add servers
  lb.addServer({ id: 'web1', host: '10.0.1.10', port: 8080 });
  lb.addServer({ id: 'web2', host: '10.0.1.11', port: 8080 });
  lb.addServer({ id: 'web3', host: '10.0.1.12', port: 8080 });
  
  // Route requests
  for (let i = 1; i <= 6; i++) {
    lb.route(`GET /api/users/${i}`);
  }
  
  // Mark server unhealthy
  console.log();
  lb.healthCheck('web2', false);
  
  // Continue routing
  console.log();
  for (let i = 7; i <= 9; i++) {
    lb.route(`GET /api/users/${i}`);
  }
  
  console.log('\nStats:', lb.stats());
}

module.exports = LoadBalancer;
