export class APIGateway {
  constructor() {
    this.routes = new Map();
    this.middleware = [];
    this.stats = { requests: 0, errors: 0 };
  }

  registerRoute(path, handler) {
    this.routes.set(path, handler);
  }

  use(middleware) {
    this.middleware.push(middleware);
  }

  async handleRequest(path, req) {
    this.stats.requests++;
    const handler = this.routes.get(path);
    if (!handler) {
      this.stats.errors++;
      throw new Error('Route not found');
    }
    
    for (const mw of this.middleware) await mw(req);
    return await handler(req);
  }

  getMetrics() {
    return { ...this.stats, routes: this.routes.size };
  }
}

export default new APIGateway();
