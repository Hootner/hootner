// Assembler - Layer 1.2
// Uses: Binary ALU (Layer 0.3)

class Assembler {
  constructor() {
    this.opcodes = {
      'NOP': 0x00, 'LOAD': 0x10, 'ADD': 0x20, 'SUB': 0x30,
      'AND': 0x40, 'OR': 0x50, 'XOR': 0x60, 'JMP': 0x70,
      'JZ': 0x80, 'PUSH': 0x90, 'POP': 0xA0, 'HALT': 0xF0
    };
    this.labels = new Map();
  }

  // Parse line
  parseLine(line) {
    line = line.trim().split(';')[0];  // Remove comments
    if (!line) return null;

    // Label
    if (line.endsWith(':')) {
      return { type: 'label', name: line.slice(0, -1) };
    }

    // Instruction
    const parts = line.split(/[\s,]+/);
    const op = parts[0].toUpperCase();
    const args = parts.slice(1);

    return { type: 'instruction', op, args };
  }

  // First pass: collect labels
  firstPass(source) {
    let addr = 0;
    source.split('\n').forEach(line => {
      const parsed = this.parseLine(line);
      if (!parsed) return;

      if (parsed.type === 'label') {
        this.labels.set(parsed.name, addr);
      } else {
        addr += 1 + parsed.args.length;
      }
    });
  }

  // Second pass: generate code
  secondPass(source) {
    const code = [];
    
    source.split('\n').forEach(line => {
      const parsed = this.parseLine(line);
      if (!parsed || parsed.type === 'label') return;

      const opcode = this.opcodes[parsed.op];
      if (opcode === undefined) {
        console.error('Unknown instruction:', parsed.op);
        return;
      }

      // Encode instruction
      if (parsed.args.length === 0) {
        code.push(opcode);
      } else if (parsed.args.length === 1) {
        const arg = parsed.args[0];
        const reg = arg.startsWith('R') ? parseInt(arg.slice(1)) : 0;
        code.push(opcode | reg);
      } else if (parsed.args.length === 2) {
        const reg = parseInt(parsed.args[0].slice(1));
        let val = parsed.args[1];
        
        // Resolve label
        if (this.labels.has(val)) {
          val = this.labels.get(val);
        } else {
          val = parseInt(val);
        }
        
        code.push(opcode | reg, val);
      }
    });

    return new Uint8Array(code);
  }

  // Assemble
  assemble(source) {
    this.firstPass(source);
    return this.secondPass(source);
  }
}

// Demo
const asm = new Assembler();
const program = `
  LOAD R0, 10    ; Load 10 into R0
  LOAD R1, 5     ; Load 5 into R1
  ADD R0, R1     ; R0 = R0 + R1
  HALT           ; Stop
`;

const binary = asm.assemble(program);
console.log('Assembled:', Array.from(binary).map(b => '0x' + b.toString(16).padStart(2, '0')));

export default Assembler;
