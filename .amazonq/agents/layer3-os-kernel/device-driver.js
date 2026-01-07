// Device Driver - Layer 3.7
// Hardware abstraction layer

class DeviceDriver {
  constructor(name, type) {
    this.name = name;
    this.type = type;
    this.initialized = false;
  }

  init() {
    console.log(`[DRIVER] Initializing ${this.name}...`);
    this.initialized = true;
    return true;
  }

  read(offset, size) {
    throw new Error('read() not implemented');
  }

  write(offset, data) {
    throw new Error('write() not implemented');
  }

  ioctl(cmd, arg) {
    throw new Error('ioctl() not implemented');
  }
}

// Disk driver
class DiskDriver extends DeviceDriver {
  constructor() {
    super('disk0', 'block');
    this.sectors = 1024;
    this.sectorSize = 512;
    this.data = new Uint8Array(this.sectors * this.sectorSize);
  }

  read(sector, count) {
    const offset = sector * this.sectorSize;
    const size = count * this.sectorSize;
    return this.data.slice(offset, offset + size);
  }

  write(sector, data) {
    const offset = sector * this.sectorSize;
    this.data.set(data, offset);
    return data.length;
  }

  ioctl(cmd, arg) {
    if (cmd === 'GET_SIZE') return this.sectors;
    if (cmd === 'GET_SECTOR_SIZE') return this.sectorSize;
    return -1;
  }
}

// Network driver
class NetworkDriver extends DeviceDriver {
  constructor() {
    super('eth0', 'network');
    this.mac = '00:11:22:33:44:55';
    this.ip = '192.168.1.100';
    this.rxQueue = [];
    this.txQueue = [];
  }

  send(packet) {
    this.txQueue.push(packet);
    console.log(`[NET] Sent packet: ${packet.length} bytes`);
    return packet.length;
  }

  receive() {
    if (this.rxQueue.length === 0) return null;
    return this.rxQueue.shift();
  }

  ioctl(cmd, arg) {
    if (cmd === 'GET_MAC') return this.mac;
    if (cmd === 'GET_IP') return this.ip;
    if (cmd === 'SET_IP') { this.ip = arg; return 0; }
    return -1;
  }
}

// Keyboard driver
class KeyboardDriver extends DeviceDriver {
  constructor() {
    super('kbd0', 'char');
    this.buffer = [];
  }

  read() {
    if (this.buffer.length === 0) return null;
    return this.buffer.shift();
  }

  // Simulate key press
  keyPress(key) {
    this.buffer.push(key);
    console.log(`[KBD] Key pressed: ${key}`);
  }

  ioctl(cmd, arg) {
    if (cmd === 'FLUSH') { this.buffer = []; return 0; }
    return -1;
  }
}

// Device manager
class DeviceManager {
  constructor() {
    this.devices = new Map();
  }

  register(driver) {
    if (!driver.init()) {
      console.log(`[DEV] Failed to initialize ${driver.name}`);
      return false;
    }
    
    this.devices.set(driver.name, driver);
    console.log(`[DEV] Registered ${driver.name} (${driver.type})`);
    return true;
  }

  unregister(name) {
    this.devices.delete(name);
    console.log(`[DEV] Unregistered ${name}`);
  }

  get(name) {
    return this.devices.get(name);
  }

  list() {
    return Array.from(this.devices.values()).map(d => ({
      name: d.name,
      type: d.type,
      initialized: d.initialized
    }));
  }
}

// Demo
const devMgr = new DeviceManager();

const disk = new DiskDriver();
const net = new NetworkDriver();
const kbd = new KeyboardDriver();

devMgr.register(disk);
devMgr.register(net);
devMgr.register(kbd);

console.log('\nDevices:', devMgr.list());

// Test disk
console.log('\n--- Disk Test ---');
const data = new Uint8Array([1, 2, 3, 4, 5]);
disk.write(0, data);
const read = disk.read(0, 1);
console.log('Read:', Array.from(read.slice(0, 5)));

// Test network
console.log('\n--- Network Test ---');
net.send(new Uint8Array([0xFF, 0xFF, 0xFF]));
console.log('MAC:', net.ioctl('GET_MAC'));

// Test keyboard
console.log('\n--- Keyboard Test ---');
kbd.keyPress('H');
kbd.keyPress('i');
console.log('Read:', kbd.read());

export { DeviceDriver, DiskDriver, NetworkDriver, KeyboardDriver, DeviceManager };
