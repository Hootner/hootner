// Finite State Machine - Layer 0.4
// Foundation: State transitions and computation

class FSM {
  constructor(states, initial) {
    this.states = states;
    this.current = initial;
    this.transitions = new Map();
  }

  addTransition(from, input, to, action) {
    const key = `${from}:${input}`;
    this.transitions.set(key, { to, action });
  }

  process(input) {
    const key = `${this.current}:${input}`;
    const transition = this.transitions.get(key);
    
    if (!transition) {
      console.log(`No transition from ${this.current} on ${input}`);
      return false;
    }
    
    console.log(`${this.current} --[${input}]--> ${transition.to}`);
    if (transition.action) transition.action();
    
    this.current = transition.to;
    return true;
  }

  reset(state) {
    this.current = state || this.states[0];
  }
}

// Demo: Traffic Light
const trafficLight = new FSM(['red', 'yellow', 'green'], 'red');
trafficLight.addTransition('red', 'timer', 'green', () => console.log('  → GO!'));
trafficLight.addTransition('green', 'timer', 'yellow', () => console.log('  → SLOW!'));
trafficLight.addTransition('yellow', 'timer', 'red', () => console.log('  → STOP!'));

console.log('Traffic Light FSM:');
trafficLight.process('timer');
trafficLight.process('timer');
trafficLight.process('timer');

// Demo: Binary Counter
const counter = new FSM(['0', '1'], '0');
counter.addTransition('0', 'tick', '1');
counter.addTransition('1', 'tick', '0');

console.log('\nBinary Counter:');
for (let i = 0; i < 5; i++) {
  console.log(`State: ${counter.current}`);
  counter.process('tick');
}

export default FSM;
