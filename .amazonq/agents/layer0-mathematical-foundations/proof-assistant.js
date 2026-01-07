// Proof Assistant - Layer 0.8
// Foundation: Formal verification and proofs

class ProofAssistant {
  constructor() {
    this.axioms = new Set();
    this.theorems = new Map();
  }

  // Add axiom (assumed true)
  axiom(name, formula) {
    this.axioms.add(name);
    this.theorems.set(name, { formula, proof: 'axiom' });
  }

  // Prove theorem
  theorem(name, formula, proof) {
    if (this.verify(formula, proof)) {
      this.theorems.set(name, { formula, proof });
      return true;
    }
    return false;
  }

  // Verify proof
  verify(formula, proof) {
    if (proof === 'axiom') return true;
    
    if (proof.rule === 'modus-ponens') {
      // If A and A→B, then B
      const a = this.theorems.get(proof.premise1);
      const impl = this.theorems.get(proof.premise2);
      
      if (!a || !impl) return false;
      
      return impl.formula.type === 'implies' &&
             this.equal(impl.formula.left, a.formula) &&
             this.equal(impl.formula.right, formula);
    }
    
    if (proof.rule === 'assumption') {
      return true;
    }
    
    return false;
  }

  // Check formula equality
  equal(f1, f2) {
    if (f1.type !== f2.type) return false;
    if (f1.type === 'var') return f1.name === f2.name;
    if (f1.type === 'implies') {
      return this.equal(f1.left, f2.left) && this.equal(f1.right, f2.right);
    }
    return false;
  }

  // Formula constructors
  var(name) { return { type: 'var', name }; }
  implies(left, right) { return { type: 'implies', left, right }; }
  and(left, right) { return { type: 'and', left, right }; }
  or(left, right) { return { type: 'or', left, right }; }
  not(formula) { return { type: 'not', formula }; }

  // Pretty print
  print(formula) {
    if (formula.type === 'var') return formula.name;
    if (formula.type === 'implies') return `(${this.print(formula.left)} → ${this.print(formula.right)})`;
    if (formula.type === 'and') return `(${this.print(formula.left)} ∧ ${this.print(formula.right)})`;
    if (formula.type === 'or') return `(${this.print(formula.left)} ∨ ${this.print(formula.right)})`;
    if (formula.type === 'not') return `¬${this.print(formula.formula)}`;
    return '?';
  }
}

// Demo
const pa = new ProofAssistant();

// Axiom: A
const A = pa.var('A');
pa.axiom('ax1', A);

// Axiom: A → B
const B = pa.var('B');
const AimpliesB = pa.implies(A, B);
pa.axiom('ax2', AimpliesB);

// Theorem: B (by modus ponens)
const proved = pa.theorem('thm1', B, {
  rule: 'modus-ponens',
  premise1: 'ax1',
  premise2: 'ax2'
});

console.log('Axiom 1:', pa.print(A));
console.log('Axiom 2:', pa.print(AimpliesB));
console.log('Theorem:', pa.print(B), '- Proved:', proved);

// List all theorems
console.log('\nAll theorems:');
pa.theorems.forEach((thm, name) => {
  console.log(`  ${name}: ${pa.print(thm.formula)}`);
});

export default ProofAssistant;
