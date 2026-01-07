// Optimizer - Layer 2.7
// Uses: AST (2.3)

class Optimizer {
  optimize(ast) {
    ast = this.constantFolding(ast);
    ast = this.deadCodeElimination(ast);
    ast = this.strengthReduction(ast);
    return ast;
  }

  // Constant folding: 2 + 3 → 5
  constantFolding(node) {
    if (node.type === 'BinaryOp' && 
        node.left.type === 'Number' && 
        node.right.type === 'Number') {
      
      const ops = {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => a / b
      };
      
      if (ops[node.op]) {
        return {
          type: 'Number',
          value: ops[node.op](node.left.value, node.right.value)
        };
      }
    }

    // Recurse
    if (node.left) node.left = this.constantFolding(node.left);
    if (node.right) node.right = this.constantFolding(node.right);
    if (node.body && !Array.isArray(node.body)) {
      node.body = this.constantFolding(node.body);
    }
    if (node.body && Array.isArray(node.body)) {
      node.body = node.body.map(n => this.constantFolding(n));
    }

    return node;
  }

  // Dead code elimination: if (false) { ... }
  deadCodeElimination(node) {
    if (node.type === 'IfStatement' && node.condition.type === 'Boolean') {
      return node.condition.value ? 
        this.deadCodeElimination(node.then) : 
        (node.else ? this.deadCodeElimination(node.else) : null);
    }

    if (node.type === 'Block') {
      node.statements = node.statements.filter(s => s !== null);
      node.statements = node.statements.map(s => this.deadCodeElimination(s));
    }

    if (node.body && !Array.isArray(node.body)) {
      node.body = this.deadCodeElimination(node.body);
    }
    if (node.body && Array.isArray(node.body)) {
      node.body = node.body.map(n => this.deadCodeElimination(n)).filter(n => n !== null);
    }

    return node;
  }

  // Strength reduction: x * 2 → x << 1
  strengthReduction(node) {
    if (node.type === 'BinaryOp' && node.op === '*') {
      // x * 2 → x + x
      if (node.right.type === 'Number' && node.right.value === 2) {
        return {
          type: 'BinaryOp',
          op: '+',
          left: node.left,
          right: node.left
        };
      }
      
      // x * 0 → 0
      if (node.right.type === 'Number' && node.right.value === 0) {
        return { type: 'Number', value: 0 };
      }
      
      // x * 1 → x
      if (node.right.type === 'Number' && node.right.value === 1) {
        return node.left;
      }
    }

    // x + 0 → x
    if (node.type === 'BinaryOp' && node.op === '+') {
      if (node.right.type === 'Number' && node.right.value === 0) {
        return node.left;
      }
    }

    // Recurse
    if (node.left) node.left = this.strengthReduction(node.left);
    if (node.right) node.right = this.strengthReduction(node.right);

    return node;
  }

  // Count optimizations
  countOpts(before, after) {
    const beforeSize = JSON.stringify(before).length;
    const afterSize = JSON.stringify(after).length;
    return {
      before: beforeSize,
      after: afterSize,
      saved: beforeSize - afterSize,
      percent: ((1 - afterSize / beforeSize) * 100).toFixed(1)
    };
  }
}

// Demo
const opt = new Optimizer();

// Constant folding
const ast1 = {
  type: 'BinaryOp',
  op: '+',
  left: { type: 'Number', value: 2 },
  right: { type: 'Number', value: 3 }
};

console.log('Before:', JSON.stringify(ast1));
console.log('After:', JSON.stringify(opt.constantFolding(ast1)));

// Dead code
const ast2 = {
  type: 'IfStatement',
  condition: { type: 'Boolean', value: false },
  then: { type: 'Block', statements: [{ type: 'Number', value: 1 }] },
  else: { type: 'Block', statements: [{ type: 'Number', value: 2 }] }
};

console.log('\nDead code elimination:');
console.log('After:', JSON.stringify(opt.deadCodeElimination(ast2)));

// Strength reduction
const ast3 = {
  type: 'BinaryOp',
  op: '*',
  left: { type: 'Identifier', name: 'x' },
  right: { type: 'Number', value: 2 }
};

console.log('\nStrength reduction (x * 2):');
console.log('After:', JSON.stringify(opt.strengthReduction(ast3)));

export default Optimizer;
