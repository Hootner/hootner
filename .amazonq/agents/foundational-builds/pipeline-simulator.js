// Pipeline Simulator - Layer 1.8
// Simulates CPU instruction pipeline

class Pipeline {
  constructor(stages) {
    this.stages = stages;
    this.pipeline = Array(stages.length).fill(null);
    this.cycle = 0;
    this.stalls = 0;
  }

  // Clock cycle
  tick() {
    this.cycle++;
    
    // Execute stages in reverse order
    for (let i = this.stages.length - 1; i >= 0; i--) {
      if (this.pipeline[i]) {
        if (i === this.stages.length - 1) {
          // Writeback stage
          console.log(`Cycle ${this.cycle}: ${this.stages[i]} - ${this.pipeline[i].op}`);
          this.pipeline[i] = null;
        } else {
          // Forward to next stage
          if (!this.pipeline[i + 1]) {
            this.pipeline[i + 1] = this.pipeline[i];
            this.pipeline[i] = null;
          } else {
            // Stall
            this.stalls++;
          }
        }
      }
    }
  }

  // Insert instruction
  insert(instruction) {
    if (!this.pipeline[0]) {
      this.pipeline[0] = instruction;
      return true;
    }
    return false;
  }

  // Check for hazards
  hasHazard(instr1, instr2) {
    // RAW (Read After Write)
    if (instr1.dest === instr2.src1 || instr1.dest === instr2.src2) {
      return 'RAW';
    }
    // WAR (Write After Read)
    if (instr2.dest === instr1.src1 || instr2.dest === instr1.src2) {
      return 'WAR';
    }
    // WAW (Write After Write)
    if (instr1.dest === instr2.dest) {
      return 'WAW';
    }
    return null;
  }

  // Display pipeline state
  display() {
    console.log(`\nCycle ${this.cycle}:`);
    this.stages.forEach((stage, i) => {
      const instr = this.pipeline[i];
      console.log(`  ${stage}: ${instr ? instr.op : 'bubble'}`);
    });
  }
}

// 5-stage pipeline
const pipeline = new Pipeline(['Fetch', 'Decode', 'Execute', 'Memory', 'Writeback']);

// Program
const program = [
  { op: 'ADD R1, R2, R3', dest: 'R1', src1: 'R2', src2: 'R3' },
  { op: 'SUB R4, R1, R5', dest: 'R4', src1: 'R1', src2: 'R5' },
  { op: 'MUL R6, R4, R7', dest: 'R6', src1: 'R4', src2: 'R7' }
];

console.log('Pipeline Simulation:');
program.forEach((instr, i) => {
  pipeline.insert(instr);
  pipeline.tick();
  if (i < program.length - 1) {
    const hazard = pipeline.hasHazard(instr, program[i + 1]);
    if (hazard) console.log(`  Hazard detected: ${hazard}`);
  }
});

// Drain pipeline
for (let i = 0; i < 5; i++) {
  pipeline.tick();
}

console.log(`\nTotal cycles: ${pipeline.cycle}`);
console.log(`Stalls: ${pipeline.stalls}`);
console.log(`CPI: ${pipeline.cycle / program.length}`);

export default Pipeline;
