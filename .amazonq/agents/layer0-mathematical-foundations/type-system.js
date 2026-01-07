// Type System - Layer 0.7
// Foundation: Type checking and inference

class TypeSystem {
  constructor() {
    this.types = new Map();
    this.constraints = [];
  }

  // Primitive types
  int() { return { kind: 'int' }; }
  bool() { return { kind: 'bool' }; }
  string() { return { kind: 'string' }; }
  
  // Function type
  fn(from, to) { return { kind: 'fn', from, to }; }
  
  // Type variable
  var(name) { return { kind: 'var', name }; }

  // Check if types match
  unify(t1, t2) {
    if (t1.kind === 'var') return this.bind(t1.name, t2);
    if (t2.kind === 'var') return this.bind(t2.name, t1);
    
    if (t1.kind !== t2.kind) return false;
    
    if (t1.kind === 'fn') {
      return this.unify(t1.from, t2.from) && this.unify(t1.to, t2.to);
    }
    
    return true;
  }

  bind(name, type) {
    this.types.set(name, type);
    return true;
  }

  // Infer type of expression
  infer(expr, env = {}) {
    if (typeof expr === 'number') return this.int();
    if (typeof expr === 'boolean') return this.bool();
    if (typeof expr === 'string') return this.string();
    
    if (expr.type === 'var') {
      return env[expr.name] || this.var(expr.name);
    }
    
    if (expr.type === 'fn') {
      const paramType = this.var(`t${this.types.size}`);
      const newEnv = { ...env, [expr.param]: paramType };
      const bodyType = this.infer(expr.body, newEnv);
      return this.fn(paramType, bodyType);
    }
    
    if (expr.type === 'app') {
      const fnType = this.infer(expr.fn, env);
      const argType = this.infer(expr.arg, env);
      const resultType = this.var(`t${this.types.size}`);
      
      this.unify(fnType, this.fn(argType, resultType));
      return resultType;
    }
    
    return this.var('unknown');
  }

  // Pretty print type
  print(type) {
    if (!type) return '?';
    if (type.kind === 'int') return 'Int';
    if (type.kind === 'bool') return 'Bool';
    if (type.kind === 'string') return 'String';
    if (type.kind === 'var') return type.name;
    if (type.kind === 'fn') return `(${this.print(type.from)} → ${this.print(type.to)})`;
    return '?';
  }
}

// Demo
const ts = new TypeSystem();

// Check: 5 : Int
console.log('5 :', ts.print(ts.infer(5)));

// Check: true : Bool
console.log('true :', ts.print(ts.infer(true)));

// Check: λx.x : a → a
const id = { type: 'fn', param: 'x', body: { type: 'var', name: 'x' } };
console.log('λx.x :', ts.print(ts.infer(id)));

// Check: λx.λy.x : a → b → a
const const_ = { 
  type: 'fn', param: 'x', 
  body: { type: 'fn', param: 'y', body: { type: 'var', name: 'x' } } 
};
console.log('λx.λy.x :', ts.print(ts.infer(const_)));

export default TypeSystem;
