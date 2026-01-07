// Sandbox - Layer 4.6
// Secure execution environment for untrusted code

class Sandbox {
  constructor(options = {}) {
    this.timeout = options.timeout || 5000;
    this.memoryLimit = options.memoryLimit || 10 * 1024 * 1024;
    this.whitelist = options.whitelist || ['Math', 'JSON', 'Array', 'Object', 'String'];
    this.blacklist = options.blacklist || ['eval', 'Function', 'require', 'import'];
  }

  // Create isolated context
  createContext() {
    const context = {};
    
    // Add whitelisted globals
    this.whitelist.forEach(name => {
      if (typeof global[name] !== 'undefined') {
        context[name] = global[name];
      }
    });
    
    // Add safe console
    context.console = {
      log: (...args) => console.log('[SANDBOX]', ...args),
      error: (...args) => console.error('[SANDBOX]', ...args)
    };
    
    return context;
  }

  // Check code safety
  checkCode(code) {
    // Check for blacklisted keywords
    for (const keyword of this.blacklist) {
      if (code.includes(keyword)) {
        throw new Error(`Forbidden keyword: ${keyword}`);
      }
    }
    
    // Check for dangerous patterns
    const dangerous = [
      /process\./,
      /require\(/,
      /import\s/,
      /__dirname/,
      /__filename/,
      /global\./,
      /this\./
    ];
    
    for (const pattern of dangerous) {
      if (pattern.test(code)) {
        throw new Error(`Dangerous pattern detected: ${pattern}`);
      }
    }
    
    return true;
  }

  // Execute code safely
  execute(code) {
    try {
      // Check code
      this.checkCode(code);
      
      // Create context
      const context = this.createContext();
      
      // Wrap in function
      const keys = Object.keys(context);
      const values = Object.values(context);
      const fn = new Function(...keys, `"use strict"; return (${code})`);
      
      // Execute with timeout
      const result = this.executeWithTimeout(() => fn(...values), this.timeout);
      
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Execute with timeout
  executeWithTimeout(fn, timeout) {
    const start = Date.now();
    let result;
    
    // Simple timeout check (not true async timeout)
    try {
      result = fn();
      
      if (Date.now() - start > timeout) {
        throw new Error('Execution timeout');
      }
    } catch (error) {
      throw error;
    }
    
    return result;
  }

  // Execute async code
  async executeAsync(code) {
    try {
      this.checkCode(code);
      
      const context = this.createContext();
      const keys = Object.keys(context);
      const values = Object.values(context);
      
      const fn = new Function(...keys, `"use strict"; return (async () => { ${code} })()`);
      
      const promise = fn(...values);
      const result = await Promise.race([
        promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), this.timeout)
        )
      ]);
      
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Resource monitoring
  monitor(fn) {
    const start = process.memoryUsage();
    const startTime = Date.now();
    
    const result = fn();
    
    const end = process.memoryUsage();
    const endTime = Date.now();
    
    return {
      result,
      stats: {
        time: endTime - startTime,
        memory: end.heapUsed - start.heapUsed
      }
    };
  }
}

// Demo
const sandbox = new Sandbox({
  timeout: 1000,
  whitelist: ['Math', 'JSON', 'console']
});

console.log('=== Sandbox Demo ===\n');

// Safe code
console.log('1. Safe code:');
const result1 = sandbox.execute('Math.sqrt(16) + 10');
console.log(result1);

// Safe with console
console.log('\n2. With console:');
const result2 = sandbox.execute('console.log("Hello"); 42');
console.log(result2);

// Unsafe code (blocked)
console.log('\n3. Unsafe code:');
const result3 = sandbox.execute('process.exit()');
console.log(result3);

// Complex calculation
console.log('\n4. Complex calculation:');
const result4 = sandbox.execute(`
  const arr = [1, 2, 3, 4, 5];
  arr.reduce((a, b) => a + b, 0)
`);
console.log(result4);

export default Sandbox;
