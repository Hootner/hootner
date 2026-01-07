// AST Builder - Layer 2.3
// Constructs and manipulates Abstract Syntax Trees

class ASTNode {
  constructor(type, props = {}) {
    this.type = type;
    Object.assign(this, props);
  }
}

class ASTBuilder {
  // Literals
  number(value) {
    return new ASTNode('Number', { value });
  }

  string(value) {
    return new ASTNode('String', { value });
  }

  boolean(value) {
    return new ASTNode('Boolean', { value });
  }

  identifier(name) {
    return new ASTNode('Identifier', { name });
  }

  // Expressions
  binaryOp(op, left, right) {
    return new ASTNode('BinaryOp', { op, left, right });
  }

  unaryOp(op, operand) {
    return new ASTNode('UnaryOp', { op, operand });
  }

  call(callee, args) {
    return new ASTNode('Call', { callee, args });
  }

  // Statements
  letStatement(name, value) {
    return new ASTNode('LetStatement', { name, value });
  }

  ifStatement(condition, then, else_) {
    return new ASTNode('IfStatement', { condition, then, else: else_ });
  }

  whileStatement(condition, body) {
    return new ASTNode('WhileStatement', { condition, body });
  }

  returnStatement(value) {
    return new ASTNode('ReturnStatement', { value });
  }

  block(statements) {
    return new ASTNode('Block', { statements });
  }

  // Functions
  function(name, params, body) {
    return new ASTNode('Function', { name, params, body });
  }

  // Program
  program(body) {
    return new ASTNode('Program', { body });
  }

  // Traversal
  traverse(node, visitor) {
    if (visitor.enter) visitor.enter(node);

    // Visit children
    if (node.left) this.traverse(node.left, visitor);
    if (node.right) this.traverse(node.right, visitor);
    if (node.body) {
      if (Array.isArray(node.body)) {
        node.body.forEach(n => this.traverse(n, visitor));
      } else {
        this.traverse(node.body, visitor);
      }
    }
    if (node.statements) {
      node.statements.forEach(n => this.traverse(n, visitor));
    }

    if (visitor.exit) visitor.exit(node);
  }

  // Transform
  transform(node, transformer) {
    const newNode = transformer(node);
    if (newNode !== node) return newNode;

    if (node.left) node.left = this.transform(node.left, transformer);
    if (node.right) node.right = this.transform(node.right, transformer);
    if (node.body && !Array.isArray(node.body)) {
      node.body = this.transform(node.body, transformer);
    }

    return node;
  }

  // Pretty print
  print(node, indent = 0) {
    const spaces = '  '.repeat(indent);
    console.log(`${spaces}${node.type}`);
    
    if (node.value !== undefined) console.log(`${spaces}  value: ${node.value}`);
    if (node.name) console.log(`${spaces}  name: ${node.name}`);
    if (node.op) console.log(`${spaces}  op: ${node.op}`);
    
    if (node.left) { console.log(`${spaces}  left:`); this.print(node.left, indent + 2); }
    if (node.right) { console.log(`${spaces}  right:`); this.print(node.right, indent + 2); }
    if (node.body && !Array.isArray(node.body)) {
      console.log(`${spaces}  body:`);
      this.print(node.body, indent + 2);
    }
    if (node.statements) {
      node.statements.forEach(s => this.print(s, indent + 1));
    }
  }
}

// Demo
const builder = new ASTBuilder();

// Build: let x = 5 + 3;
const ast = builder.program([
  builder.letStatement('x', 
    builder.binaryOp('+', builder.number(5), builder.number(3))
  )
]);

console.log('Built AST:');
builder.print(ast);

// Traverse
console.log('\nTraversal:');
builder.traverse(ast, {
  enter: (node) => console.log('Enter:', node.type),
  exit: (node) => console.log('Exit:', node.type)
});

export default ASTBuilder;
