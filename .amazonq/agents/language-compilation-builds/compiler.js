function tokenizer(input) {
  let current = 0, tokens = [];
  while (current < input.length) {
    let char = input[current];
    if (char === '(') { tokens.push({ type: 'paren', value: '(' }); current++; continue; }
    if (char === ')') { tokens.push({ type: 'paren', value: ')' }); current++; continue; }
    if (/[a-z]/i.test(char)) {
      let value = '';
      while (/[a-z]/i.test(char)) { value += char; char = input[++current]; }
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

function codeGenerator(node) {
  switch (node.type) {
    case 'Program': return node.body.map(codeGenerator).join('\n');
    case 'CallExpression': return node.name + '(' + node.params.map(codeGenerator).join(', ') + ')';
    case 'NumberLiteral': return node.value;
  }
}

function compiler(input) {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  return codeGenerator(ast);
}

console.log(compiler('(add 2 (subtract 4 2))')); // add(2, subtract(4, 2))
