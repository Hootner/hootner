function tokenizer(input) {
  let current = 0, tokens = [];
  while (current < input.length) {
    let char = input[current];
    if (char === '(') { tokens.push({ type: 'paren', value: '(' }); current++; continue; }
    if (char === ')') { tokens.push({ type: 'paren', value: ')' }); current++; continue; }
    if (/[+\-*/=]/.test(char)) { tokens.push({ type: 'operator', value: char }); current++; continue; }
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
    if (token.type === 'name') { current++; return { type: 'Identifier', name: token.value }; }
    if (token.type === 'paren' && token.value === '(') {
      token = tokens[++current];
      if (token.value === 'var') {
        current++;
        let name = tokens[current++].value;
        let value = walk();
        tokens[current++]; // )
        return { type: 'VariableDeclaration', name, value };
      }
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

function codeGenerator(node, vars = {}) {
  switch (node.type) {
    case 'Program': 
      return node.body.map(n => codeGenerator(n, vars)).join(';\n') + ';';
    case 'VariableDeclaration':
      vars[node.name] = codeGenerator(node.value, vars);
      return `int ${node.name} = ${vars[node.name]}`;
    case 'Identifier':
      return node.name;
    case 'CallExpression':
      const ops = { add: '+', sub: '-', mul: '*', div: '/' };
      if (ops[node.name]) {
        return `(${node.params.map(p => codeGenerator(p, vars)).join(` ${ops[node.name]} `)})`;
      }
      return node.name + '(' + node.params.map(p => codeGenerator(p, vars)).join(', ') + ')';
    case 'NumberLiteral':
      return node.value;
  }
}

function compiler(input) {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  return codeGenerator(ast);
}

// Tests
console.log(compiler('(add 2 3)'));                    // (2 + 3)
console.log(compiler('(mul (add 2 3) 4)'));            // ((2 + 3) * 4)
console.log(compiler('(var x 10)'));                   // int x = 10
console.log(compiler('(var x 10) (add x 5)'));         // int x = 10; (x + 5)
