// Minimal Finite State Machine - States, Transitions, Guards
class FSM {
  constructor(initialState) {
    this.state = initialState;
    this.transitions = new Map();
    this.handlers = new Map();
  }

  addTransition(from, event, to, guard = null) {
    const key = `${from}:${event}`;
    this.transitions.set(key, { to, guard });
  }

  onEnter(state, handler) {
    this.handlers.set(`enter:${state}`, handler);
  }

  onExit(state, handler) {
    this.handlers.set(`exit:${state}`, handler);
  }

  trigger(event, context = {}) {
    const key = `${this.state}:${event}`;
    const transition = this.transitions.get(key);
    
    if (!transition) {
      console.log(`No transition for ${event} in state ${this.state}`);
      return false;
    }

    if (transition.guard && !transition.guard(context)) {
      console.log(`Guard failed for ${event}`);
      return false;
    }

    const oldState = this.state;
    const newState = transition.to;

    // Exit handler
    const exitHandler = this.handlers.get(`exit:${oldState}`);
    if (exitHandler) exitHandler(context);

    this.state = newState;
    console.log(`${oldState} --[${event}]--> ${newState}`);

    // Enter handler
    const enterHandler = this.handlers.get(`enter:${newState}`);
    if (enterHandler) enterHandler(context);

    return true;
  }

  getState() {
    return this.state;
  }
}

// Demo: Traffic Light
console.log('=== Finite State Machine Demo ===\n');

console.log('--- Traffic Light ---');
const light = new FSM('red');

light.addTransition('red', 'timer', 'green');
light.addTransition('green', 'timer', 'yellow');
light.addTransition('yellow', 'timer', 'red');

light.onEnter('red', () => console.log('  STOP'));
light.onEnter('green', () => console.log('  GO'));
light.onEnter('yellow', () => console.log('  CAUTION'));

light.trigger('timer');
light.trigger('timer');
light.trigger('timer');

// Demo: Door with guard
console.log('\n--- Door with Lock ---');
const door = new FSM('closed');

door.addTransition('closed', 'open', 'open', ctx => ctx.unlocked);
door.addTransition('open', 'close', 'closed');
door.addTransition('closed', 'lock', 'locked');
door.addTransition('locked', 'unlock', 'closed');

door.trigger('open', { unlocked: false }); // Fails
door.trigger('open', { unlocked: true });  // Success
door.trigger('close');
door.trigger('lock');
door.trigger('unlock');

export default FSM;
