#include <stdio.h>
#include <stdint.h>

#define STACK_SIZE 256
#define MEM_SIZE 4096

typedef enum { PUSH, ADD, SUB, PRINT, HALT } Opcode;

typedef struct {
    int32_t stack[STACK_SIZE];
    int sp;
    uint8_t memory[MEM_SIZE];
    int pc;
} VM;

void vm_init(VM* vm) {
    vm->sp = -1;
    vm->pc = 0;
}

void vm_push(VM* vm, int32_t val) {
    vm->stack[++vm->sp] = val;
}

int32_t vm_pop(VM* vm) {
    return vm->stack[vm->sp--];
}

void vm_run(VM* vm, uint8_t* code, int len) {
    while (vm->pc < len) {
        uint8_t op = code[vm->pc++];
        switch (op) {
            case PUSH:
                vm_push(vm, code[vm->pc++]);
                break;
            case ADD:
                vm_push(vm, vm_pop(vm) + vm_pop(vm));
                break;
            case SUB: {
                int32_t b = vm_pop(vm);
                vm_push(vm, vm_pop(vm) - b);
                break;
            }
            case PRINT:
                printf("%d\n", vm_pop(vm));
                break;
            case HALT:
                return;
        }
    }
}

int main() {
    VM vm;
    vm_init(&vm);
    
    uint8_t code[] = { PUSH, 10, PUSH, 5, ADD, PRINT, HALT };
    vm_run(&vm, code, sizeof(code));
    
    return 0;
}
