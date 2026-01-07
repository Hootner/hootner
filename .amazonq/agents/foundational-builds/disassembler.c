#include <stdio.h>
#include <stdint.h>

const char* opcodes[] = {
    "NOP", "LD", "INC", "DEC", "ADD", "SUB", "AND", "OR",
    "XOR", "CMP", "JMP", "JZ", "JNZ", "CALL", "RET", "HALT"
};

void disassemble(uint8_t* code, size_t len) {
    size_t pc = 0;
    while (pc < len) {
        uint8_t op = code[pc++];
        printf("0x%04zx: %s", pc - 1, opcodes[op & 0x0F]);
        
        if (op >= 0x10 && pc < len) {
            printf(" 0x%02x", code[pc++]);
        }
        printf("\n");
    }
}

int main(int argc, char** argv) {
    FILE* f = fopen(argv[1], "rb");
    uint8_t code[1024];
    size_t len = fread(code, 1, sizeof(code), f);
    fclose(f);
    
    disassemble(code, len);
    return 0;
}
