// Code Generator - Layer 2.5
// Uses: AST (2.3), Assembler (Layer 1.2)

class CodeGenerator {
  constructor() {
    this.code = [];
    this.labelCount = 0;
    this.regCount = 0;
  }

  newLabel() { return `L${this.labelCount++}`; }
  newReg() { return `R${this.regCount++}`; }

  emit(instr) {
    this.code.push(instr);
  }

  // Generate code from AST
  generate(node) {
    switch(node.type) {
      case 'Program':
        node.body.forEach(stmt => this.generate(stmt));
        this.emit('HALT');
        break;
      
      case 'LetStatement':
        const reg = this.generate(node.value);
        this.emit(`STORE ${node.name}, ${reg}`);
        break;
      
      case 'IfStatement':
        const condReg = this.generate(node.condition);
        const elseLabel = this.newLabel();
        const endLabel = this.newLabel();
        
        this.emit(`JZ ${condReg}, ${elseLabel}`);
        this.generate(node.then);
        this.emit(`JMP ${endLabel}`);
        this.emit(`${elseLabel}:`);
        if (node.else) this.generate(node.else);
        this.emit(`${endLabel}:`);
        break;
      
      case 'WhileStatement':
        const startLabel = this.newLabel();
        const exitLabel = this.newLabel();
        
        this.emit(`${startLabel}:`);
        const whileCondReg = this.generate(node.condition);
        this.emit(`JZ ${whileCondReg}, ${exitLabel}`);
        this.generate(node.body);
        this.emit(`JMP ${startLabel}`);
        this.emit(`${exitLabel}:`);
        break;
      
      case 'ReturnStatement':
        const retReg = this.generate(node.value);
        this.emit(`RETURN ${retReg}`);
        break;
      
      case 'Block':
        node.statements.forEach(stmt => this.generate(stmt));
        break;
      
      case 'Number':
        const numReg = this.newReg();
        this.emit(`LOAD ${numReg}, ${node.value}`);
        return numReg;
      
      case 'Identifier':
        const idReg = this.newReg();
        this.emit(`LOAD ${idReg}, ${node.name}`);
        return idReg;
      
      case 'BinaryOp':
        const leftReg = this.generate(node.left);
        const rightReg = this.generate(node.right);
        const resultReg = this.newReg();
        
        const opMap = {
          '+': 'ADD', '-': 'SUB', '*': 'MUL', '/': 'DIV',
          '<': 'LT', '>': 'GT', '==': 'EQ', '!=': 'NE'
        };
        
        this.emit(`${opMap[node.op]} ${resultReg}, ${leftReg}, ${rightReg}`);
        return resultReg;
      
      default:
        return this.newReg();
    }
  }

  getCode() {
    return this.code.join('\n');
  }

  // Optimize: remove dead code
  optimize() {
    const optimized = [];
    const labels = new Set();
    
    // Collect labels
    this.code.forEach(line => {
      if (line.includes(':')) labels.add(line.split(':')[0]);
    });
    
    // Remove unreachable code
    let reachable = true;
    this.code.forEach(line => {
      if (line.includes(':')) reachable = true;
      if (reachable) optimized.push(line);
      if (line.startsWith('JMP') || line.startsWith('RETURN')) reachable = false;
    });
    
    this.code = optimized;
  }
}

// Demo
const gen = new CodeGenerator();

const ast = {
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
  }, {
    type: 'ReturnStatement',
    value: { type: 'Identifier', name: 'x' }
  }]
};

gen.generate(ast);
console.log('Generated code:');
console.log(gen.getCode());

console.log('\nOptimized:');
gen.optimize();
console.log(gen.getCode());

export default CodeGenerator;
