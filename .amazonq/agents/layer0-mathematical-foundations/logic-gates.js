// Logic Gate Simulator - Layer 0.2
// Foundation: Hardware gates built from boolean algebra

class LogicGate {
  constructor(type, inputs) {
    this.type = type;
    this.inputs = inputs;
    this.output = null;
  }

  compute() {
    const [a, b] = this.inputs;
    const gates = {
      'NOT': () => !a,
      'AND': () => a && b,
      'OR': () => a || b,
      'NAND': () => !(a && b),
      'NOR': () => !(a || b),
      'XOR': () => a !== b,
      'XNOR': () => a === b
    };
    this.output = gates[this.type]();
    return this.output;
  }
}

class Circuit {
  constructor() {
    this.gates = [];
    this.wires = new Map();
  }

  addGate(id, type, inputs) {
    this.gates.push({ id, gate: new LogicGate(type, inputs) });
  }

  connect(from, to) {
    this.wires.set(to, from);
  }

  simulate() {
    this.gates.forEach(({ id, gate }) => {
      const output = gate.compute();
      console.log(`${id} (${gate.type}): ${gate.inputs.join(', ')} → ${output}`);
    });
  }

  // Build half adder: A + B = Sum, Carry
  halfAdder(a, b) {
    const sum = new LogicGate('XOR', [a, b]).compute();
    const carry = new LogicGate('AND', [a, b]).compute();
    return { sum, carry };
  }

  // Build full adder: A + B + Cin = Sum, Cout
  fullAdder(a, b, cin) {
    const ha1 = this.halfAdder(a, b);
    const ha2 = this.halfAdder(ha1.sum, cin);
    const cout = new LogicGate('OR', [ha1.carry, ha2.carry]).compute();
    return { sum: ha2.sum, carry: cout };
  }
}

// Demo
const circuit = new Circuit();
console.log('Half Adder (1 + 1):');
console.log(circuit.halfAdder(true, true));

console.log('\nFull Adder (1 + 1 + 1):');
console.log(circuit.fullAdder(true, true, true));

export default Circuit;
