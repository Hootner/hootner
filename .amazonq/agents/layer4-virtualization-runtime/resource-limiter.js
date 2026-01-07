// Resource Limiter - Layer 4.8
// Control CPU, memory, I/O resources

class ResourceLimiter {
  constructor() {
    this.limits = new Map();
    this.usage = new Map();
  }

  // Set resource limits
  setLimits(id, limits) {
    this.limits.set(id, {
      cpu: limits.cpu || 100,           // Percentage
      memory: limits.memory || Infinity, // Bytes
      io: limits.io || Infinity,         // IOPS
      network: limits.network || Infinity, // Bytes/sec
      processes: limits.processes || Infinity,
      files: limits.files || 1024
    });
    
    this.usage.set(id, {
      cpu: 0,
      memory: 0,
      io: 0,
      network: 0,
      processes: 0,
      files: 0
    });
    
    console.log(`[LIMITER] Set limits for ${id}`);
    return true;
  }

  // Check if resource is available
  canUse(id, resource, amount) {
    const limits = this.limits.get(id);
    const usage = this.usage.get(id);
    
    if (!limits || !usage) return false;
    
    return usage[resource] + amount <= limits[resource];
  }

  // Allocate resource
  allocate(id, resource, amount) {
    if (!this.canUse(id, resource, amount)) {
      console.log(`[LIMITER] ${id}: ${resource} limit exceeded`);
      return false;
    }
    
    const usage = this.usage.get(id);
    usage[resource] += amount;
    
    return true;
  }

  // Release resource
  release(id, resource, amount) {
    const usage = this.usage.get(id);
    if (!usage) return false;
    
    usage[resource] = Math.max(0, usage[resource] - amount);
    return true;
  }

  // CPU throttling
  throttleCPU(id) {
    const limits = this.limits.get(id);
    const usage = this.usage.get(id);
    
    if (!limits || !usage) return;
    
    const percent = (usage.cpu / limits.cpu) * 100;
    
    if (percent > 100) {
      console.log(`[LIMITER] ${id}: CPU throttled (${percent.toFixed(1)}%)`);
      // Simulate throttling
      return true;
    }
    
    return false;
  }

  // Memory pressure
  checkMemory(id) {
    const limits = this.limits.get(id);
    const usage = this.usage.get(id);
    
    if (!limits || !usage) return 'ok';
    
    const percent = (usage.memory / limits.memory) * 100;
    
    if (percent > 90) return 'critical';
    if (percent > 75) return 'high';
    if (percent > 50) return 'medium';
    return 'ok';
  }

  // OOM killer
  oomKill(id) {
    console.log(`[LIMITER] ${id}: Out of memory - killing process`);
    this.usage.delete(id);
    this.limits.delete(id);
  }

  // Get statistics
  stats(id) {
    const limits = this.limits.get(id);
    const usage = this.usage.get(id);
    
    if (!limits || !usage) return null;
    
    return {
      cpu: {
        used: usage.cpu,
        limit: limits.cpu,
        percent: (usage.cpu / limits.cpu * 100).toFixed(1)
      },
      memory: {
        used: usage.memory,
        limit: limits.memory,
        percent: (usage.memory / limits.memory * 100).toFixed(1)
      },
      io: {
        used: usage.io,
        limit: limits.io
      },
      network: {
        used: usage.network,
        limit: limits.network
      }
    };
  }

  // Monitor all resources
  monitor() {
    console.log('\n=== Resource Monitor ===');
    
    this.limits.forEach((limits, id) => {
      const stats = this.stats(id);
      console.log(`\n${id}:`);
      console.log(`  CPU: ${stats.cpu.percent}% (${stats.cpu.used}/${stats.cpu.limit})`);
      console.log(`  Memory: ${stats.memory.percent}% (${stats.memory.used}/${stats.memory.limit})`);
      console.log(`  I/O: ${stats.io.used}/${stats.io.limit} IOPS`);
      console.log(`  Network: ${stats.network.used}/${stats.network.limit} B/s`);
    });
  }
}

// Demo
const limiter = new ResourceLimiter();

// Set limits for container
limiter.setLimits('container-1', {
  cpu: 50,
  memory: 512 * 1024 * 1024,
  io: 1000,
  network: 10 * 1024 * 1024
});

// Simulate resource usage
console.log('\n=== Resource Usage Simulation ===\n');

limiter.allocate('container-1', 'cpu', 30);
limiter.allocate('container-1', 'memory', 256 * 1024 * 1024);
limiter.allocate('container-1', 'io', 500);

console.log('Stats:', limiter.stats('container-1'));

// Try to exceed limit
console.log('\nTrying to allocate more CPU...');
limiter.allocate('container-1', 'cpu', 30);

// Check memory pressure
console.log('\nMemory pressure:', limiter.checkMemory('container-1'));

// Monitor
limiter.monitor();

export default ResourceLimiter;
