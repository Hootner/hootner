// Minimal Scripting Language - Lightweight interpreter for quick tasks
class ScriptingLanguage {
  constructor() {
    this.globals = new Map();
    this.functions = new Map();
  }

  // Parse and execute script
  execute(script) {
    const lines = script.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
    
    for (const line of lines) {
      this.executeLine(line.trim());
    }
  }

  executeLine(line) {
    // Variable assignment: x = 10
    if (line.includes('=') && !line.includes('==')) {
      const [name, expr] = line.split('=').map(s => s.trim());
      this.globals.set(name, this.evaluate(expr));
      return;
    }

    // Print: print x
    if (line.startsWith('print ')) {
      const expr = line.substring(6);
      console.log(this.evaluate(expr));
      return;
    }

    // If statement: if x > 5 then print "big"
    if (line.startsWith('if ')) {
      const match = line.match(/if (.+) then (.+)/);
      if (match) {
        const [, condition, action] = match;
        if (this.evaluate(condition)) {
          this.executeLine(action);
        }
      }
      return;
    }

    // Function definition: fn add(a, b) = a + b
    if (line.startsWith('fn ')) {
      const match = line.match(/fn (\w+)\(([^)]*)\) = (.+)/);
      if (match) {
        const [, name, params, body] = match;
        this.functions.set(name, {
          params: params.split(',').map(p => p.trim()).filter(Boolean),
          body
        });
      }
      return;
    }
  }

  evaluate(expr) {
    expr = expr.trim();

    // String literal
    if (expr.startsWith('"') && expr.endsWith('"')) {
      return expr.slice(1, -1);
    }

    // Number
    if (!isNaN(expr)) {
      return parseFloat(expr);
    }

    // Variable
    if (this.globals.has(expr)) {
      return this.globals.get(expr);
    }

    // Function call: add(2, 3)
    const fnMatch = expr.match(/(\w+)\(([^)]*)\)/);
    if (fnMatch) {
      const [, name, argsStr] = fnMatch;
      const fn = this.functions.get(name);
      if (fn) {
        const args = argsStr.split(',').map(a => this.evaluate(a.trim()));
        const savedGlobals = new Map(this.globals);
        fn.params.forEach((param, i) => this.globals.set(param, args[i]));
        const result = this.evaluate(fn.body);
        this.globals = savedGlobals;
        return result;
      }
    }

    // Binary operations
    for (const op of ['==', '!=', '<=', '>=', '<', '>', '+', '-', '*', '/']) {
      if (expr.includes(op)) {
        const parts = expr.split(op).map(p => p.trim());
        if (parts.length === 2) {
          const left = this.evaluate(parts[0]);
          const right = this.evaluate(parts[1]);
          
          switch (op) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            case '==': return left === right;
            case '!=': return left !== right;
            case '<': return left < right;
            case '>': return left > right;
            case '<=': return left <= right;
            case '>=': return left >= right;
          }
        }
      }
    }

    return expr;
  }
}

// Demo
console.log('=== Scripting Language Demo ===\n');

const lang = new ScriptingLanguage();

const script = `
# Variables
x = 10
y = 20
sum = x + y
print sum

# Conditionals
if sum > 25 then print "Large sum"

# Functions
fn double(n) = n * 2
result = double(5)
print result

# String
name = "World"
print name
`;

lang.execute(script);

export default ScriptingLanguage;
