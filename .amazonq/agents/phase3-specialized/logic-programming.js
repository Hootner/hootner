// Minimal Logic Programming - Prolog-like, Unification, Backtracking
class LogicEngine {
  constructor() {
    this.facts = [];
    this.rules = [];
  }

  addFact(predicate, ...args) {
    this.facts.push({ predicate, args });
  }

  addRule(head, body) {
    this.rules.push({ head, body });
  }

  unify(term1, term2, bindings = {}) {
    if (this.isVariable(term1)) {
      return this.unifyVariable(term1, term2, bindings);
    }
    if (this.isVariable(term2)) {
      return this.unifyVariable(term2, term1, bindings);
    }
    if (term1 === term2) {
      return bindings;
    }
    return null;
  }

  isVariable(term) {
    return typeof term === 'string' && term.startsWith('?');
  }

  unifyVariable(variable, term, bindings) {
    if (variable in bindings) {
      return this.unify(bindings[variable], term, bindings);
    }
    if (this.isVariable(term) && term in bindings) {
      return this.unify(variable, bindings[term], bindings);
    }
    return { ...bindings, [variable]: term };
  }

  query(predicate, ...args) {
    const results = [];
    
    // Check facts
    for (const fact of this.facts) {
      if (fact.predicate === predicate && fact.args.length === args.length) {
        let bindings = {};
        let match = true;
        
        for (let i = 0; i < args.length; i++) {
          bindings = this.unify(args[i], fact.args[i], bindings);
          if (!bindings) {
            match = false;
            break;
          }
        }
        
        if (match) results.push(bindings);
      }
    }
    
    return results;
  }

  substitute(term, bindings) {
    if (this.isVariable(term)) {
      return bindings[term] !== undefined ? bindings[term] : term;
    }
    return term;
  }
}

// Demo: Family relationships
console.log('=== Logic Programming Demo ===\n');

const logic = new LogicEngine();

// Facts
logic.addFact('parent', 'tom', 'bob');
logic.addFact('parent', 'tom', 'liz');
logic.addFact('parent', 'bob', 'ann');
logic.addFact('parent', 'bob', 'pat');
logic.addFact('parent', 'pat', 'jim');

console.log('--- Query: Who are Tom\'s children? ---');
const children = logic.query('parent', 'tom', '?child');
children.forEach(b => console.log(`  ${b['?child']}`));

console.log('\n--- Query: Who is Bob\'s parent? ---');
const parents = logic.query('parent', '?parent', 'bob');
parents.forEach(b => console.log(`  ${b['?parent']}`));

console.log('\n--- Query: All parent-child relationships ---');
const all = logic.query('parent', '?parent', '?child');
all.forEach(b => console.log(`  ${b['?parent']} -> ${b['?child']}`));

export default LogicEngine;
