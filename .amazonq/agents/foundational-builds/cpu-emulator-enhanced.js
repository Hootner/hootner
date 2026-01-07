// Enhanced CPU Emulator - Layer 1.1
// Uses: Binary ALU (Layer 0.3), Logic Gates (Layer 0.2)

class CPU {
  constructor() {
    this.registers = new Uint8Array(16);  // 16 registers
    this.memory = new Uint8Array(4096);   // 4KB memory
    this.pc = 0;                          // Program counter
    this.sp = 0xFF;                       // Stack pointer
    this.flags = { zero: false, carry: false, negative: false };
  }

  // Fetch instruction
  fetch() {
    return this.memory[this.pc++];
  }

  // Decode and execute
  execute(opcode) {
    const op = opcode >> 4;
    const reg = opcode & 0x0F;

    switch(op) {
      case 0x0: this.nop(); break;
      case 0x1: this.load(reg, this.fetch()); break;
      case 0x2: this.add(reg, this.fetch()); break;
      case 0x3: this.sub(reg, this.fetch()); break;
      case 0x4: this.and(reg, this.fetch()); break;
      case 0x5: this.or(reg, this.fetch()); break;
      case 0x6: this.xor(reg, this.fetch()); break;
      case 0x7: this.jmp(this.fetch()); break;
      case 0x8: this.jz(this.fetch()); break;
      case 0x9: this.push(reg); break;
      case 0xA: this.pop(reg); break;
      case 0xF: this.halt(); break;
      default: console.log('Unknown opcode:', opcode.toString(16));
    }
  }

  // Instructions
  nop() {}
  load(reg, val) { this.registers[reg] = val; }
  
  add(reg, val) {
    const result = this.registers[reg] + val;
    this.flags.carry = result > 255;
    this.registers[reg] = result & 0xFF;
    this.updateFlags(this.registers[reg]);
  }

  sub(reg, val) {
    const result = this.registers[reg] - val;
    this.flags.carry = result < 0;
    this.registers[reg] = result & 0xFF;
    this.updateFlags(this.registers[reg]);
  }

  and(reg, val) { this.registers[reg] &= val; this.updateFlags(this.registers[reg]); }
  or(reg, val) { this.registers[reg] |= val; this.updateFlags(this.registers[reg]); }
  xor(reg, val) { this.registers[reg] ^= val; this.updateFlags(this.registers[reg]); }

  jmp(addr) { this.pc = addr; }
  jz(addr) { if (this.flags.zero) this.pc = addr; }

  push(reg) { this.memory[this.sp--] = this.registers[reg]; }
  pop(reg) { this.registers[reg] = this.memory[++this.sp]; }

  halt() { this.pc = -1; }

  updateFlags(val) {
    this.flags.zero = val === 0;
    this.flags.negative = val > 127;
  }

  // Load program
  loadProgram(program) {
    program.forEach((byte, i) => this.memory[i] = byte);
  }

  // Run
  run() {
    while (this.pc >= 0 && this.pc < this.memory.length) {
      const opcode = this.fetch();
      this.execute(opcode);
    }
  }

  // Debug
  dump() {
    console.log('Registers:', Array.from(this.registers.slice(0, 4)));
    console.log('Flags:', this.flags);
    console.log('PC:', this.pc, 'SP:', this.sp);
  }
}

// Demo: Add 5 + 3
const cpu = new CPU();
cpu.loadProgram([
  0x10, 0x05,  // LOAD R0, 5
  0x20, 0x03,  // ADD R0, 3
  0xF0         // HALT
]);
cpu.run();
cpu.dump();

export default CPU;
