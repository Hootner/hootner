// Minimal AST Interpreter - Parse, Evaluate, Environment
class ASTNode {
  constructor(type, value, children = []) {
    this.type = type;
    this.value = value;
    this.children = children;
  }
}

class Interpreter {
  constructor() {
    this.env = new Map();
  }

  eval(node) {
    switch (node.type) {
      case 'number':
        return node.value;

      case 'string':
        return node.value;

      case 'identifier':
        if (!this.env.has(node.value)) {
          throw new Error(`Undefined variable: ${node.value}`);
        }
        return this.env.get(node.value);

      case 'binary':
        const left = this.eval(node.children[0]);
        const right = this.eval(node.children[1]);
        switch (node.value) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': return left / right;
          case '==': return left === right;
          case '<': return left < right;
          case '>': return left > right;
        }
        break;

      case 'assign':
        const value = this.eval(node.children[0]);
        this.env.set(node.value, value);
        return value;

      case 'if':
        const condition = this.eval(node.children[0]);
        return condition 
          ? this.eval(node.children[1])
          : node.children[2] ? this.eval(node.children[2]) : null;

      case 'while':
        let result = null;
        while (this.eval(node.children[0])) {
          result = this.eval(node.children[1]);
        }
        return result;

      case 'block':
        let lastResult = null;
        for (const child of node.children) {
          lastResult = this.eval(child);
        }
        return lastResult;

      case 'print':
        const output = this.eval(node.children[0]);
        console.log(output);
        return output;

      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }
}

// Demo: Simple programs
console.log('=== AST Interpreter Demo ===\n');

const interp = new Interpreter();

// Program 1: x = 10; y = x * 2; print(y)
console.log('--- Program 1 ---');
const prog1 = new ASTNode('block', null, [
  new ASTNode('assign', 'x', [new ASTNode('number', 10)]),
  new ASTNode('assign', 'y', [
    new ASTNode('binary', '*', [
      new ASTNode('identifier', 'x'),
      new ASTNode('number', 2)
    ])
  ]),
  new ASTNode('print', null, [new ASTNode('identifier', 'y')])
]);

interp.eval(prog1);

// Program 2: Factorial
console.log('\n--- Program 2: Factorial ---');
const prog2 = new ASTNode('block', null, [
  new ASTNode('assign', 'n', [new ASTNode('number', 5)]),
  new ASTNode('assign', 'result', [new ASTNode('number', 1)]),
  new ASTNode('while', null, [
    new ASTNode('binary', '>', [
      new ASTNode('identifier', 'n'),
      new ASTNode('number', 0)
    ]),
    new ASTNode('block', null, [
      new ASTNode('assign', 'result', [
        new ASTNode('binary', '*', [
          new ASTNode('identifier', 'result'),
          new ASTNode('identifier', 'n')
        ])
      ]),
      new ASTNode('assign', 'n', [
        new ASTNode('binary', '-', [
          new ASTNode('identifier', 'n'),
          new ASTNode('number', 1)
        ])
      ])
    ])
  ]),
  new ASTNode('print', null, [new ASTNode('identifier', 'result')])
]);

interp.eval(prog2);

export default Interpreter;
