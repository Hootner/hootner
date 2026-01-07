// Interpreter - Layer 2.6
// Uses: AST (2.3), Parser (2.2)

class Interpreter {
  constructor() {
    this.env = new Map();
  }

  eval(node, env = this.env) {
    switch(node.type) {
      case 'Program':
        let result;
        node.body.forEach(stmt => result = this.eval(stmt, env));
        return result;
      
      case 'LetStatement':
        const value = this.eval(node.value, env);
        env.set(node.name, value);
        return value;
      
      case 'IfStatement':
        const cond = this.eval(node.condition, env);
        if (cond) {
          return this.eval(node.then, env);
        } else if (node.else) {
          return this.eval(node.else, env);
        }
        return null;
      
      case 'WhileStatement':
        while (this.eval(node.condition, env)) {
          this.eval(node.body, env);
        }
        return null;
      
      case 'ReturnStatement':
        return this.eval(node.value, env);
      
      case 'Block':
        let blockResult;
        node.statements.forEach(stmt => blockResult = this.eval(stmt, env));
        return blockResult;
      
      case 'ExpressionStatement':
        return this.eval(node.expression, env);
      
      case 'Number':
        return node.value;
      
      case 'Boolean':
        return node.value;
      
      case 'String':
        return node.value;
      
      case 'Identifier':
        if (!env.has(node.name)) {
          throw new Error(`Undefined variable: ${node.name}`);
        }
        return env.get(node.name);
      
      case 'BinaryOp':
        const left = this.eval(node.left, env);
        const right = this.eval(node.right, env);
        
        switch(node.op) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': return left / right;
          case '<': return left < right;
          case '>': return left > right;
          case '==': return left === right;
          case '!=': return left !== right;
          default: throw new Error(`Unknown operator: ${node.op}`);
        }
      
      case 'UnaryOp':
        const operand = this.eval(node.operand, env);
        switch(node.op) {
          case '-': return -operand;
          case '!': return !operand;
          default: throw new Error(`Unknown unary operator: ${node.op}`);
        }
      
      case 'Call':
        const fn = this.eval(node.callee, env);
        const args = node.args.map(arg => this.eval(arg, env));
        return fn(...args);
      
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  run(code) {
    // Assuming we have lexer and parser
    return this.eval(code);
  }
}

// Demo
const interp = new Interpreter();

// Eval: 5 + 3 * 2
const expr1 = {
  type: 'BinaryOp',
  op: '+',
  left: { type: 'Number', value: 5 },
  right: {
    type: 'BinaryOp',
    op: '*',
    left: { type: 'Number', value: 3 },
    right: { type: 'Number', value: 2 }
  }
};

console.log('5 + 3 * 2 =', interp.eval(expr1));

// Eval: let x = 10; x * 2
const prog = {
  type: 'Program',
  body: [
    {
      type: 'LetStatement',
      name: 'x',
      value: { type: 'Number', value: 10 }
    },
    {
      type: 'BinaryOp',
      op: '*',
      left: { type: 'Identifier', name: 'x' },
      right: { type: 'Number', value: 2 }
    }
  ]
};

console.log('let x = 10; x * 2 =', interp.eval(prog));

export default Interpreter;
