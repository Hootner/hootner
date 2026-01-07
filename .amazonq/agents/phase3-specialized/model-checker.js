// Minimal Model Checker - LTL, State Space Exploration
class ModelChecker {
  constructor() {
    this.states = new Map();
    this.transitions = [];
    this.labels = new Map();
  }

  addState(id, labels = []) {
    this.states.set(id, { id });
    this.labels.set(id, new Set(labels));
  }

  addTransition(from, to) {
    this.transitions.push({ from, to });
  }

  hasLabel(state, label) {
    return this.labels.get(state)?.has(label) || false;
  }

  getSuccessors(state) {
    return this.transitions
      .filter(t => t.from === state)
      .map(t => t.to);
  }

  // Check: Always P (globally)
  checkAlways(property, initial) {
    const visited = new Set();
    const stack = [initial];

    while (stack.length > 0) {
      const state = stack.pop();
      if (visited.has(state)) continue;
      visited.add(state);

      if (!this.hasLabel(state, property)) {
        return { result: false, counterexample: state };
      }

      this.getSuccessors(state).forEach(s => stack.push(s));
    }

    return { result: true };
  }

  // Check: Eventually P (finally)
  checkEventually(property, initial) {
    const visited = new Set();
    const stack = [initial];

    while (stack.length > 0) {
      const state = stack.pop();
      if (visited.has(state)) continue;
      visited.add(state);

      if (this.hasLabel(state, property)) {
        return { result: true, witness: state };
      }

      this.getSuccessors(state).forEach(s => stack.push(s));
    }

    return { result: false };
  }

  // Check: P Until Q
  checkUntil(p, q, initial) {
    const visited = new Set();
    const queue = [initial];

    while (queue.length > 0) {
      const state = queue.shift();
      if (visited.has(state)) continue;
      visited.add(state);

      if (this.hasLabel(state, q)) {
        return { result: true, witness: state };
      }

      if (!this.hasLabel(state, p)) {
        continue; // P must hold until Q
      }

      this.getSuccessors(state).forEach(s => queue.push(s));
    }

    return { result: false };
  }
}

// Demo: Traffic light system
console.log('=== Model Checker Demo ===\n');

const mc = new ModelChecker();

// States
mc.addState('s0', ['red']);
mc.addState('s1', ['green']);
mc.addState('s2', ['yellow']);

// Transitions (cycle)
mc.addTransition('s0', 's1');
mc.addTransition('s1', 's2');
mc.addTransition('s2', 's0');

console.log('--- Traffic Light Model ---');

// Check: Always (red OR green OR yellow)
const safety = mc.checkAlways('red', 's0') || 
               mc.checkAlways('green', 's0') || 
               mc.checkAlways('yellow', 's0');
console.log('Safety (always one color):', safety);

// Check: Eventually green
const liveness = mc.checkEventually('green', 's0');
console.log('Liveness (eventually green):', liveness.result);

// Check: red Until green
const until = mc.checkUntil('red', 'green', 's0');
console.log('Red until green:', until.result);

export default ModelChecker;
