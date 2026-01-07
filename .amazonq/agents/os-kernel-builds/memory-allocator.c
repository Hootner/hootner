// Minimal Memory Allocator
#include <stdio.h>
#include <stddef.h>

#define HEAP_SIZE 4096

static char heap[HEAP_SIZE];
static size_t offset = 0;

void* alloc(size_t size) {
  if (offset + size > HEAP_SIZE) return NULL;
  void* ptr = &heap[offset];
  offset += size;
  return ptr;
}

void reset() {
  offset = 0;
}

int main() {
  printf("Allocator: %d bytes\n", HEAP_SIZE);
  int* a = alloc(sizeof(int) * 10);
  printf("Allocated at %p\n", (void*)a);
  printf("Used: %zu bytes\n", offset);
  return 0;
}
