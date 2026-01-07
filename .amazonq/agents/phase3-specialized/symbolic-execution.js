// Minimal Symbolic Execution - Path Exploration, Constraints
class SymbolicValue {
  constructor(name) {
    this.name = name;
    this.constraints = [];
  }

  toString() {
    return this.name;
  }
}

class SymbolicExecutor {
  constructor() {
    this.paths = [];
    this.currentPath = { constraints: [], values: new Map() };
  }

  createSymbol(name) {
    const symbol = new SymbolicValue(name);
    this.currentPath.values.set(name, symbol);
    return symbol;
  }

  addConstraint(constraint) {
    this.currentPath.constraints.push(constraint);
  }

  branch(condition) {
    // Fork execution: true and false branches
    const truePath = {
      constraints: [...this.currentPath.constraints, condition],
      values: new Map(this.currentPath.values)
    };

    const falseConstraint = `!(${condition})`;
    const falsePath = {
      constraints: [...this.currentPath.constraints, falseConstraint],
      values: new Map(this.currentPath.values)
    };

    return [truePath, falsePath];
  }

  execute(program, input) {
    const workList = [{ path: this.currentPath, pc: 0, vars: { ...input } }];
    const results = [];

    while (workList.length > 0) {
      const state = workList.shift();
      this.currentPath = state.path;

      if (state.pc >= program.length) {
        results.push({
          constraints: state.path.constraints,
          output: state.vars
        });
        continue;
      }

      const instruction = program[state.pc];
      
      if (instruction.type === 'assign') {
        state.vars[instruction.target] = this.eval(instruction.expr, state.vars);
        workList.push({ ...state, pc: state.pc + 1 });
      }
      else if (instruction.type === 'branch') {
        const condition = instruction.condition;
        const [truePath, falsePath] = this.branch(condition);

        workList.push({
          path: truePath,
          pc: instruction.trueBranch,
          vars: { ...state.vars }
        });

        workList.push({
          path: falsePath,
          pc: instruction.falseBranch,
          vars: { ...state.vars }
        });
      }
    }

    return results;
  }

  eval(expr, vars) {
    if (typeof expr === 'number') return expr;
    if (typeof expr === 'string') return vars[expr];
    return expr;
  }
}

// Demo: Simple program analysis
console.log('=== Symbolic Execution Demo ===\n');

const executor = new SymbolicExecutor();

// Program: if (x > 0) y = x * 2; else y = -x;
const program = [
  { type: 'branch', condition: 'x > 0', trueBranch: 1, falseBranch: 2 },
  { type: 'assign', target: 'y', expr: 'x * 2' },
  { type: 'assign', target: 'y', expr: '-x' }
];

const x = executor.createSymbol('x');
const results = executor.execute(program, { x });

console.log('Explored paths:');
results.forEach((result, i) => {
  console.log(`\nPath ${i + 1}:`);
  console.log('  Constraints:', result.constraints.join(', '));
  console.log('  Output:', result.output);
});

export default SymbolicExecutor;
