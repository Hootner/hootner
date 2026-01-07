// Parser - Layer 2.2
// Uses: Lexer (2.1), FSM (0.4)

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek() { return this.tokens[this.pos]; }
  advance() { return this.tokens[this.pos++]; }
  expect(type, value) {
    const token = this.advance();
    if (token.type !== type || (value && token.value !== value)) {
      throw new Error(`Expected ${type} ${value || ''}, got ${token.type} ${token.value || ''}`);
    }
    return token;
  }

  // Parse program
  program() {
    const statements = [];
    while (this.peek().type !== 'EOF') {
      statements.push(this.statement());
    }
    return { type: 'Program', body: statements };
  }

  // Parse statement
  statement() {
    const token = this.peek();
    
    if (token.type === 'KEYWORD') {
      if (token.value === 'let') return this.letStatement();
      if (token.value === 'if') return this.ifStatement();
      if (token.value === 'while') return this.whileStatement();
      if (token.value === 'return') return this.returnStatement();
    }
    
    return this.expressionStatement();
  }

  letStatement() {
    this.advance(); // 'let'
    const name = this.expect('IDENTIFIER').value;
    this.expect('OPERATOR', '=');
    const value = this.expression();
    this.expect('PUNCTUATION', ';');
    return { type: 'LetStatement', name, value };
  }

  ifStatement() {
    this.advance(); // 'if'
    this.expect('PUNCTUATION', '(');
    const condition = this.expression();
    this.expect('PUNCTUATION', ')');
    const then = this.block();
    let else_ = null;
    if (this.peek().value === 'else') {
      this.advance();
      else_ = this.block();
    }
    return { type: 'IfStatement', condition, then, else: else_ };
  }

  whileStatement() {
    this.advance(); // 'while'
    this.expect('PUNCTUATION', '(');
    const condition = this.expression();
    this.expect('PUNCTUATION', ')');
    const body = this.block();
    return { type: 'WhileStatement', condition, body };
  }

  returnStatement() {
    this.advance(); // 'return'
    const value = this.expression();
    this.expect('PUNCTUATION', ';');
    return { type: 'ReturnStatement', value };
  }

  expressionStatement() {
    const expr = this.expression();
    this.expect('PUNCTUATION', ';');
    return { type: 'ExpressionStatement', expression: expr };
  }

  block() {
    this.expect('PUNCTUATION', '{');
    const statements = [];
    while (this.peek().value !== '}') {
      statements.push(this.statement());
    }
    this.expect('PUNCTUATION', '}');
    return { type: 'Block', statements };
  }

  // Parse expression
  expression() {
    return this.comparison();
  }

  comparison() {
    let left = this.term();
    while (this.peek().type === 'OPERATOR' && ['<', '>', '==', '!='].includes(this.peek().value)) {
      const op = this.advance().value;
      const right = this.term();
      left = { type: 'BinaryOp', op, left, right };
    }
    return left;
  }

  term() {
    let left = this.factor();
    while (this.peek().type === 'OPERATOR' && ['+', '-'].includes(this.peek().value)) {
      const op = this.advance().value;
      const right = this.factor();
      left = { type: 'BinaryOp', op, left, right };
    }
    return left;
  }

  factor() {
    let left = this.primary();
    while (this.peek().type === 'OPERATOR' && ['*', '/'].includes(this.peek().value)) {
      const op = this.advance().value;
      const right = this.primary();
      left = { type: 'BinaryOp', op, left, right };
    }
    return left;
  }

  primary() {
    const token = this.peek();
    
    if (token.type === 'NUMBER') {
      this.advance();
      return { type: 'Number', value: token.value };
    }
    
    if (token.type === 'IDENTIFIER') {
      this.advance();
      return { type: 'Identifier', name: token.value };
    }
    
    if (token.value === '(') {
      this.advance();
      const expr = this.expression();
      this.expect('PUNCTUATION', ')');
      return expr;
    }
    
    throw new Error(`Unexpected token: ${token.type}`);
  }
}

// Demo
import Lexer from './lexer.js';

const code = 'let x = 10; if (x > 5) { return x * 2; }';
const lexer = new Lexer(code);
const tokens = lexer.tokenize();
const parser = new Parser(tokens);
const ast = parser.program();

console.log('AST:', JSON.stringify(ast, null, 2));

export default Parser;
