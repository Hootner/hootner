// Hypervisor - Layer 4.2
// Manages multiple VMs

import VirtualMachine from './virtual-machine.js';

class Hypervisor {
  constructor() {
    this.vms = new Map();
    this.nextVMID = 0;
    this.scheduler = [];
    this.currentVM = null;
  }

  // Create VM
  createVM(memory = 4096) {
    const vmid = this.nextVMID++;
    const vm = new VirtualMachine(memory);
    
    this.vms.set(vmid, {
      vm,
      state: 'stopped',
      cpu: 0,
      memory: memory
    });
    
    console.log(`[HV] Created VM ${vmid} (${memory} bytes)`);
    return vmid;
  }

  // Start VM
  startVM(vmid) {
    const entry = this.vms.get(vmid);
    if (!entry) return false;
    
    entry.state = 'running';
    entry.vm.running = true;
    this.scheduler.push(vmid);
    
    console.log(`[HV] Started VM ${vmid}`);
    return true;
  }

  // Stop VM
  stopVM(vmid) {
    const entry = this.vms.get(vmid);
    if (!entry) return false;
    
    entry.state = 'stopped';
    entry.vm.running = false;
    this.scheduler = this.scheduler.filter(id => id !== vmid);
    
    console.log(`[HV] Stopped VM ${vmid}`);
    return true;
  }

  // Pause VM
  pauseVM(vmid) {
    const entry = this.vms.get(vmid);
    if (!entry) return false;
    
    entry.state = 'paused';
    console.log(`[HV] Paused VM ${vmid}`);
    return true;
  }

  // Resume VM
  resumeVM(vmid) {
    const entry = this.vms.get(vmid);
    if (!entry || entry.state !== 'paused') return false;
    
    entry.state = 'running';
    console.log(`[HV] Resumed VM ${vmid}`);
    return true;
  }

  // Delete VM
  deleteVM(vmid) {
    this.stopVM(vmid);
    this.vms.delete(vmid);
    console.log(`[HV] Deleted VM ${vmid}`);
  }

  // Schedule VMs (round-robin)
  schedule() {
    if (this.scheduler.length === 0) return null;
    
    const vmid = this.scheduler.shift();
    this.scheduler.push(vmid);
    
    const entry = this.vms.get(vmid);
    if (entry && entry.state === 'running') {
      this.currentVM = vmid;
      return entry.vm;
    }
    
    return this.schedule();
  }

  // Run all VMs
  run(cycles = 100) {
    console.log(`[HV] Running ${this.scheduler.length} VMs for ${cycles} cycles`);
    
    for (let i = 0; i < cycles; i++) {
      const vm = this.schedule();
      if (!vm) break;
      
      vm.step();
      
      if (!vm.running) {
        this.stopVM(this.currentVM);
      }
    }
  }

  // Resource allocation
  allocateCPU(vmid, percent) {
    const entry = this.vms.get(vmid);
    if (entry) {
      entry.cpu = percent;
      console.log(`[HV] VM ${vmid} CPU: ${percent}%`);
    }
  }

  // Statistics
  stats() {
    const stats = [];
    this.vms.forEach((entry, vmid) => {
      stats.push({
        vmid,
        state: entry.state,
        memory: entry.memory,
        cpu: entry.cpu,
        pc: entry.vm.pc
      });
    });
    return stats;
  }

  // List VMs
  list() {
    console.log('\nVirtual Machines:');
    this.vms.forEach((entry, vmid) => {
      console.log(`  VM ${vmid}: ${entry.state} (${entry.memory} bytes, ${entry.cpu}% CPU)`);
    });
  }
}

// Demo
const hv = new Hypervisor();

// Create VMs
const vm1 = hv.createVM(2048);
const vm2 = hv.createVM(4096);

// Load programs
const prog1 = [0x10, 0x05, 0x20, 0x03, 0x00]; // 5 + 3
const prog2 = [0x10, 0x0A, 0x30, 0x02, 0x00]; // 10 - 2

hv.vms.get(vm1).vm.load(prog1);
hv.vms.get(vm2).vm.load(prog2);

// Start VMs
hv.startVM(vm1);
hv.startVM(vm2);

// Allocate resources
hv.allocateCPU(vm1, 50);
hv.allocateCPU(vm2, 50);

// Run
hv.run(20);

// Stats
hv.list();
console.log('\nStats:', hv.stats());

export default Hypervisor;
