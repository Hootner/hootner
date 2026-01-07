#!/usr/bin/env python3
import sys

opcodes = {
    'NOP': 0x00, 'HALT': 0x76,
    'LD': 0x06, 'ADD': 0x80, 'SUB': 0x90,
    'JMP': 0xC3, 'CALL': 0xCD, 'RET': 0xC9
}

def assemble(line):
    parts = line.strip().split()
    if not parts or parts[0].startswith(';'):
        return []
    
    mnemonic = parts[0].upper()
    if mnemonic not in opcodes:
        return []
    
    code = [opcodes[mnemonic]]
    if len(parts) > 1:
        code.append(int(parts[1], 16))
    return code

def main(input_file, output_file):
    binary = []
    with open(input_file) as f:
        for line in f:
            binary.extend(assemble(line))
    
    with open(output_file, 'wb') as f:
        f.write(bytes(binary))
    print(f"Assembled {len(binary)} bytes")

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
