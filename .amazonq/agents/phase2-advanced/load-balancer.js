// Minimal Load Balancer - Round Robin, Least Connections, Health Checks
class LoadBalancer {
  constructor(algorithm = 'round-robin') {
    this.algorithm = algorithm;
    this.servers = [];
    this.currentIndex = 0;
    this.stats = new Map();
  }

  addServer(server) {
    this.servers.push(server);
    this.stats.set(server.id, { requests: 0, activeConnections: 0, healthy: true });
  }

  // Health check
  healthCheck() {
    this.servers.forEach(server => {
      const healthy = server.health();
      this.stats.get(server.id).healthy = healthy;
      console.log(`Server ${server.id}: ${healthy ? '✓ healthy' : '✗ unhealthy'}`);
    });
  }

  // Get healthy servers
  getHealthyServers() {
    return this.servers.filter(s => this.stats.get(s.id).healthy);
  }

  // Round robin
  roundRobin() {
    const healthy = this.getHealthyServers();
    if (healthy.length === 0) return null;
    
    const server = healthy[this.currentIndex % healthy.length];
    this.currentIndex++;
    return server;
  }

  // Least connections
  leastConnections() {
    const healthy = this.getHealthyServers();
    if (healthy.length === 0) return null;
    
    return healthy.reduce((min, server) => {
      const minConns = this.stats.get(min.id).activeConnections;
      const serverConns = this.stats.get(server.id).activeConnections;
      return serverConns < minConns ? server : min;
    });
  }

  // Random
  random() {
    const healthy = this.getHealthyServers();
    if (healthy.length === 0) return null;
    return healthy[Math.floor(Math.random() * healthy.length)];
  }

  // Route request
  route(request) {
    let server;
    switch (this.algorithm) {
      case 'round-robin': server = this.roundRobin(); break;
      case 'least-connections': server = this.leastConnections(); break;
      case 'random': server = this.random(); break;
      default: server = this.roundRobin();
    }

    if (!server) {
      console.log('✗ No healthy servers available');
      return null;
    }

    const stats = this.stats.get(server.id);
    stats.requests++;
    stats.activeConnections++;

    console.log(`→ Routing to ${server.id} (${stats.activeConnections} active)`);
    const response = server.handle(request);
    
    stats.activeConnections--;
    return response;
  }

  getStats() {
    const stats = {};
    this.stats.forEach((data, id) => {
      stats[id] = { ...data };
    });
    return stats;
  }
}

// Mock server
class Server {
  constructor(id, failRate = 0) {
    this.id = id;
    this.failRate = failRate;
  }

  health() {
    return Math.random() > this.failRate;
  }

  handle(request) {
    return { server: this.id, data: `Processed: ${request.data}` };
  }
}

// Demo
console.log('=== Load Balancer Demo ===\n');

const lb = new LoadBalancer('least-connections');
lb.addServer(new Server('server-1', 0));
lb.addServer(new Server('server-2', 0));
lb.addServer(new Server('server-3', 0.3)); // 30% fail rate

// Health check
console.log('Health Check:');
lb.healthCheck();

// Route requests
console.log('\nRouting Requests:');
for (let i = 1; i <= 10; i++) {
  lb.route({ data: `request-${i}` });
}

console.log('\n=== Stats ===');
console.log(lb.getStats());

export default LoadBalancer;
