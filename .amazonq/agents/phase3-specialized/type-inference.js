// Minimal Type Inference - Hindley-Milner, Unification
class Type {
  constructor(name) {
    this.name = name;
  }

  toString() {
    return this.name;
  }
}

class TypeVar {
  constructor(name) {
    this.name = name;
  }

  toString() {
    return this.name;
  }
}

class FunctionType {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  toString() {
    return `(${this.from} -> ${this.to})`;
  }
}

class TypeInference {
  constructor() {
    this.nextVar = 0;
    this.substitutions = new Map();
  }

  freshVar() {
    return new TypeVar(`t${this.nextVar++}`);
  }

  unify(t1, t2) {
    t1 = this.resolve(t1);
    t2 = this.resolve(t2);

    if (t1 instanceof TypeVar) {
      this.substitutions.set(t1.name, t2);
      return t2;
    }

    if (t2 instanceof TypeVar) {
      this.substitutions.set(t2.name, t1);
      return t1;
    }

    if (t1 instanceof Type && t2 instanceof Type) {
      if (t1.name === t2.name) return t1;
      throw new Error(`Cannot unify ${t1} with ${t2}`);
    }

    if (t1 instanceof FunctionType && t2 instanceof FunctionType) {
      this.unify(t1.from, t2.from);
      this.unify(t1.to, t2.to);
      return t1;
    }

    throw new Error(`Cannot unify ${t1} with ${t2}`);
  }

  resolve(type) {
    if (type instanceof TypeVar && this.substitutions.has(type.name)) {
      return this.resolve(this.substitutions.get(type.name));
    }
    return type;
  }

  infer(expr, env = new Map()) {
    if (typeof expr === 'number') {
      return new Type('Int');
    }

    if (typeof expr === 'string') {
      if (env.has(expr)) {
        return env.get(expr);
      }
      throw new Error(`Undefined variable: ${expr}`);
    }

    if (expr.type === 'lambda') {
      const argType = this.freshVar();
      const newEnv = new Map(env);
      newEnv.set(expr.arg, argType);
      const bodyType = this.infer(expr.body, newEnv);
      return new FunctionType(argType, bodyType);
    }

    if (expr.type === 'apply') {
      const fnType = this.infer(expr.fn, env);
      const argType = this.infer(expr.arg, env);
      const resultType = this.freshVar();
      this.unify(fnType, new FunctionType(argType, resultType));
      return this.resolve(resultType);
    }

    throw new Error(`Unknown expression type: ${expr.type}`);
  }
}

// Demo
console.log('=== Type Inference Demo ===\n');

const ti = new TypeInference();

// Identity function: λx.x
console.log('--- λx.x (identity) ---');
const identity = {
  type: 'lambda',
  arg: 'x',
  body: 'x'
};
const idType = ti.infer(identity);
console.log('Type:', idType.toString());

// Constant function: λx.λy.x
console.log('\n--- λx.λy.x (const) ---');
const constFn = {
  type: 'lambda',
  arg: 'x',
  body: {
    type: 'lambda',
    arg: 'y',
    body: 'x'
  }
};
const constType = ti.infer(constFn);
console.log('Type:', constType.toString());

// Application: (λx.x) 42
console.log('\n--- (λx.x) 42 ---');
const app = {
  type: 'apply',
  fn: identity,
  arg: 42
};
const appType = ti.infer(app);
console.log('Type:', appType.toString());

export default TypeInference;
