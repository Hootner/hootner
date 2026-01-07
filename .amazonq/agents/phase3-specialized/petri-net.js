// Minimal Petri Net - Places, Transitions, Tokens, Firing
class PetriNet {
  constructor() {
    this.places = new Map();
    this.transitions = new Map();
  }

  addPlace(id, tokens = 0) {
    this.places.set(id, { id, tokens });
  }

  addTransition(id, inputs, outputs) {
    this.transitions.set(id, { id, inputs, outputs });
  }

  canFire(transitionId) {
    const transition = this.transitions.get(transitionId);
    if (!transition) return false;

    return transition.inputs.every(({ place, weight = 1 }) => {
      const p = this.places.get(place);
      return p && p.tokens >= weight;
    });
  }

  fire(transitionId) {
    if (!this.canFire(transitionId)) {
      console.log(`Cannot fire ${transitionId}`);
      return false;
    }

    const transition = this.transitions.get(transitionId);

    // Remove tokens from input places
    transition.inputs.forEach(({ place, weight = 1 }) => {
      this.places.get(place).tokens -= weight;
    });

    // Add tokens to output places
    transition.outputs.forEach(({ place, weight = 1 }) => {
      this.places.get(place).tokens += weight;
    });

    console.log(`Fired: ${transitionId}`);
    return true;
  }

  getMarking() {
    const marking = {};
    this.places.forEach((place, id) => {
      marking[id] = place.tokens;
    });
    return marking;
  }

  simulate(steps = 10) {
    console.log('Initial:', this.getMarking());

    for (let i = 0; i < steps; i++) {
      let fired = false;

      for (const [id, _] of this.transitions) {
        if (this.canFire(id)) {
          this.fire(id);
          console.log('  State:', this.getMarking());
          fired = true;
          break;
        }
      }

      if (!fired) {
        console.log('Deadlock - no transitions can fire');
        break;
      }
    }
  }
}

// Demo: Producer-Consumer
console.log('=== Petri Net Demo ===\n');

console.log('--- Producer-Consumer ---');
const pc = new PetriNet();

pc.addPlace('buffer', 0);
pc.addPlace('producer_ready', 1);
pc.addPlace('consumer_ready', 1);

pc.addTransition('produce', 
  [{ place: 'producer_ready' }],
  [{ place: 'buffer' }, { place: 'producer_ready' }]
);

pc.addTransition('consume',
  [{ place: 'buffer' }, { place: 'consumer_ready' }],
  [{ place: 'consumer_ready' }]
);

pc.simulate(8);

// Demo: Dining Philosophers (simplified 2 philosophers)
console.log('\n--- Dining Philosophers (2) ---');
const dp = new PetriNet();

dp.addPlace('fork1', 1);
dp.addPlace('fork2', 1);
dp.addPlace('phil1_thinking', 1);
dp.addPlace('phil2_thinking', 1);
dp.addPlace('phil1_eating', 0);
dp.addPlace('phil2_eating', 0);

dp.addTransition('phil1_pickup',
  [{ place: 'phil1_thinking' }, { place: 'fork1' }, { place: 'fork2' }],
  [{ place: 'phil1_eating' }]
);

dp.addTransition('phil1_putdown',
  [{ place: 'phil1_eating' }],
  [{ place: 'phil1_thinking' }, { place: 'fork1' }, { place: 'fork2' }]
);

dp.simulate(4);

export default PetriNet;
