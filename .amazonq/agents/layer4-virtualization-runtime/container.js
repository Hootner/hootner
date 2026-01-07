// Container - Layer 4.3
// Uses: OS primitives (Layer 3)

class Container {
  constructor(id, image) {
    this.id = id;
    this.image = image;
    this.state = 'created';
    this.pid = null;
    this.namespaces = {
      pid: true,
      net: true,
      mnt: true,
      uts: true
    };
    this.cgroups = {
      cpu: 100,
      memory: 512 * 1024 * 1024,
      io: 1000
    };
    this.rootfs = `/var/lib/containers/${id}`;
    this.env = new Map();
    this.volumes = [];
  }

  // Start container
  start() {
    if (this.state !== 'created' && this.state !== 'stopped') {
      console.log(`[CONTAINER] Cannot start ${this.id} in state ${this.state}`);
      return false;
    }

    console.log(`[CONTAINER] Starting ${this.id}...`);
    
    // Create namespaces
    this.createNamespaces();
    
    // Setup cgroups
    this.setupCgroups();
    
    // Mount filesystem
    this.mountRootfs();
    
    // Start process
    this.pid = this.spawn();
    
    this.state = 'running';
    console.log(`[CONTAINER] ${this.id} started (PID: ${this.pid})`);
    return true;
  }

  // Stop container
  stop() {
    if (this.state !== 'running') return false;
    
    console.log(`[CONTAINER] Stopping ${this.id}...`);
    
    // Kill process
    if (this.pid) {
      console.log(`[CONTAINER] Killing PID ${this.pid}`);
      this.pid = null;
    }
    
    // Cleanup namespaces
    this.cleanupNamespaces();
    
    this.state = 'stopped';
    console.log(`[CONTAINER] ${this.id} stopped`);
    return true;
  }

  // Pause container
  pause() {
    if (this.state !== 'running') return false;
    this.state = 'paused';
    console.log(`[CONTAINER] ${this.id} paused`);
    return true;
  }

  // Resume container
  resume() {
    if (this.state !== 'paused') return false;
    this.state = 'running';
    console.log(`[CONTAINER] ${this.id} resumed`);
    return true;
  }

  // Create namespaces
  createNamespaces() {
    console.log(`[CONTAINER] Creating namespaces for ${this.id}`);
    Object.keys(this.namespaces).forEach(ns => {
      if (this.namespaces[ns]) {
        console.log(`  - ${ns} namespace`);
      }
    });
  }

  cleanupNamespaces() {
    console.log(`[CONTAINER] Cleaning up namespaces for ${this.id}`);
  }

  // Setup cgroups
  setupCgroups() {
    console.log(`[CONTAINER] Setting up cgroups for ${this.id}`);
    console.log(`  - CPU: ${this.cgroups.cpu}%`);
    console.log(`  - Memory: ${this.cgroups.memory / 1024 / 1024}MB`);
    console.log(`  - I/O: ${this.cgroups.io} IOPS`);
  }

  // Mount rootfs
  mountRootfs() {
    console.log(`[CONTAINER] Mounting rootfs at ${this.rootfs}`);
    this.volumes.forEach(vol => {
      console.log(`  - Volume: ${vol.host} -> ${vol.container}`);
    });
  }

  // Spawn process
  spawn() {
    return Math.floor(Math.random() * 10000);
  }

  // Set resource limits
  setLimits(cpu, memory) {
    this.cgroups.cpu = cpu;
    this.cgroups.memory = memory;
    console.log(`[CONTAINER] Updated limits for ${this.id}`);
  }

  // Add volume
  addVolume(hostPath, containerPath) {
    this.volumes.push({ host: hostPath, container: containerPath });
  }

  // Set environment variable
  setEnv(key, value) {
    this.env.set(key, value);
  }

  // Execute command in container
  exec(cmd) {
    if (this.state !== 'running') {
      console.log(`[CONTAINER] Cannot exec in ${this.state} container`);
      return;
    }
    console.log(`[CONTAINER] Executing in ${this.id}: ${cmd}`);
  }

  // Get stats
  stats() {
    return {
      id: this.id,
      state: this.state,
      pid: this.pid,
      cpu: this.cgroups.cpu,
      memory: this.cgroups.memory,
      image: this.image
    };
  }
}

// Demo
const container = new Container('web-app-1', 'nginx:latest');

container.setLimits(50, 256 * 1024 * 1024);
container.addVolume('/host/data', '/container/data');
container.setEnv('PORT', '8080');

container.start();
container.exec('nginx -g "daemon off;"');

console.log('\nContainer stats:', container.stats());

container.pause();
container.resume();
container.stop();

export default Container;
