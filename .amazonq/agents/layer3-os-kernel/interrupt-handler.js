// Interrupt Handler - Layer 3.8
// Uses: FSM (0.4)

class InterruptHandler {
  constructor() {
    this.idt = new Array(256).fill(null); // Interrupt Descriptor Table
    this.enabled = true;
    this.pending = [];
  }

  // Register interrupt handler
  register(vector, handler) {
    if (vector < 0 || vector > 255) return false;
    this.idt[vector] = handler;
    console.log(`[INT] Registered handler for vector ${vector}`);
    return true;
  }

  // Trigger interrupt
  trigger(vector, data = null) {
    if (!this.enabled) {
      this.pending.push({ vector, data });
      return;
    }

    const handler = this.idt[vector];
    if (!handler) {
      console.log(`[INT] No handler for vector ${vector}`);
      return;
    }

    console.log(`[INT] Handling interrupt ${vector}`);
    handler(data);
  }

  // Enable/disable interrupts
  enable() {
    this.enabled = true;
    this.processPending();
  }

  disable() {
    this.enabled = false;
  }

  // Process pending interrupts
  processPending() {
    while (this.pending.length > 0) {
      const { vector, data } = this.pending.shift();
      this.trigger(vector, data);
    }
  }
}

// Common interrupt vectors
const IRQ = {
  TIMER: 0,
  KEYBOARD: 1,
  DISK: 14,
  NETWORK: 15,
  SYSCALL: 0x80,
  PAGE_FAULT: 14
};

// Interrupt Controller
class InterruptController {
  constructor() {
    this.handler = new InterruptHandler();
    this.setupHandlers();
  }

  setupHandlers() {
    // Timer interrupt
    this.handler.register(IRQ.TIMER, () => {
      console.log('[IRQ] Timer tick');
    });

    // Keyboard interrupt
    this.handler.register(IRQ.KEYBOARD, (key) => {
      console.log(`[IRQ] Keyboard: ${key}`);
    });

    // Disk interrupt
    this.handler.register(IRQ.DISK, (status) => {
      console.log(`[IRQ] Disk operation complete: ${status}`);
    });

    // Network interrupt
    this.handler.register(IRQ.NETWORK, (packet) => {
      console.log(`[IRQ] Network packet received`);
    });

    // System call
    this.handler.register(IRQ.SYSCALL, (syscall) => {
      console.log(`[IRQ] System call: ${syscall}`);
    });

    // Page fault
    this.handler.register(IRQ.PAGE_FAULT, (addr) => {
      console.log(`[IRQ] Page fault at 0x${addr?.toString(16)}`);
    });
  }

  // Simulate hardware interrupts
  simulate() {
    console.log('\n--- Interrupt Simulation ---\n');

    // Timer ticks
    this.handler.trigger(IRQ.TIMER);
    
    // Keyboard input
    this.handler.trigger(IRQ.KEYBOARD, 'A');
    
    // Disable interrupts
    console.log('\n[INT] Disabling interrupts...');
    this.handler.disable();
    
    // These will be queued
    this.handler.trigger(IRQ.DISK, 'success');
    this.handler.trigger(IRQ.NETWORK);
    
    // Re-enable
    console.log('\n[INT] Enabling interrupts...');
    this.handler.enable();
    
    // System call
    this.handler.trigger(IRQ.SYSCALL, 'write');
  }
}

// Demo
const ic = new InterruptController();
ic.simulate();

export { InterruptHandler, InterruptController, IRQ };
