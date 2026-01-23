export class LoadBalancer {
  constructor() {
    this.backends = [];
    this.algorithm = 'round-robin';
    this.currentIndex = 0;
    this.stats = new Map();
  }

  addBackend(id, url, weight = 1) {
    this.backends.push({ id, url, weight, healthy: true });
    this.stats.set(id, { requests: 0, errors: 0 });
  }

  getNext() {
    const healthy = this.backends.filter(b => b.healthy);
    if (healthy.length === 0) throw new Error('No healthy backends');

    if (this.algorithm === 'round-robin') {
      const backend = healthy[this.currentIndex % healthy.length];
      this.currentIndex++;
      return backend;
    }
  }

  async route(request) {
    const backend = this.getNext();
    const stats = this.stats.get(backend.id);
    stats.requests++;
    
    try {
      return { backend: backend.id, status: 'success' };
    } catch (error) {
      stats.errors++;
      backend.healthy = false;
      throw error;
    }
  }

  getStats() {
    return {
      backends: this.backends.length,
      healthy: this.backends.filter(b => b.healthy).length,
      stats: Object.fromEntries(this.stats)
    };
  }
}

export default new LoadBalancer();
