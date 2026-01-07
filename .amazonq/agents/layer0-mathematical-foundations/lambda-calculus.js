// Lambda Calculus Interpreter - Layer 0.6
// Foundation: Pure functional computation

class Lambda {
  // Parse lambda expression
  parse(expr) {
    expr = expr.replace(/\s+/g, '');
    
    if (expr.match(/^[a-z]$/)) {
      return { type: 'var', name: expr };
    }
    
    if (expr.match(/^λ[a-z]\./)) {
      const param = expr[1];
      const body = expr.slice(3);
      return { type: 'abs', param, body: this.parse(body) };
    }
    
    if (expr.match(/^\(/)) {
      const end = this.findMatchingParen(expr);
      const fn = expr.slice(1, end);
      const arg = expr.slice(end + 1);
      return { type: 'app', fn: this.parse(fn), arg: this.parse(arg) };
    }
    
    return { type: 'var', name: expr };
  }

  findMatchingParen(expr) {
    let depth = 0;
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') depth++;
      if (expr[i] === ')') depth--;
      if (depth === 0) return i;
    }
    return expr.length;
  }

  // Beta reduction
  reduce(expr, env = {}) {
    if (expr.type === 'var') {
      return env[expr.name] || expr;
    }
    
    if (expr.type === 'abs') {
      return expr;
    }
    
    if (expr.type === 'app') {
      const fn = this.reduce(expr.fn, env);
      const arg = this.reduce(expr.arg, env);
      
      if (fn.type === 'abs') {
        const newEnv = { ...env, [fn.param]: arg };
        return this.reduce(fn.body, newEnv);
      }
      
      return { type: 'app', fn, arg };
    }
    
    return expr;
  }

  // Pretty print
  print(expr) {
    if (expr.type === 'var') return expr.name;
    if (expr.type === 'abs') return `λ${expr.param}.${this.print(expr.body)}`;
    if (expr.type === 'app') return `(${this.print(expr.fn)} ${this.print(expr.arg)})`;
    return '?';
  }

  // Church numerals
  churchNumeral(n) {
    let body = { type: 'var', name: 'x' };
    for (let i = 0; i < n; i++) {
      body = { type: 'app', fn: { type: 'var', name: 'f' }, arg: body };
    }
    return { type: 'abs', param: 'f', body: { type: 'abs', param: 'x', body } };
  }
}

// Demo
const lc = new Lambda();

// Identity: λx.x
const id = { type: 'abs', param: 'x', body: { type: 'var', name: 'x' } };
console.log('Identity:', lc.print(id));

// Apply identity to 'a'
const app = { type: 'app', fn: id, arg: { type: 'var', name: 'a' } };
console.log('(λx.x) a →', lc.print(lc.reduce(app)));

// Church numeral 2
console.log('Church 2:', lc.print(lc.churchNumeral(2)));

export default Lambda;
