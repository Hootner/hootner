#!/usr/bin/env python3

class VirtualCPU:
    def __init__(self):
        self.registers = [0] * 8
        self.pc = 0
        self.running = False
    
    def reset(self):
        self.registers = [0] * 8
        self.pc = 0

class VirtualMemory:
    def __init__(self, size=1024):
        self.memory = bytearray(size)
    
    def read(self, addr):
        return self.memory[addr]
    
    def write(self, addr, value):
        self.memory[addr] = value

class VirtualMachine:
    def __init__(self, vm_id, memory_size=1024):
        self.vm_id = vm_id
        self.cpu = VirtualCPU()
        self.memory = VirtualMemory(memory_size)
        self.state = 'stopped'
    
    def start(self):
        self.state = 'running'
        self.cpu.running = True
        print(f"✓ VM {self.vm_id} started")
    
    def stop(self):
        self.state = 'stopped'
        self.cpu.running = False
        print(f"✓ VM {self.vm_id} stopped")
    
    def pause(self):
        self.state = 'paused'
        print(f"✓ VM {self.vm_id} paused")
    
    def resume(self):
        self.state = 'running'
        print(f"✓ VM {self.vm_id} resumed")

class Hypervisor:
    def __init__(self):
        self.vms = {}
        self.vm_counter = 1
    
    def create_vm(self, memory_size=1024):
        vm_id = f"vm-{self.vm_counter}"
        self.vm_counter += 1
        
        vm = VirtualMachine(vm_id, memory_size)
        self.vms[vm_id] = vm
        
        print(f"✓ Created {vm_id} with {memory_size} bytes memory")
        return vm_id
    
    def start_vm(self, vm_id):
        if vm_id in self.vms:
            self.vms[vm_id].start()
    
    def stop_vm(self, vm_id):
        if vm_id in self.vms:
            self.vms[vm_id].stop()
    
    def list_vms(self):
        print("\n🖥️  Virtual Machines:")
        for vm_id, vm in self.vms.items():
            print(f"  {vm_id}: {vm.state}")
    
    def get_vm_stats(self, vm_id):
        if vm_id not in self.vms:
            return None
        
        vm = self.vms[vm_id]
        return {
            'id': vm_id,
            'state': vm.state,
            'memory': len(vm.memory.memory),
            'cpu_registers': len(vm.cpu.registers)
        }

# Test
hypervisor = Hypervisor()

vm1 = hypervisor.create_vm(2048)
vm2 = hypervisor.create_vm(1024)

hypervisor.start_vm(vm1)
hypervisor.start_vm(vm2)

hypervisor.list_vms()

print(f"\nVM1 stats: {hypervisor.get_vm_stats(vm1)}")

hypervisor.stop_vm(vm1)
hypervisor.list_vms()
