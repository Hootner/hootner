// Instruction Set Simulator - Layer 1.6
// Simulates different CPU architectures

class ISA {
  constructor(name, bitWidth) {
    this.name = name;
    this.bitWidth = bitWidth;
    this.instructions = new Map();
  }

  // Define instruction
  define(mnemonic, opcode, format, execute) {
    this.instructions.set(opcode, { mnemonic, format, execute });
  }

  // Decode instruction
  decode(word) {
    const opcode = word >> (this.bitWidth - 4);
    return this.instructions.get(opcode);
  }

  // Execute instruction
  execute(word, state) {
    const instr = this.decode(word);
    if (!instr) return false;
    instr.execute(word, state);
    return true;
  }
}

// RISC-style ISA
class RISC extends ISA {
  constructor() {
    super('RISC', 16);
    
    // R-type: op(4) rd(4) rs(4) rt(4)
    this.define('ADD', 0x1, 'R', (word, s) => {
      const rd = (word >> 8) & 0xF;
      const rs = (word >> 4) & 0xF;
      const rt = word & 0xF;
      s.regs[rd] = s.regs[rs] + s.regs[rt];
    });

    this.define('SUB', 0x2, 'R', (word, s) => {
      const rd = (word >> 8) & 0xF;
      const rs = (word >> 4) & 0xF;
      const rt = word & 0xF;
      s.regs[rd] = s.regs[rs] - s.regs[rt];
    });

    // I-type: op(4) rd(4) imm(8)
    this.define('ADDI', 0x3, 'I', (word, s) => {
      const rd = (word >> 8) & 0xF;
      const imm = word & 0xFF;
      s.regs[rd] += imm;
    });

    this.define('LI', 0x4, 'I', (word, s) => {
      const rd = (word >> 8) & 0xF;
      const imm = word & 0xFF;
      s.regs[rd] = imm;
    });
  }
}

// CISC-style ISA
class CISC extends ISA {
  constructor() {
    super('CISC', 16);
    
    // Variable length, complex addressing
    this.define('MOV', 0x1, 'complex', (word, s) => {
      const mode = (word >> 8) & 0xF;
      const data = word & 0xFF;
      // Direct, indirect, indexed, etc.
      s.regs[0] = data;
    });

    this.define('PUSH', 0x2, 'stack', (word, s) => {
      const reg = (word >> 8) & 0xF;
      s.stack.push(s.regs[reg]);
    });

    this.define('POP', 0x3, 'stack', (word, s) => {
      const reg = (word >> 8) & 0xF;
      s.regs[reg] = s.stack.pop();
    });
  }
}

// Demo
const risc = new RISC();
const state = { regs: new Array(16).fill(0) };

// LI R1, 10
risc.execute(0x4110, state);
// LI R2, 5
risc.execute(0x4205, state);
// ADD R0, R1, R2
risc.execute(0x1012, state);

console.log('RISC execution:');
console.log('R0 =', state.regs[0], '(should be 15)');
console.log('R1 =', state.regs[1]);
console.log('R2 =', state.regs[2]);

export { ISA, RISC, CISC };
