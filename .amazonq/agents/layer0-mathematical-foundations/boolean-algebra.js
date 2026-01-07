// Boolean Algebra Engine - Layer 0.1
// Foundation: All digital logic starts here

class BooleanAlgebra {
  // Basic operations
  NOT(a) { return !a; }
  AND(a, b) { return a && b; }
  OR(a, b) { return a || b; }
  XOR(a, b) { return a !== b; }
  NAND(a, b) { return !this.AND(a, b); }
  NOR(a, b) { return !this.OR(a, b); }
  XNOR(a, b) { return !this.XOR(a, b); }

  // Laws
  identity(a) { return { and: this.AND(a, true), or: this.OR(a, false) }; }
  complement(a) { return { and: this.AND(a, !a), or: this.OR(a, !a) }; }
  idempotent(a) { return { and: this.AND(a, a), or: this.OR(a, a) }; }
  
  // De Morgan's Laws
  deMorgan1(a, b) { return this.NOT(this.AND(a, b)) === this.OR(this.NOT(a), this.NOT(b)); }
  deMorgan2(a, b) { return this.NOT(this.OR(a, b)) === this.AND(this.NOT(a), this.NOT(b)); }

  // Truth table generator
  truthTable(fn, inputs) {
    const results = [];
    const combinations = Math.pow(2, inputs);
    
    for (let i = 0; i < combinations; i++) {
      const bits = i.toString(2).padStart(inputs, '0').split('').map(b => b === '1');
      results.push({ inputs: bits, output: fn(...bits) });
    }
    
    return results;
  }
}

// Demo
const ba = new BooleanAlgebra();
console.log('NOT(true):', ba.NOT(true));
console.log('AND(true, false):', ba.AND(true, false));
console.log('XOR(true, true):', ba.XOR(true, true));
console.log('\nXOR Truth Table:');
console.table(ba.truthTable((a, b) => ba.XOR(a, b), 2));

export default BooleanAlgebra;
