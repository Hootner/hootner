// Minimal CDN - Edge Caching, Origin Server, Geographic Distribution
class EdgeServer {
  constructor(location) {
    this.location = location;
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  get(key) {
    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      if (Date.now() < entry.expires) {
        this.hits++;
        console.log(`  ✓ Cache HIT at ${this.location}`);
        return entry.data;
      }
      this.cache.delete(key);
    }
    this.misses++;
    console.log(`  ✗ Cache MISS at ${this.location}`);
    return null;
  }

  set(key, data, ttl = 3600000) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
      cached: Date.now()
    });
  }

  invalidate(key) {
    this.cache.delete(key);
    console.log(`  Invalidated ${key} at ${this.location}`);
  }

  getStats() {
    return {
      location: this.location,
      cacheSize: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits / (this.hits + this.misses) || 0
    };
  }
}

class CDN {
  constructor(originServer) {
    this.origin = originServer;
    this.edges = new Map();
  }

  addEdge(location) {
    this.edges.set(location, new EdgeServer(location));
  }

  // Find nearest edge server
  findNearestEdge(clientLocation) {
    // Simple distance calculation (in real CDN, use geolocation)
    const distances = {
      'us-east': { 'us-east': 0, 'us-west': 3000, 'eu-west': 5000, 'asia': 10000 },
      'us-west': { 'us-east': 3000, 'us-west': 0, 'eu-west': 6000, 'asia': 8000 },
      'eu-west': { 'us-east': 5000, 'us-west': 6000, 'eu-west': 0, 'asia': 7000 },
      'asia': { 'us-east': 10000, 'us-west': 8000, 'eu-west': 7000, 'asia': 0 }
    };

    let nearest = null;
    let minDist = Infinity;

    this.edges.forEach((edge, location) => {
      const dist = distances[clientLocation]?.[location] || Infinity;
      if (dist < minDist) {
        minDist = dist;
        nearest = edge;
      }
    });

    return nearest;
  }

  // Fetch content
  fetch(url, clientLocation) {
    console.log(`Request from ${clientLocation}: ${url}`);
    
    const edge = this.findNearestEdge(clientLocation);
    if (!edge) {
      console.log('  No edge server available');
      return null;
    }

    // Try edge cache
    let content = edge.get(url);
    
    // Cache miss - fetch from origin
    if (!content) {
      console.log(`  Fetching from origin...`);
      content = this.origin.get(url);
      if (content) {
        edge.set(url, content);
      }
    }

    return content;
  }

  // Invalidate across all edges
  invalidate(url) {
    console.log(`Invalidating ${url} across all edges`);
    this.edges.forEach(edge => edge.invalidate(url));
  }

  getStats() {
    const stats = {};
    this.edges.forEach((edge, location) => {
      stats[location] = edge.getStats();
    });
    return stats;
  }
}

// Mock origin server
class OriginServer {
  constructor() {
    this.content = new Map([
      ['/index.html', '<html>Home Page</html>'],
      ['/style.css', 'body { margin: 0; }'],
      ['/app.js', 'console.log("App");']
    ]);
  }

  get(url) {
    return this.content.get(url) || null;
  }
}

// Demo
console.log('=== CDN Demo ===\n');

const origin = new OriginServer();
const cdn = new CDN(origin);

// Add edge servers
cdn.addEdge('us-east');
cdn.addEdge('us-west');
cdn.addEdge('eu-west');
cdn.addEdge('asia');

// Simulate requests
cdn.fetch('/index.html', 'us-east');
cdn.fetch('/index.html', 'us-east'); // Cache hit
cdn.fetch('/index.html', 'eu-west');
cdn.fetch('/style.css', 'asia');
cdn.fetch('/app.js', 'us-west');

// Invalidate and refetch
console.log('\n');
cdn.invalidate('/index.html');
cdn.fetch('/index.html', 'us-east'); // Cache miss after invalidation

console.log('\n=== CDN Stats ===');
console.log(cdn.getStats());

export default CDN;
