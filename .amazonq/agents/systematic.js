#!/usr/bin/env node
// Systematic Build Orchestrator - Bottom-up progression

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SYSTEMATIC_ORDER = [
  // Layer 1: Foundational (Build hardware simulation first)
  { layer: 1, order: 1, file: 'foundational-builds/cpu-emulator.cpp', compile: 'g++ cpu-emulator.cpp -o cpu-emulator', run: './cpu-emulator' },
  { layer: 1, order: 2, file: 'foundational-builds/assembler.py', run: 'python assembler.py' },
  { layer: 1, order: 3, file: 'foundational-builds/disassembler.c', compile: 'gcc disassembler.c -o disassembler', run: './disassembler' },
  { layer: 1, order: 4, file: 'foundational-builds/linker.rs', compile: 'rustc linker.rs', run: './linker' },
  { layer: 1, order: 5, file: 'foundational-builds/debugger.rs', compile: 'cargo build', run: 'cargo run' },
  
  // Layer 2: Language & Compilation (Build language tools)
  { layer: 2, order: 1, file: 'language-compilation-builds/regex-engine.js', run: 'node regex-engine.js' },
  { layer: 2, order: 2, file: 'language-compilation-builds/language.py', run: 'python language.py' },
  { layer: 2, order: 3, file: 'language-compilation-builds/compiler.js', run: 'node compiler.js' },
  { layer: 2, order: 4, file: 'language-compilation-builds/compiler-optimizer.js', run: 'node compiler-optimizer.js' },
  { layer: 2, order: 5, file: 'language-compilation-builds/garbage-collector.c', compile: 'gcc garbage-collector.c -o gc', run: './gc' },
  { layer: 2, order: 6, file: 'language-compilation-builds/jit-compiler.c', compile: 'gcc jit-compiler.c -o jit', run: './jit' },
  
  // Layer 3: OS & Kernel (Build system management)
  { layer: 3, order: 1, file: 'os-kernel-builds/memory-allocator.c', compile: 'gcc memory-allocator.c -o allocator', run: './allocator' },
  { layer: 3, order: 2, file: 'os-kernel-builds/scheduler.c', compile: 'gcc scheduler.c -o scheduler', run: './scheduler' },
  { layer: 3, order: 3, file: 'os-kernel-builds/memory-manager.c', compile: 'gcc memory-manager.c -o memmgr', run: './memmgr' },
  { layer: 3, order: 4, file: 'os-kernel-builds/filesystem.c', compile: 'gcc filesystem.c -o fs', run: './fs' },
  { layer: 3, order: 5, file: 'os-kernel-builds/shell.c', compile: 'gcc shell.c -o shell', run: './shell' },
  { layer: 3, order: 6, file: 'os-kernel-builds/microkernel.c', compile: 'gcc microkernel.c -o microkernel', run: './microkernel' },
  { layer: 3, order: 7, file: 'os-kernel-builds/embedded-os.c', compile: 'gcc embedded-os.c -o embedded', run: './embedded' },
  { layer: 3, order: 8, file: 'os-kernel-builds/operating-system.js', run: 'node operating-system.js' },
  
  // Layer 4: Virtualization (Build isolated environments)
  { layer: 4, order: 1, file: 'virtualization-runtime-builds/sandbox.js', run: 'node sandbox.js' },
  { layer: 4, order: 2, file: 'virtualization-runtime-builds/bytecode-vm.py', run: 'python bytecode-vm.py' },
  { layer: 4, order: 3, file: 'virtualization-runtime-builds/runtime.js', run: 'node runtime.js' },
  { layer: 4, order: 4, file: 'virtualization-runtime-builds/container-orchestrator.js', run: 'node container-orchestrator.js' },
  
  // Layer 5: Networking (Build communication)
  { layer: 5, order: 1, file: 'networking-communication-builds/network-protocol.js', run: 'node network-protocol.js' },
  { layer: 5, order: 2, file: 'networking-communication-builds/tcp-ip-stack.js', run: 'node tcp-ip-stack.js' },
  { layer: 5, order: 3, file: 'networking-communication-builds/tcp-server.py', run: 'python tcp-server.py' },
  { layer: 5, order: 4, file: 'networking-communication-builds/http-server.js', run: 'node http-server.js' },
  { layer: 5, order: 5, file: 'networking-communication-builds/pubsub.js', run: 'node pubsub.js' },
  { layer: 5, order: 6, file: 'networking-communication-builds/iot-protocol.js', run: 'node iot-protocol.js' },
  
  // Layer 6: Data Storage (Build persistence)
  { layer: 6, order: 1, file: 'data-storage-builds/hash-table.js', run: 'node hash-table.js' },
  { layer: 6, order: 2, file: 'data-storage-builds/btree.py', run: 'python btree.py' },
  { layer: 6, order: 3, file: 'data-storage-builds/lru-cache.js', run: 'node lru-cache.js' },
  { layer: 6, order: 4, file: 'data-storage-builds/cache-system.js', run: 'node cache-system.js' },
  { layer: 6, order: 5, file: 'data-storage-builds/embedded-db.js', run: 'node embedded-db.js' },
  { layer: 6, order: 6, file: 'data-storage-builds/nosql-db.js', run: 'node nosql-db.js' },
  { layer: 6, order: 7, file: 'data-storage-builds/db-driver.js', run: 'node db-driver.js' },
  
  // Layer 7: Web & App Servers (Build user services)
  { layer: 7, order: 1, file: 'web-app-server-builds/web-server.js', run: 'node web-server.js' },
  { layer: 7, order: 2, file: 'web-app-server-builds/template-engine.js', run: 'node template-engine.js' },
  { layer: 7, order: 3, file: 'web-app-server-builds/static-site-generator.js', run: 'node static-site-generator.js' },
  { layer: 7, order: 4, file: 'web-app-server-builds/auth-server.js', run: 'node auth-server.js' },
  { layer: 7, order: 5, file: 'web-app-server-builds/task-queue.js', run: 'node task-queue.js' },
  
  // Layer 8: Browser & UI (Build interfaces)
  { layer: 8, order: 1, file: 'browser-ui-builds/html-parser.js', run: 'node html-parser.js' },
  { layer: 8, order: 2, file: 'browser-ui-builds/css-parser.js', run: 'node css-parser.js' },
  { layer: 8, order: 3, file: 'browser-ui-builds/virtual-dom.js', run: 'node virtual-dom.js' },
  { layer: 8, order: 4, file: 'browser-ui-builds/text-editor.js', run: 'node text-editor.js' },
  { layer: 8, order: 5, file: 'browser-ui-builds/gui-toolkit.js', run: 'node gui-toolkit.js' },
  { layer: 8, order: 6, file: 'browser-ui-builds/browser.js', run: 'node browser.js' },
  
  // Layer 9: Games & Graphics (Build multimedia)
  { layer: 9, order: 1, file: 'games-graphics-media-builds/rasterizer.py', run: 'python rasterizer.py' },
  { layer: 9, order: 2, file: 'games-graphics-media-builds/3d-renderer.js', run: 'node 3d-renderer.js' },
  { layer: 9, order: 3, file: 'games-graphics-media-builds/physics-engine.js', run: 'node physics-engine.js' },
  { layer: 9, order: 4, file: 'games-graphics-media-builds/audio-engine.js', run: 'node audio-engine.js' },
  { layer: 9, order: 5, file: 'games-graphics-media-builds/game-engine.js', run: 'node game-engine.js' },
  
  // Layer 10: Dev Tools (Build productivity)
  { layer: 10, order: 1, file: 'dev-tools-workflow-builds/logging-framework.js', run: 'node logging-framework.js' },
  { layer: 10, order: 2, file: 'dev-tools-workflow-builds/monitoring-system.js', run: 'node monitoring-system.js' },
  { layer: 10, order: 3, file: 'dev-tools-workflow-builds/static-analyzer.js', run: 'node static-analyzer.js' },
  { layer: 10, order: 4, file: 'dev-tools-workflow-builds/cli-tool.js', run: 'node cli-tool.js' },
  
  // Layer 11: Advanced (Build cutting-edge)
  { layer: 11, order: 1, file: 'advanced-specialized-builds/encryption.js', run: 'node encryption.js' },
  { layer: 11, order: 2, file: 'advanced-specialized-builds/blockchain.js', run: 'node blockchain.js' },
  { layer: 11, order: 3, file: 'advanced-specialized-builds/actor-model.js', run: 'node actor-model.js' },
  { layer: 11, order: 4, file: 'advanced-specialized-builds/bot.js', run: 'node bot.js' }
];

class SystematicBuilder {
  constructor() {
    this.state = this.loadState();
    this.results = [];
  }

  loadState() {
    const file = path.join(__dirname, '.build-state.json');
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
    return { current: 0, completed: [], failed: [] };
  }

  saveState() {
    const file = path.join(__dirname, '.build-state.json');
    fs.writeFileSync(file, JSON.stringify(this.state, null, 2));
  }

  build(item) {
    const filepath = path.join(__dirname, item.file);
    console.log(`\n[Layer ${item.layer}.${item.order}] Building ${item.file}...`);
    
    try {
      if (item.compile) {
        console.log(`  Compiling: ${item.compile}`);
        execSync(item.compile, { cwd: path.dirname(filepath), stdio: 'inherit' });
      }
      
      console.log(`  Running: ${item.run}`);
      const output = execSync(item.run, { cwd: path.dirname(filepath), timeout: 5000 });
      console.log(`  ✓ Success`);
      
      this.state.completed.push(item.file);
      this.results.push({ file: item.file, status: 'success' });
      return true;
    } catch (e) {
      console.log(`  ✗ Failed: ${e.message}`);
      this.state.failed.push(item.file);
      this.results.push({ file: item.file, status: 'failed', error: e.message });
      return false;
    }
  }

  buildAll() {
    console.log('🦉 Systematic Build - Bottom-up Progression\n');
    console.log(`Total items: ${SYSTEMATIC_ORDER.length}`);
    console.log(`Starting from: Layer ${SYSTEMATIC_ORDER[this.state.current].layer}\n`);
    
    for (let i = this.state.current; i < SYSTEMATIC_ORDER.length; i++) {
      const item = SYSTEMATIC_ORDER[i];
      this.build(item);
      this.state.current = i + 1;
      this.saveState();
    }
    
    this.report();
  }

  buildLayer(layerNum) {
    const items = SYSTEMATIC_ORDER.filter(i => i.layer === layerNum);
    console.log(`\n🔨 Building Layer ${layerNum} (${items.length} items)\n`);
    
    items.forEach(item => this.build(item));
    this.report();
  }

  buildNext() {
    if (this.state.current >= SYSTEMATIC_ORDER.length) {
      console.log('✓ All builds complete!');
      return;
    }
    
    const item = SYSTEMATIC_ORDER[this.state.current];
    this.build(item);
    this.state.current++;
    this.saveState();
  }

  report() {
    console.log('\n📊 Build Report\n');
    const success = this.results.filter(r => r.status === 'success').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    
    console.log(`Success: ${success}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${this.results.length}`);
    
    if (failed > 0) {
      console.log('\nFailed builds:');
      this.results.filter(r => r.status === 'failed').forEach(r => {
        console.log(`  ✗ ${r.file}`);
      });
    }
  }

  reset() {
    this.state = { current: 0, completed: [], failed: [] };
    this.saveState();
    console.log('Reset to start');
  }
}

const builder = new SystematicBuilder();
const cmd = process.argv[2];

if (cmd === 'all') {
  builder.buildAll();
} else if (cmd === 'layer') {
  builder.buildLayer(parseInt(process.argv[3]));
} else if (cmd === 'next') {
  builder.buildNext();
} else if (cmd === 'reset') {
  builder.reset();
} else {
  console.log(`
🦉 Systematic Builder

Commands:
  all           - Build everything in order
  layer <n>     - Build specific layer (1-11)
  next          - Build next item
  reset         - Reset to start

Example:
  node systematic.js layer 1
  node systematic.js next
  node systematic.js all
  `);
}

export default SystematicBuilder;
