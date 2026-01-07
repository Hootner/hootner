// Complete Compiler - Layer 2.8
// Integrates: Lexer → Parser → Type Checker → Optimizer → Code Generator

import Lexer from './lexer.js';
import Parser from './parser.js';
import TypeChecker from './type-checker.js';
import Optimizer from './optimizer.js';
import CodeGenerator from './code-generator.js';

class Compiler {
  constructor(options = {}) {
    this.options = {
      optimize: true,
      typeCheck: true,
      ...options
    };
  }

  compile(source) {
    const result = {
      success: false,
      errors: [],
      warnings: [],
      code: null,
      ast: null
    };

    try {
      // 1. Lexical Analysis
      console.log('1. Lexing...');
      const lexer = new Lexer(source);
      const tokens = lexer.tokenize();
      console.log(`   ${tokens.length} tokens`);

      // 2. Syntax Analysis
      console.log('2. Parsing...');
      const parser = new Parser(tokens);
      const ast = parser.program();
      result.ast = ast;
      console.log('   AST built');

      // 3. Semantic Analysis
      if (this.options.typeCheck) {
        console.log('3. Type checking...');
        const checker = new TypeChecker();
        const errors = checker.check(ast);
        if (errors.length > 0) {
          result.errors = errors;
          return result;
        }
        console.log('   ✓ No type errors');
      }

      // 4. Optimization
      if (this.options.optimize) {
        console.log('4. Optimizing...');
        const optimizer = new Optimizer();
        const optimized = optimizer.optimize(ast);
        result.ast = optimized;
        console.log('   ✓ Optimized');
      }

      // 5. Code Generation
      console.log('5. Generating code...');
      const generator = new CodeGenerator();
      generator.generate(result.ast);
      result.code = generator.getCode();
      console.log(`   ${generator.code.length} instructions`);

      result.success = true;
    } catch (error) {
      result.errors.push(error.message);
    }

    return result;
  }

  // Compile to different targets
  compileToAssembly(source) {
    const result = this.compile(source);
    return result.code;
  }

  compileToJS(source) {
    // Transpile to JavaScript
    const result = this.compile(source);
    if (!result.success) return null;
    
    // Simple JS generation
    return this.astToJS(result.ast);
  }

  astToJS(node) {
    switch(node.type) {
      case 'Program':
        return node.body.map(s => this.astToJS(s)).join('\n');
      case 'LetStatement':
        return `let ${node.name} = ${this.astToJS(node.value)};`;
      case 'Number':
        return node.value;
      case 'Identifier':
        return node.name;
      case 'BinaryOp':
        return `(${this.astToJS(node.left)} ${node.op} ${this.astToJS(node.right)})`;
      default:
        return '';
    }
  }
}

// Demo
const compiler = new Compiler();

const program = `
  let x = 10;
  let y = 20;
  let z = x + y;
`;

console.log('Compiling program:\n', program);
console.log('\n--- Compilation ---\n');

const result = compiler.compile(program);

if (result.success) {
  console.log('\n✓ Compilation successful!\n');
  console.log('Generated code:');
  console.log(result.code);
  
  console.log('\nTranspiled to JS:');
  console.log(compiler.compileToJS(program));
} else {
  console.log('\n✗ Compilation failed:');
  result.errors.forEach(e => console.log(`  ${e}`));
}

export default Compiler;
