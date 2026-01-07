// Type Checker - Layer 2.4
// Uses: Type System (Layer 0.7), AST (2.3)

class TypeChecker {
  constructor() {
    this.env = new Map();
    this.errors = [];
  }

  // Type definitions
  intType() { return { kind: 'int' }; }
  boolType() { return { kind: 'bool' }; }
  stringType() { return { kind: 'string' }; }
  fnType(params, ret) { return { kind: 'fn', params, ret }; }
  voidType() { return { kind: 'void' }; }

  // Check program
  check(ast) {
    this.errors = [];
    this.checkNode(ast);
    return this.errors;
  }

  checkNode(node, env = this.env) {
    switch(node.type) {
      case 'Program':
        node.body.forEach(stmt => this.checkNode(stmt, env));
        break;
      
      case 'LetStatement':
        const valueType = this.inferType(node.value, env);
        env.set(node.name, valueType);
        break;
      
      case 'IfStatement':
        const condType = this.inferType(node.condition, env);
        if (condType.kind !== 'bool') {
          this.errors.push(`If condition must be bool, got ${condType.kind}`);
        }
        this.checkNode(node.then, env);
        if (node.else) this.checkNode(node.else, env);
        break;
      
      case 'WhileStatement':
        const whileCondType = this.inferType(node.condition, env);
        if (whileCondType.kind !== 'bool') {
          this.errors.push(`While condition must be bool, got ${whileCondType.kind}`);
        }
        this.checkNode(node.body, env);
        break;
      
      case 'ReturnStatement':
        this.inferType(node.value, env);
        break;
      
      case 'Block':
        node.statements.forEach(stmt => this.checkNode(stmt, env));
        break;
    }
  }

  inferType(node, env = this.env) {
    switch(node.type) {
      case 'Number':
        return this.intType();
      
      case 'Boolean':
        return this.boolType();
      
      case 'String':
        return this.stringType();
      
      case 'Identifier':
        if (!env.has(node.name)) {
          this.errors.push(`Undefined variable: ${node.name}`);
          return this.intType();
        }
        return env.get(node.name);
      
      case 'BinaryOp':
        const leftType = this.inferType(node.left, env);
        const rightType = this.inferType(node.right, env);
        
        if (['+', '-', '*', '/'].includes(node.op)) {
          if (leftType.kind !== 'int' || rightType.kind !== 'int') {
            this.errors.push(`Arithmetic requires int, got ${leftType.kind} and ${rightType.kind}`);
          }
          return this.intType();
        }
        
        if (['<', '>', '==', '!='].includes(node.op)) {
          if (leftType.kind !== rightType.kind) {
            this.errors.push(`Comparison requires same types, got ${leftType.kind} and ${rightType.kind}`);
          }
          return this.boolType();
        }
        
        return this.intType();
      
      case 'Call':
        const fnType = this.inferType(node.callee, env);
        if (fnType.kind !== 'fn') {
          this.errors.push(`Cannot call non-function`);
          return this.voidType();
        }
        
        if (node.args.length !== fnType.params.length) {
          this.errors.push(`Expected ${fnType.params.length} args, got ${node.args.length}`);
        }
        
        return fnType.ret;
      
      default:
        return this.intType();
    }
  }

  printErrors() {
    if (this.errors.length === 0) {
      console.log('✓ No type errors');
    } else {
      console.log('Type errors:');
      this.errors.forEach(e => console.log(`  ✗ ${e}`));
    }
  }
}

// Demo
const checker = new TypeChecker();

// Valid: let x = 5 + 3;
const validAST = {
  type: 'Program',
  body: [{
    type: 'LetStatement',
    name: 'x',
    value: {
      type: 'BinaryOp',
      op: '+',
      left: { type: 'Number', value: 5 },
      right: { type: 'Number', value: 3 }
    }
  }]
};

console.log('Checking valid program:');
checker.check(validAST);
checker.printErrors();

// Invalid: if (5) { ... }
const invalidAST = {
  type: 'Program',
  body: [{
    type: 'IfStatement',
    condition: { type: 'Number', value: 5 },
    then: { type: 'Block', statements: [] }
  }]
};

console.log('\nChecking invalid program:');
checker.check(invalidAST);
checker.printErrors();

export default TypeChecker;
