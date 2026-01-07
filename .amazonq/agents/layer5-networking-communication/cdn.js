#!/usr/bin/env node
/**
 * Layer 5: CDN (Content Delivery Network) - Distributed content caching
 * Dependencies: Layer 3 (Memory), Layer 5 (HTTP, Proxy, Load Balancer)
 */

class CDN {
  constructor() {
    this.edges = new Map();
    this.origins = [];
    this.requests = [];
  }

  // Add edge location
  addEdge(location, region) {
    this.edges.set(location, {
      location,
      region,
      cache: new Map(),
      hits: 0,
      misses: 0
    });
    console.log(`[EDGE] Added ${location} (${region})`);
  }

  // Add origin server
  addOrigin(url) {
    this.origins.push(url);
    console.log(`[ORIGIN] Added ${url}`);
  }

  // Select nearest edge
  selectEdge(clientLocation) {
    // Simple selection based on region match
    for (const [loc, edge] of this.edges) {
      if (edge.region === clientLocation.region) {
        return edge;
      }
    }
    // Fallback to first edge
    return this.edges.values().next().value;
  }

  // Fetch from origin
  async fetchFromOrigin(path) {
    const origin = this.origins[0];
    console.log(`[ORIGIN FETCH] ${origin}${path}`);
    
    // Simulate origin fetch
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      path,
      content: `Content for ${path}`,
      headers: {
        'content-type': 'text/html',
        'cache-control': 'max-age=3600'
      },
      timestamp: Date.now()
    };
  }

  // Handle request
  async request(path, clientLocation) {
    const edge = this.selectEdge(clientLocation);
    
    console.log(`[REQUEST] ${path} from ${clientLocation.city} -> ${edge.location}`);
    
    // Check edge cache
    if (edge.cache.has(path)) {
      const cached = edge.cache.get(path);
      const age = Date.now() - cached.timestamp;
      
      if (age < 3600000) { // 1 hour TTL
        edge.hits++;
        console.log(`[CACHE HIT] ${edge.location}`);
        
        this.requests.push({
          path,
          edge: edge.location,
          cached: true,
          latency: 5,
          time: Date.now()
        });
        
        return cached;
      }
      
      edge.cache.delete(path);
    }
    
    // Cache miss - fetch from origin
    edge.misses++;
    console.log(`[CACHE MISS] ${edge.location}`);
    
    const content = await this.fetchFromOrigin(path);
    edge.cache.set(path, content);
    
    this.requests.push({
      path,
      edge: edge.location,
      cached: false,
      latency: 55,
      time: Date.now()
    });
    
    return content;
  }

  // Purge cache
  purge(path = null) {
    if (path) {
      // Purge specific path from all edges
      for (const edge of this.edges.values()) {
        edge.cache.delete(path);
      }
      console.log(`[PURGE] ${path} from all edges`);
    } else {
      // Purge all caches
      for (const edge of this.edges.values()) {
        edge.cache.clear();
      }
      console.log('[PURGE] All caches cleared');
    }
  }

  // Get statistics
  stats() {
    const edgeStats = Array.from(this.edges.values()).map(e => ({
      location: e.location,
      cached: e.cache.size,
      hits: e.hits,
      misses: e.misses,
      hitRate: e.hits + e.misses > 0 
        ? (e.hits / (e.hits + e.misses) * 100).toFixed(1) + '%'
        : '0%'
    }));
    
    const avgLatency = this.requests.length > 0
      ? (this.requests.reduce((sum, r) => sum + r.latency, 0) / this.requests.length).toFixed(1)
      : 0;
    
    return {
      edges: edgeStats,
      requests: this.requests.length,
      avgLatency: avgLatency + 'ms'
    };
  }
}

// Demo
if (require.main === module) {
  const cdn = new CDN();
  
  console.log('=== CDN Demo ===\n');
  
  // Setup CDN
  cdn.addEdge('us-east-1', 'us-east');
  cdn.addEdge('eu-west-1', 'eu-west');
  cdn.addEdge('ap-south-1', 'ap-south');
  cdn.addOrigin('https://origin.example.com');
  
  console.log();
  
  (async () => {
    // Requests from different locations
    await cdn.request('/index.html', { city: 'New York', region: 'us-east' });
    await cdn.request('/index.html', { city: 'Boston', region: 'us-east' }); // Cache hit
    await cdn.request('/style.css', { city: 'London', region: 'eu-west' });
    await cdn.request('/index.html', { city: 'Mumbai', region: 'ap-south' });
    
    console.log('\nStats:', cdn.stats());
    
    // Purge cache
    console.log();
    cdn.purge('/index.html');
  })();
}

module.exports = CDN;
