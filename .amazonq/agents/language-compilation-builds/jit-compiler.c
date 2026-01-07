#include <stdio.h>
#include <sys/mman.h>
#include <string.h>

typedef long (*fn)(long);

fn compile_identity(void) {
    char *memory = mmap(NULL, 4096, PROT_READ | PROT_WRITE | PROT_EXEC, 
                        MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    int i = 0;
    memory[i++] = 0x48;  // mov %rdi, %rax
    memory[i++] = 0x89;
    memory[i++] = 0xf8;
    memory[i++] = 0xc3;  // ret
    return (fn)memory;
}

fn compile_increment(void) {
    char *memory = mmap(NULL, 4096, PROT_READ | PROT_WRITE | PROT_EXEC,
                        MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    int i = 0;
    memory[i++] = 0x48;  // mov %rdi, %rax
    memory[i++] = 0x89;
    memory[i++] = 0xf8;
    memory[i++] = 0x48;  // inc %rax
    memory[i++] = 0xff;
    memory[i++] = 0xc0;
    memory[i++] = 0xc3;  // ret
    return (fn)memory;
}

int main() {
    fn f1 = compile_identity();
    printf("identity(42) = %ld\n", f1(42));
    munmap((void*)f1, 4096);
    
    fn f2 = compile_increment();
    printf("increment(42) = %ld\n", f2(42));
    munmap((void*)f2, 4096);
    
    return 0;
}
