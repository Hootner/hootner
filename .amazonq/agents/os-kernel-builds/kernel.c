#include <stdint.h>

#define VGA_MEMORY 0xB8000
#define VGA_WIDTH 80

void kernel_main(void) {
    uint16_t* vga = (uint16_t*)VGA_MEMORY;
    const char* msg = "Hello Kernel!";
    
    for (int i = 0; msg[i] != '\0'; i++) {
        vga[i] = (uint16_t)msg[i] | 0x0F00;
    }
    
    while(1) {
        asm("hlt");
    }
}
