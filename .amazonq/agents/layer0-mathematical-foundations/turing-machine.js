// Turing Machine Simulator - Layer 0.5
// Foundation: Universal computation model

class TuringMachine {
  constructor(tape, initialState = 'q0') {
    this.tape = tape.split('');
    this.head = 0;
    this.state = initialState;
    this.transitions = new Map();
    this.halted = false;
  }

  addTransition(state, read, write, move, nextState) {
    const key = `${state}:${read}`;
    this.transitions.set(key, { write, move, nextState });
  }

  step() {
    if (this.halted) return false;

    const symbol = this.tape[this.head] || '_';
    const key = `${this.state}:${symbol}`;
    const transition = this.transitions.get(key);

    if (!transition) {
      this.halted = true;
      return false;
    }

    this.tape[this.head] = transition.write;
    this.head += transition.move === 'R' ? 1 : -1;
    this.state = transition.nextState;

    if (this.head < 0) this.head = 0;
    if (this.head >= this.tape.length) this.tape.push('_');

    return true;
  }

  run(maxSteps = 100) {
    let steps = 0;
    while (!this.halted && steps < maxSteps) {
      this.step();
      steps++;
    }
    return this.tape.join('').replace(/_+$/, '');
  }

  display() {
    const tape = this.tape.map((s, i) => i === this.head ? `[${s}]` : s).join('');
    console.log(`State: ${this.state}, Tape: ${tape}`);
  }
}

// Demo: Binary increment
const tm = new TuringMachine('111');
tm.addTransition('q0', '1', '1', 'R', 'q0');
tm.addTransition('q0', '_', '1', 'L', 'halt');
console.log('Binary increment: 111 →', tm.run());

// Demo: Palindrome checker
const pal = new TuringMachine('aba');
pal.addTransition('q0', 'a', '_', 'R', 'q1');
pal.addTransition('q1', 'b', 'b', 'R', 'q1');
pal.addTransition('q1', 'a', '_', 'L', 'q2');
pal.addTransition('q2', 'b', 'b', 'L', 'q2');
pal.addTransition('q2', '_', '_', 'R', 'accept');
console.log('Palindrome check:', pal.state === 'accept' ? 'Yes' : 'No');

export default TuringMachine;
