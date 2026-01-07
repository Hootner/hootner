#include <stdio.h>
#include <stdint.h>
#include <string.h>

#define HEAP_SIZE 1024
#define BLOCK_SIZE 32

typedef struct Block {
    uint8_t used;
    size_t size;
    struct Block* next;
} Block;

uint8_t heap[HEAP_SIZE];
Block* free_list = NULL;

void mem_init() {
    free_list = (Block*)heap;
    free_list->used = 0;
    free_list->size = HEAP_SIZE - sizeof(Block);
    free_list->next = NULL;
}

void* mem_alloc(size_t size) {
    Block* current = free_list;
    
    while (current) {
        if (!current->used && current->size >= size) {
            current->used = 1;
            return (void*)((uint8_t*)current + sizeof(Block));
        }
        current = current->next;
    }
    return NULL;
}

void mem_free(void* ptr) {
    if (!ptr) return;
    Block* block = (Block*)((uint8_t*)ptr - sizeof(Block));
    block->used = 0;
}

int main() {
    mem_init();
    
    void* p1 = mem_alloc(64);
    printf("Allocated 64 bytes at %p\n", p1);
    
    void* p2 = mem_alloc(128);
    printf("Allocated 128 bytes at %p\n", p2);
    
    mem_free(p1);
    printf("Freed first allocation\n");
    
    return 0;
}
