// Minimal Chaos Engineering - Fault Injection, Resilience Testing
class ChaosExperiment {
  constructor(name, config = {}) {
    this.name = name;
    this.duration = config.duration || 5000;
    this.faultRate = config.faultRate || 0.3;
    this.results = [];
  }

  // Fault injectors
  injectLatency(fn, delayMs = 1000) {
    return async (...args) => {
      if (Math.random() < this.faultRate) {
        console.log(`  ⚠️  Injecting ${delayMs}ms latency`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      return fn(...args);
    };
  }

  injectFailure(fn, errorMsg = 'Service unavailable') {
    return (...args) => {
      if (Math.random() < this.faultRate) {
        console.log(`  ✗ Injecting failure: ${errorMsg}`);
        throw new Error(errorMsg);
      }
      return fn(...args);
    };
  }

  injectPartialFailure(fn) {
    return (...args) => {
      if (Math.random() < this.faultRate) {
        console.log(`  ⚠️  Injecting partial failure (null response)`);
        return null;
      }
      return fn(...args);
    };
  }

  injectResourceExhaustion(fn) {
    let resources = 10;
    return (...args) => {
      if (resources <= 0) {
        console.log(`  ✗ Resource exhausted`);
        throw new Error('Out of resources');
      }
      if (Math.random() < this.faultRate) {
        resources -= 5;
        console.log(`  ⚠️  Resource drain (${resources} remaining)`);
      }
      return fn(...args);
    };
  }

  // Run experiment
  async run(system, workload) {
    console.log(`\n=== Chaos Experiment: ${this.name} ===`);
    console.log(`Duration: ${this.duration}ms, Fault rate: ${this.faultRate * 100}%\n`);

    const startTime = Date.now();
    let requests = 0;
    let successes = 0;
    let failures = 0;

    while (Date.now() - startTime < this.duration) {
      requests++;
      
      try {
        await workload(system);
        successes++;
      } catch (error) {
        failures++;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const report = {
      experiment: this.name,
      requests,
      successes,
      failures,
      successRate: (successes / requests * 100).toFixed(1) + '%',
      failureRate: (failures / requests * 100).toFixed(1) + '%'
    };

    this.results.push(report);
    return report;
  }
}

class ChaosMonkey {
  constructor() {
    this.experiments = [];
  }

  addExperiment(experiment) {
    this.experiments.push(experiment);
  }

  async runAll(system, workload) {
    console.log('=== Chaos Monkey Starting ===\n');
    
    const results = [];
    for (const experiment of this.experiments) {
      const result = await experiment.run(system, workload);
      results.push(result);
    }

    this.printSummary(results);
    return results;
  }

  printSummary(results) {
    console.log('\n=== Chaos Testing Summary ===\n');
    results.forEach(r => {
      console.log(`${r.experiment}:`);
      console.log(`  Requests: ${r.requests}`);
      console.log(`  Success rate: ${r.successRate}`);
      console.log(`  Failure rate: ${r.failureRate}\n`);
    });
  }
}

// Demo: Test resilient system
console.log('=== Chaos Engineering Demo ===\n');

// Mock service
class Service {
  constructor() {
    this.retries = 3;
  }

  async call(data) {
    return `Processed: ${data}`;
  }

  async callWithRetry(data) {
    for (let i = 0; i < this.retries; i++) {
      try {
        return await this.call(data);
      } catch (error) {
        if (i === this.retries - 1) throw error;
        console.log(`  Retry ${i + 1}/${this.retries}`);
      }
    }
  }
}

const service = new Service();
const monkey = new ChaosMonkey();

// Experiment 1: Latency injection
const latencyExp = new ChaosExperiment('Latency Injection', { 
  duration: 2000, 
  faultRate: 0.5 
});
service.call = latencyExp.injectLatency(service.call.bind(service), 500);
monkey.addExperiment(latencyExp);

// Experiment 2: Failure injection
const failureExp = new ChaosExperiment('Failure Injection', { 
  duration: 2000, 
  faultRate: 0.3 
});
const originalCall = service.call;
service.call = failureExp.injectFailure(originalCall.bind(service));
monkey.addExperiment(failureExp);

// Run chaos tests
(async () => {
  await monkey.runAll(service, async (svc) => {
    await svc.callWithRetry('test-data');
  });
})();

export { ChaosExperiment, ChaosMonkey };
