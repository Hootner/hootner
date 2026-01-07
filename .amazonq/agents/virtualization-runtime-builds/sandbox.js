// Minimal Scripting Sandbox
class Sandbox {
  constructor() {
    this.whitelist = ['Math', 'console', 'JSON'];
  }

  eval(code) {
    const sandbox = {};
    this.whitelist.forEach(key => sandbox[key] = global[key]);
    
    const fn = new Function(...Object.keys(sandbox), `"use strict"; return (${code})`);
    return fn(...Object.values(sandbox));
  }
}

const sb = new Sandbox();
console.log(sb.eval('Math.sqrt(16)'));
console.log(sb.eval('2 + 2'));

export default Sandbox;
