// Lexer (Tokenizer) - Layer 2.1
// Uses: FSM (Layer 0.4)

class Lexer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.tokens = [];
  }

  // Token types
  isWhitespace(ch) { return /\s/.test(ch); }
  isDigit(ch) { return /[0-9]/.test(ch); }
  isLetter(ch) { return /[a-zA-Z_]/.test(ch); }
  isAlphaNum(ch) { return this.isLetter(ch) || this.isDigit(ch); }

  peek() { return this.input[this.pos]; }
  advance() { return this.input[this.pos++]; }
  
  // Skip whitespace
  skipWhitespace() {
    while (this.isWhitespace(this.peek())) this.advance();
  }

  // Tokenize number
  number() {
    let num = '';
    while (this.isDigit(this.peek())) num += this.advance();
    if (this.peek() === '.') {
      num += this.advance();
      while (this.isDigit(this.peek())) num += this.advance();
    }
    return { type: 'NUMBER', value: parseFloat(num) };
  }

  // Tokenize identifier or keyword
  identifier() {
    let id = '';
    while (this.isAlphaNum(this.peek())) id += this.advance();
    
    const keywords = ['if', 'else', 'while', 'return', 'let', 'fn'];
    const type = keywords.includes(id) ? 'KEYWORD' : 'IDENTIFIER';
    return { type, value: id };
  }

  // Tokenize operator
  operator() {
    const ch = this.advance();
    const next = this.peek();
    
    // Two-char operators
    if ((ch === '=' || ch === '!' || ch === '<' || ch === '>') && next === '=') {
      this.advance();
      return { type: 'OPERATOR', value: ch + next };
    }
    
    return { type: 'OPERATOR', value: ch };
  }

  // Main tokenization
  tokenize() {
    while (this.pos < this.input.length) {
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      const ch = this.peek();
      
      if (this.isDigit(ch)) {
        this.tokens.push(this.number());
      } else if (this.isLetter(ch)) {
        this.tokens.push(this.identifier());
      } else if ('+-*/%=!<>'.includes(ch)) {
        this.tokens.push(this.operator());
      } else if ('(){}[];,'.includes(ch)) {
        this.tokens.push({ type: 'PUNCTUATION', value: this.advance() });
      } else {
        throw new Error(`Unexpected character: ${ch}`);
      }
    }
    
    this.tokens.push({ type: 'EOF' });
    return this.tokens;
  }
}

// Demo
const code = `
  let x = 10;
  if (x > 5) {
    return x * 2;
  }
`;

const lexer = new Lexer(code);
const tokens = lexer.tokenize();
console.log('Tokens:');
tokens.forEach(t => console.log(`  ${t.type}: ${t.value || ''}`));

export default Lexer;
