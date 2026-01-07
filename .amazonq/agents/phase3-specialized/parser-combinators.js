// Minimal Parser Combinators - Functional Parsing
class Parser {
  constructor(fn) {
    this.fn = fn;
  }

  parse(input) {
    return this.fn(input);
  }

  map(fn) {
    return new Parser(input => {
      const result = this.parse(input);
      return result.success ? { success: true, value: fn(result.value), rest: result.rest } : result;
    });
  }

  flatMap(fn) {
    return new Parser(input => {
      const result = this.parse(input);
      return result.success ? fn(result.value).parse(result.rest) : result;
    });
  }

  or(other) {
    return new Parser(input => {
      const result = this.parse(input);
      return result.success ? result : other.parse(input);
    });
  }

  then(other) {
    return this.flatMap(a => other.map(b => [a, b]));
  }

  many() {
    return new Parser(input => {
      const values = [];
      let rest = input;
      while (true) {
        const result = this.parse(rest);
        if (!result.success) break;
        values.push(result.value);
        rest = result.rest;
      }
      return { success: true, value: values, rest };
    });
  }
}

const char = c => new Parser(input => {
  if (input[0] === c) {
    return { success: true, value: c, rest: input.slice(1) };
  }
  return { success: false };
});

const digit = new Parser(input => {
  if (/[0-9]/.test(input[0])) {
    return { success: true, value: input[0], rest: input.slice(1) };
  }
  return { success: false };
});

const letter = new Parser(input => {
  if (/[a-zA-Z]/.test(input[0])) {
    return { success: true, value: input[0], rest: input.slice(1) };
  }
  return { success: false };
});

const string = str => new Parser(input => {
  if (input.startsWith(str)) {
    return { success: true, value: str, rest: input.slice(str.length) };
  }
  return { success: false };
});

const number = digit.many().map(digits => parseInt(digits.join('')));

const identifier = letter.flatMap(first =>
  letter.or(digit).many().map(rest => first + rest.join(''))
);

// Demo
console.log('=== Parser Combinators Demo ===\n');

console.log('--- Parse single char ---');
console.log(char('a').parse('abc'));

console.log('\n--- Parse string ---');
console.log(string('hello').parse('hello world'));

console.log('\n--- Parse number ---');
console.log(number.parse('12345abc'));

console.log('\n--- Parse identifier ---');
console.log(identifier.parse('var123'));

console.log('\n--- Parse with alternatives ---');
const keyword = string('if').or(string('else')).or(string('while'));
console.log(keyword.parse('if'));
console.log(keyword.parse('while'));

console.log('\n--- Parse sequence ---');
const assignment = identifier
  .then(char('='))
  .then(number)
  .map(([[name, _], value]) => ({ type: 'assign', name, value }));
console.log(assignment.parse('x=42'));

export { Parser, char, digit, letter, string, number, identifier };
