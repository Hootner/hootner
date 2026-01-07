// Virtual Machine - Layer 4.1
// Uses: CPU Emulator (1.1), Memory Manager (3.4)

class VirtualMachine {
  constructor(memory = 4096) {
    this.memory = new Uint8Array(memory);
    this.registers = new Uint32Array(16);
    this.pc = 0;
    this.sp = memory - 1;
    this.flags = { zero: false, carry: false };
    this.running = false;
  }

  // Load program
  load(bytecode, offset = 0) {
    bytecode.forEach((byte, i) => this.memory[offset + i] = byte);
    this.pc = offset;
  }

  // Fetch-decode-execute cycle
  step() {
    if (!this.running) return false;

    const opcode = this.fetch();
    this.execute(opcode);
    return this.running;
  }

  fetch() {
    return this.memory[this.pc++];
  }

  execute(opcode) {
    const op = opcode >> 4;
    const reg = opcode & 0x0F;

    switch(op) {
      case 0x0: this.halt(); break;
      case 0x1: this.load_imm(reg, this.fetch()); break;
      case 0x2: this.add(reg, this.fetch()); break;
      case 0x3: this.sub(reg, this.fetch()); break;
      case 0x4: this.mul(reg, this.fetch()); break;
      case 0x5: this.div(reg, this.fetch()); break;
      case 0x6: this.jmp(this.fetch()); break;
      case 0x7: this.jz(this.fetch()); break;
      case 0x8: this.push(reg); break;
      case 0x9: this.pop(reg); break;
      case 0xA: this.call(this.fetch()); break;
      case 0xB: this.ret(); break;
      default: console.log('Unknown opcode:', opcode.toString(16));
    }
  }

  // Instructions
  halt() { this.running = false; }
  
  load_imm(reg, val) {
    this.registers[reg] = val;
  }

  add(reg, val) {
    this.registers[reg] += val;
    this.flags.zero = this.registers[reg] === 0;
  }

  sub(reg, val) {
    this.registers[reg] -= val;
    this.flags.zero = this.registers[reg] === 0;
  }

  mul(reg, val) {
    this.registers[reg] *= val;
  }

  div(reg, val) {
    if (val === 0) throw new Error('Division by zero');
    this.registers[reg] = Math.floor(this.registers[reg] / val);
  }

  jmp(addr) {
    this.pc = addr;
  }

  jz(addr) {
    if (this.flags.zero) this.pc = addr;
  }

  push(reg) {
    this.memory[this.sp--] = this.registers[reg];
  }

  pop(reg) {
    this.registers[reg] = this.memory[++this.sp];
  }

  call(addr) {
    this.push(this.pc & 0xFF);
    this.pc = addr;
  }

  ret() {
    this.pop(0);
    this.pc = this.registers[0];
  }

  // Run program
  run() {
    this.running = true;
    let steps = 0;
    while (this.running && steps++ < 10000) {
      this.step();
    }
  }

  // Debug
  dump() {
    console.log('Registers:', Array.from(this.registers.slice(0, 4)));
    console.log('PC:', this.pc, 'SP:', this.sp);
    console.log('Flags:', this.flags);
  }
}

// Demo: Calculate 5 + 3
const vm = new VirtualMachine();
const program = [
  0x10, 0x05,  // LOAD R0, 5
  0x20, 0x03,  // ADD R0, 3
  0x00         // HALT
];

vm.load(program);
vm.run();
vm.dump();

export default VirtualMachine;
