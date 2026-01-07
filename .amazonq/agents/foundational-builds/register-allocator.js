// Register Allocator - Layer 1.7
// Assigns variables to CPU registers

class RegisterAllocator {
  constructor(numRegs) {
    this.numRegs = numRegs;
    this.allocation = new Map();
    this.free = Array.from({ length: numRegs }, (_, i) => i);
    this.spilled = [];
  }

  // Allocate register for variable
  allocate(variable) {
    if (this.allocation.has(variable)) {
      return this.allocation.get(variable);
    }

    if (this.free.length > 0) {
      const reg = this.free.shift();
      this.allocation.set(variable, reg);
      return reg;
    }

    // Spill to memory
    const victim = this.selectVictim();
    this.spill(victim);
    return this.allocate(variable);
  }

  // Free register
  free(variable) {
    const reg = this.allocation.get(variable);
    if (reg !== undefined) {
      this.allocation.delete(variable);
      this.free.push(reg);
    }
  }

  // Spill variable to memory
  spill(variable) {
    const reg = this.allocation.get(variable);
    this.spilled.push({ variable, reg });
    this.allocation.delete(variable);
    this.free.push(reg);
    console.log(`Spilled ${variable} from R${reg}`);
  }

  // Select victim for spilling (LRU)
  selectVictim() {
    return Array.from(this.allocation.keys())[0];
  }

  // Graph coloring allocation
  graphColor(liveRanges) {
    const graph = this.buildInterferenceGraph(liveRanges);
    const colors = new Map();
    
    // Greedy coloring
    graph.forEach((neighbors, node) => {
      const usedColors = new Set();
      neighbors.forEach(n => {
        if (colors.has(n)) usedColors.add(colors.get(n));
      });
      
      for (let color = 0; color < this.numRegs; color++) {
        if (!usedColors.has(color)) {
          colors.set(node, color);
          break;
        }
      }
    });
    
    return colors;
  }

  // Build interference graph
  buildInterferenceGraph(liveRanges) {
    const graph = new Map();
    
    liveRanges.forEach(range => {
      if (!graph.has(range.var)) graph.set(range.var, new Set());
    });
    
    // Variables interfere if live ranges overlap
    for (let i = 0; i < liveRanges.length; i++) {
      for (let j = i + 1; j < liveRanges.length; j++) {
        if (this.overlaps(liveRanges[i], liveRanges[j])) {
          graph.get(liveRanges[i].var).add(liveRanges[j].var);
          graph.get(liveRanges[j].var).add(liveRanges[i].var);
        }
      }
    }
    
    return graph;
  }

  overlaps(r1, r2) {
    return r1.start <= r2.end && r2.start <= r1.end;
  }
}

// Demo
const allocator = new RegisterAllocator(4);

console.log('Simple allocation:');
console.log('a -> R' + allocator.allocate('a'));
console.log('b -> R' + allocator.allocate('b'));
console.log('c -> R' + allocator.allocate('c'));
console.log('d -> R' + allocator.allocate('d'));
console.log('e -> R' + allocator.allocate('e')); // Will spill

console.log('\nGraph coloring:');
const liveRanges = [
  { var: 'x', start: 0, end: 3 },
  { var: 'y', start: 1, end: 4 },
  { var: 'z', start: 2, end: 5 }
];
const colors = allocator.graphColor(liveRanges);
colors.forEach((reg, v) => console.log(`${v} -> R${reg}`));

export default RegisterAllocator;
