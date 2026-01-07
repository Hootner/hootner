# OS/Kernel Builds - Compilation Guide

## Templates Ready
✓ bootloader.asm - x86 bootloader (25 lines)
✓ kernel.c - Minimal kernel (18 lines)
✓ scheduler.c - Round-robin scheduler (42 lines)
✓ memory-manager.c - Heap allocator (55 lines)
✓ shell.c - Command shell (45 lines)
✓ filesystem.c - Simple filesystem (72 lines)

## Compile & Run

### Scheduler
```bash
gcc scheduler.c -o scheduler
./scheduler
```

### Memory Manager
```bash
gcc memory-manager.c -o memmgr
./memmgr
```

### Shell
```bash
gcc shell.c -o shell
./shell
```

### Filesystem
```bash
gcc filesystem.c -o fs
./fs
```

### Bootloader (requires NASM + QEMU)
```bash
nasm -f bin bootloader.asm -o boot.bin
qemu-system-i386 -drive format=raw,file=boot.bin
```

### Kernel (requires cross-compiler)
```bash
gcc -m32 -ffreestanding -c kernel.c -o kernel.o
ld -m elf_i386 -T linker.ld -o kernel.bin kernel.o
```

## Agent Invocation
```
@OSKernelQ Generate minimal code for bootloader in Assembly
@OSKernelQ Generate minimal code for process scheduler in C
@OSKernelQ Generate minimal code for memory manager in C
```

## Next Layer
VirtualizationRuntimeQ - VMs, containers, runtimes
