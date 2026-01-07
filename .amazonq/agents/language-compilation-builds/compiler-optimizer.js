// Minimal Compiler Optimizer
class Optimizer {
  optimize(ast) {
    return this.visit(ast);
  }

  visit(node) {
    if (!node) return node;
    
    // Constant folding
    if (node.type === 'BinaryOp' && 
        node.left.type === 'Number' && 
        node.right.type === 'Number') {
      const ops = { '+': (a, b) => a + b, '-': (a, b) => a - b };
      return { type: 'Number', value: ops[node.op](node.left.value, node.right.value) };
    }

    // Dead code elimination
    if (node.type === 'If' && node.condition.type === 'Boolean') {
      return node.condition.value ? this.visit(node.then) : this.visit(node.else);
    }

    if (node.left) node.left = this.visit(node.left);
    if (node.right) node.right = this.visit(node.right);
    
    return node;
  }
}

const opt = new Optimizer();
const ast = { type: 'BinaryOp', op: '+', left: { type: 'Number', value: 2 }, right: { type: 'Number', value: 3 } };
console.log(opt.optimize(ast));

export default Optimizer;
