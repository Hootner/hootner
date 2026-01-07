function tokenizer(input) {
  let current = 0, tokens = [];
  while (current < input.length) {
    let char = input[current];
    if (char === '(') { tokens.push({ type: 'paren', value: '(' }); current++; continue; }
    if (char === ')') { tokens.push({ type: 'paren', value: ')' }); current++; continue; }
    if (/[a-z]/i.test(char)) {
      let value = '';
      while (/[a-z0-9_]/i.test(char)) { value += char; char = input[++current]; }
      tokens.push({ type: 'name', value });
      continue;
    }
    if (/\d/.test(char)) {
      let value = '';
      while (/\d/.test(char)) { value += char; char = input[++current]; }
      tokens.push({ type: 'number', value });
      continue;
    }
    current++;
  }
  return tokens;
}

function parser(tokens) {
  let current = 0;
  function walk() {
    let token = tokens[current];
    if (token.type === 'number') { current++; return { type: 'NumberLiteral', value: token.value }; }
    if (token.type === 'paren' && token.value === '(') {
      token = tokens[++current];
      let node = { type: 'CallExpression', name: token.value, params: [] };
      token = tokens[++current];
      while (token.type !== 'paren' || token.value !== ')') {
        node.params.push(walk());
        token = tokens[current];
      }
      current++;
      return node;
    }
  }
  let ast = { type: 'Program', body: [] };
  while (current < tokens.length) ast.body.push(walk());
  return ast;
}

function llvmGenerator(node, ctx = { regCount: 0 }) {
  switch (node.type) {
    case 'Program':
      let ir = 'define i32 @main() {\n';
      node.body.forEach(n => { ir += llvmGenerator(n, ctx) + '\n'; });
      ir += `  ret i32 %${ctx.regCount - 1}\n}\n`;
      return ir;
    
    case 'CallExpression':
      const ops = { add: 'add', sub: 'sub', mul: 'mul', div: 'sdiv' };
      if (ops[node.name]) {
        const leftIR = llvmGenerator(node.params[0], ctx);
        const leftReg = ctx.regCount - 1;
        const rightIR = llvmGenerator(node.params[1], ctx);
        const rightReg = ctx.regCount - 1;
        const resultReg = ctx.regCount++;
        return leftIR + '\n' + rightIR + '\n' + `  %${resultReg} = ${ops[node.name]} i32 %${leftReg}, %${rightReg}`;
      }
      break;
    
    case 'NumberLiteral':
      const reg = ctx.regCount++;
      return `  %${reg} = add i32 0, ${node.value}`;
  }
}

function compiler(input) {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  return llvmGenerator(ast);
}

// Tests
console.log(compiler('(add 2 3)'));
console.log('\n---\n');
console.log(compiler('(mul (add 2 3) 4)'));
