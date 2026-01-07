// Memory Manager - Layer 3.4
// Uses: Binary ALU (0.3), Data structures

class MemoryManager {
  constructor(size) {
    this.size = size;
    this.memory = new Uint8Array(size);
    this.freeList = [{ start: 0, size: size }];
    this.allocated = new Map();
  }

  // Allocate memory
  malloc(size) {
    // First-fit algorithm
    for (let i = 0; i < this.freeList.length; i++) {
      const block = this.freeList[i];
      
      if (block.size >= size) {
        const addr = block.start;
        
        // Split block
        if (block.size > size) {
          block.start += size;
          block.size -= size;
        } else {
          this.freeList.splice(i, 1);
        }
        
        this.allocated.set(addr, size);
        console.log(`[MEM] Allocated ${size} bytes at 0x${addr.toString(16)}`);
        return addr;
      }
    }
    
    console.log('[MEM] Out of memory');
    return null;
  }

  // Free memory
  free(addr) {
    const size = this.allocated.get(addr);
    if (!size) {
      console.log(`[MEM] Invalid free at 0x${addr.toString(16)}`);
      return false;
    }
    
    this.allocated.delete(addr);
    
    // Add to free list
    this.freeList.push({ start: addr, size });
    this.freeList.sort((a, b) => a.start - b.start);
    
    // Coalesce adjacent blocks
    this.coalesce();
    
    console.log(`[MEM] Freed ${size} bytes at 0x${addr.toString(16)}`);
    return true;
  }

  // Coalesce adjacent free blocks
  coalesce() {
    for (let i = 0; i < this.freeList.length - 1; i++) {
      const curr = this.freeList[i];
      const next = this.freeList[i + 1];
      
      if (curr.start + curr.size === next.start) {
        curr.size += next.size;
        this.freeList.splice(i + 1, 1);
        i--;
      }
    }
  }

  // Read from memory
  read(addr, size) {
    if (addr + size > this.size) return null;
    return this.memory.slice(addr, addr + size);
  }

  // Write to memory
  write(addr, data) {
    if (addr + data.length > this.size) return false;
    this.memory.set(data, addr);
    return true;
  }

  // Virtual memory: page table
  createPageTable(pages) {
    const pageSize = 4096;
    const table = new Map();
    
    for (let i = 0; i < pages; i++) {
      const virt = i * pageSize;
      const phys = this.malloc(pageSize);
      if (phys !== null) {
        table.set(virt, phys);
      }
    }
    
    return table;
  }

  // Translate virtual to physical address
  translate(pageTable, virtAddr) {
    const pageSize = 4096;
    const pageNum = Math.floor(virtAddr / pageSize);
    const offset = virtAddr % pageSize;
    const pageStart = pageNum * pageSize;
    
    const physPage = pageTable.get(pageStart);
    if (physPage === undefined) return null;
    
    return physPage + offset;
  }

  // Memory statistics
  stats() {
    const used = Array.from(this.allocated.values()).reduce((a, b) => a + b, 0);
    const free = this.freeList.reduce((a, b) => a + b.size, 0);
    
    return {
      total: this.size,
      used,
      free,
      utilization: ((used / this.size) * 100).toFixed(1) + '%',
      blocks: this.allocated.size,
      freeBlocks: this.freeList.length
    };
  }
}

// Demo
const mem = new MemoryManager(1024);

console.log('Initial:', mem.stats());

const p1 = mem.malloc(100);
const p2 = mem.malloc(200);
const p3 = mem.malloc(50);

console.log('\nAfter allocation:', mem.stats());

mem.free(p2);
console.log('\nAfter free:', mem.stats());

const p4 = mem.malloc(150);
console.log('\nAfter realloc:', mem.stats());

// Virtual memory demo
console.log('\n--- Virtual Memory ---');
const pageTable = mem.createPageTable(3);
const virt = 8192; // Virtual address
const phys = mem.translate(pageTable, virt);
console.log(`Virtual 0x${virt.toString(16)} → Physical 0x${phys?.toString(16)}`);

export default MemoryManager;
