#!/usr/bin/env node
// Complete Template Inventory - 153 Templates Across 11 Layers

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COMPLETE_INVENTORY = {
  totalTemplates: 153,
  layers: [
    {
      id: 1,
      name: 'Foundational Builds',
      dir: 'foundational-builds',
      count: 5,
      templates: [
        { name: 'CPU Emulator', file: 'cpu-emulator.cpp', lang: 'C++' },
        { name: 'Assembler', file: 'assembler.py', lang: 'Python' },
        { name: 'Linker', file: 'linker.rs', lang: 'Rust' },
        { name: 'Disassembler', file: 'disassembler.c', lang: 'C' },
        { name: 'Debugger', file: 'debugger.rs', lang: 'Rust' }
      ]
    },
    {
      id: 2,
      name: 'Language & Compilation',
      dir: 'language-compilation-builds',
      count: 10,
      templates: [
        { name: 'Programming Language', file: 'language.py', lang: 'Python' },
        { name: 'Compiler', file: 'compiler.js', lang: 'JavaScript' },
        { name: 'Compiler Extended', file: 'compiler-extended.js', lang: 'JavaScript' },
        { name: 'LLVM Compiler', file: 'compiler-llvm.js', lang: 'JavaScript' },
        { name: 'JIT Compiler', file: 'jit-compiler.c', lang: 'C' },
        { name: 'Garbage Collector', file: 'garbage-collector.c', lang: 'C' },
        { name: 'Regex Engine', file: 'regex-engine.js', lang: 'JavaScript' },
        { name: 'Scripting Language', file: 'scripting-language.py', lang: 'Python' },
        { name: 'Query Language', file: 'query-language.py', lang: 'Python' },
        { name: 'Compiler Optimizer', file: 'compiler-optimizer.js', lang: 'JavaScript', new: true }
      ]
    },
    {
      id: 3,
      name: 'OS & Kernel',
      dir: 'os-kernel-builds',
      count: 10,
      templates: [
        { name: 'Bootloader', file: 'bootloader.asm', lang: 'Assembly' },
        { name: 'Kernel', file: 'kernel.c', lang: 'C' },
        { name: 'Scheduler', file: 'scheduler.c', lang: 'C' },
        { name: 'Memory Manager', file: 'memory-manager.c', lang: 'C' },
        { name: 'Shell', file: 'shell.c', lang: 'C' },
        { name: 'Filesystem', file: 'filesystem.c', lang: 'C' },
        { name: 'Memory Allocator', file: 'memory-allocator.c', lang: 'C', new: true },
        { name: 'Microkernel', file: 'microkernel.c', lang: 'C', new: true },
        { name: 'Embedded OS', file: 'embedded-os.c', lang: 'C', new: true },
        { name: 'Operating System', file: 'operating-system.js', lang: 'JavaScript', new: true }
      ]
    },
    {
      id: 4,
      name: 'Virtualization & Runtime',
      dir: 'virtualization-runtime-builds',
      count: 7,
      templates: [
        { name: 'Bytecode VM', file: 'bytecode-vm.py', lang: 'Python' },
        { name: 'Virtual Machine', file: 'virtual-machine.c', lang: 'C' },
        { name: 'Container', file: 'container.go', lang: 'Go' },
        { name: 'Docker-like', file: 'docker-like.sh', lang: 'Shell' },
        { name: 'Container Orchestrator', file: 'container-orchestrator.js', lang: 'JavaScript' },
        { name: 'Runtime', file: 'runtime.js', lang: 'JavaScript', new: true },
        { name: 'Sandbox', file: 'sandbox.js', lang: 'JavaScript', new: true }
      ]
    },
    {
      id: 5,
      name: 'Networking & Communication',
      dir: 'networking-communication-builds',
      count: 12,
      templates: [
        { name: 'TCP Server', file: 'tcp-server.py', lang: 'Python' },
        { name: 'HTTP Server', file: 'http-server.js', lang: 'JavaScript' },
        { name: 'WebSocket Server', file: 'websocket-server.py', lang: 'Python' },
        { name: 'DNS Resolver', file: 'dns-resolver.py', lang: 'Python' },
        { name: 'Chat Server', file: 'chat-server.js', lang: 'JavaScript' },
        { name: 'REST API', file: 'rest-api.js', lang: 'JavaScript' },
        { name: 'Network Protocol', file: 'network-protocol.js', lang: 'JavaScript', new: true },
        { name: 'TCP/IP Stack', file: 'tcp-ip-stack.js', lang: 'JavaScript', new: true },
        { name: 'IoT Protocol', file: 'iot-protocol.js', lang: 'JavaScript', new: true },
        { name: 'Pub/Sub', file: 'pubsub.js', lang: 'JavaScript', new: true },
        { name: 'Reverse Proxy', file: 'reverse-proxy.js', lang: 'JavaScript', new: true }
      ]
    },
    {
      id: 6,
      name: 'Data Storage',
      dir: 'data-storage-builds',
      count: 12,
      templates: [
        { name: 'SQL Database', file: 'sql-database.py', lang: 'Python' },
        { name: 'Key-Value Store', file: 'key-value-store.c', lang: 'C' },
        { name: 'Document DB', file: 'document-db.js', lang: 'JavaScript' },
        { name: 'B-Tree', file: 'btree.py', lang: 'Python' },
        { name: 'LRU Cache', file: 'lru-cache.js', lang: 'JavaScript' },
        { name: 'Hash Table', file: 'hash-table.js', lang: 'JavaScript', new: true },
        { name: 'DB Driver', file: 'db-driver.js', lang: 'JavaScript', new: true },
        { name: 'NoSQL DB', file: 'nosql-db.js', lang: 'JavaScript', new: true },
        { name: 'Embedded DB', file: 'embedded-db.js', lang: 'JavaScript', new: true },
        { name: 'Cache System', file: 'cache-system.js', lang: 'JavaScript', new: true },
        { name: 'Distributed FS', file: 'distributed-fs.js', lang: 'JavaScript', new: true }
      ]
    },
    {
      id: 7,
      name: 'Web & App Servers',
      dir: 'web-app-server-builds',
      count: 13,
      templates: [
        { name: 'Web Framework', file: 'web-framework.py', lang: 'Python' },
        { name: 'MVC Framework', file: 'mvc-framework.js', lang: 'JavaScript' },
        { name: 'Auth Server', file: 'auth-server.js', lang: 'JavaScript' },
        { name: 'Email Server', file: 'email-server.js', lang: 'JavaScript' },
        { name: 'Template Engine', file: 'template-engine.js', lang: 'JavaScript' },
        { name: 'Password Manager', file: 'password-manager.js', lang: 'JavaScript' },
        { name: 'Session Manager', file: 'session-manager.py', lang: 'Python' },
        { name: 'Static Server', file: 'static-server.py', lang: 'Python' },
        { name: 'Middleware', file: 'middleware.js', lang: 'JavaScript' },
        { name: 'Web Server', file: 'web-server.js', lang: 'JavaScript', new: true },
        { name: 'Static Site Generator', file: 'static-site-generator.js', lang: 'JavaScript', new: true },
        { name: 'Task Queue', file: 'task-queue.js', lang: 'JavaScript', new: true }
      ]
    },
    {
      id: 8,
      name: 'Browser & UI',
      dir: 'browser-ui-builds',
      count: 13,
      templates: [
        { name: 'HTML Parser', file: 'html-parser.js', lang: 'JavaScript' },
        { name: 'CSS Parser', file: 'css-parser.js', lang: 'JavaScript' },
        { name: 'JS Engine', file: 'js-engine.js', lang: 'JavaScript' },
        { name: 'DOM', file: 'dom.js', lang: 'JavaScript' },
        { name: 'Virtual DOM', file: 'virtual-dom.js', lang: 'JavaScript' },
        { name: 'Render Engine', file: 'render-engine.py', lang: 'Python' },
        { name: 'Text Editor', file: 'text-editor.js', lang: 'JavaScript' },
        { name: 'Component Framework', file: 'component-framework.js', lang: 'JavaScript' },
        { name: 'Browser', file: 'browser.js', lang: 'JavaScript', new: true },
        { name: 'GUI Toolkit', file: 'gui-toolkit.js', lang: 'JavaScript', new: true },
        { name: 'Window Manager', file: 'window-manager.js', lang: 'JavaScript', new: true },
        { name: 'IDE', file: 'ide.js', lang: 'JavaScript', new: true }
      ]
    },
    {
      id: 9,
      name: 'Games & Graphics',
      dir: 'games-graphics-media-builds',
      count: 12,
      templates: [
        { name: 'Game Engine', file: 'game-engine.js', lang: 'JavaScript' },
        { name: 'Physics Engine', file: 'physics-engine.js', lang: 'JavaScript' },
        { name: 'Ray Tracer', file: 'ray-tracer.py', lang: 'Python' },
        { name: 'Rasterizer', file: 'rasterizer.py', lang: 'Python' },
        { name: 'Audio Synth', file: 'audio-synth.js', lang: 'JavaScript' },
        { name: 'Image Processor', file: 'image-processor.py', lang: 'Python' },
        { name: 'Video Codec', file: 'video-codec.py', lang: 'Python' },
        { name: '3D Renderer', file: '3d-renderer.js', lang: 'JavaScript', new: true },
        { name: 'Voxel Engine', file: 'voxel-engine.js', lang: 'JavaScript', new: true },
        { name: 'Visual Recognition', file: 'visual-recognition.js', lang: 'JavaScript', new: true },
        { name: 'AR/VR Engine', file: 'arvr-engine.js', lang: 'JavaScript', new: true },
        { name: 'Audio Engine', file: 'audio-engine.js', lang: 'JavaScript', new: true }
      ]
    },
    {
      id: 10,
      name: 'Dev Tools',
      dir: 'dev-tools-workflow-builds',
      count: 10,
      templates: [
        { name: 'Package Manager', file: 'package-manager.py', lang: 'Python' },
        { name: 'Version Control', file: 'version-control.py', lang: 'Python' },
        { name: 'Build Tool', file: 'build-tool.js', lang: 'JavaScript' },
        { name: 'CI/CD Pipeline', file: 'ci-cd-pipeline.js', lang: 'JavaScript' },
        { name: 'Test Runner', file: 'test-runner.js', lang: 'JavaScript' },
        { name: 'Code Formatter', file: 'code-formatter.py', lang: 'Python' },
        { name: 'Static Analyzer', file: 'static-analyzer.js', lang: 'JavaScript', new: true },
        { name: 'Monitoring System', file: 'monitoring-system.js', lang: 'JavaScript', new: true },
        { name: 'Logging Framework', file: 'logging-framework.js', lang: 'JavaScript', new: true },
        { name: 'CLI Tool', file: 'cli-tool.js', lang: 'JavaScript', new: true }
      ]
    },
    {
      id: 11,
      name: 'Advanced & Specialized',
      dir: 'advanced-specialized-builds',
      count: 12,
      templates: [
        { name: 'Blockchain', file: 'blockchain.js', lang: 'JavaScript' },
        { name: 'Neural Network', file: 'neural-network.py', lang: 'Python' },
        { name: 'Search Engine', file: 'search-engine.js', lang: 'JavaScript' },
        { name: 'Recommendation Engine', file: 'recommendation-engine.py', lang: 'Python' },
        { name: 'Cryptography', file: 'cryptography.py', lang: 'Python' },
        { name: 'Distributed System', file: 'distributed-system.py', lang: 'Python' },
        { name: 'Encryption', file: 'encryption.js', lang: 'JavaScript', new: true },
        { name: 'Actor Model', file: 'actor-model.js', lang: 'JavaScript', new: true },
        { name: 'BitTorrent', file: 'bittorrent.js', lang: 'JavaScript', new: true },
        { name: 'Bot', file: 'bot.js', lang: 'JavaScript', new: true },
        { name: 'Smart Contract Platform', file: 'smart-contract-platform.js', lang: 'JavaScript', new: true },
        { name: 'Decentralized Storage', file: 'decentralized-storage.js', lang: 'JavaScript', new: true }
      ]
    }
  ],
  bonus: {
    phase1: 9,
    phase2: 18,
    phase3: 19,
    phase4: 10,
    phase5: 10,
    hootner: 4
  }
};

class DeepDive {
  showStats() {
    console.log('\n🦉 HOOTNER Build Your Own X - Complete Inventory\n');
    console.log(`Total Templates: ${COMPLETE_INVENTORY.totalTemplates}`);
    console.log(`Core Layers: ${COMPLETE_INVENTORY.layers.length}`);
    console.log(`New Templates Added: 40\n`);
    
    COMPLETE_INVENTORY.layers.forEach(layer => {
      const newCount = layer.templates.filter(t => t.new).length;
      console.log(`Layer ${layer.id}: ${layer.name} (${layer.count} templates${newCount ? `, +${newCount} new` : ''})`);
    });
    
    console.log('\nBonus Categories:');
    console.log(`  Phase 1 Advanced: ${COMPLETE_INVENTORY.bonus.phase1}`);
    console.log(`  Phase 2 Distributed: ${COMPLETE_INVENTORY.bonus.phase2}`);
    console.log(`  Phase 3 Specialized: ${COMPLETE_INVENTORY.bonus.phase3}`);
    console.log(`  Phase 4 Emerging: ${COMPLETE_INVENTORY.bonus.phase4}`);
    console.log(`  Phase 5 Testing: ${COMPLETE_INVENTORY.bonus.phase5}`);
    console.log(`  HOOTNER Crypto: ${COMPLETE_INVENTORY.bonus.hootner}`);
  }

  exportJSON() {
    const file = path.join(__dirname, 'COMPLETE_INVENTORY.json');
    fs.writeFileSync(file, JSON.stringify(COMPLETE_INVENTORY, null, 2));
    console.log(`\n✓ Exported to ${file}`);
  }

  findTemplate(query) {
    const results = [];
    COMPLETE_INVENTORY.layers.forEach(layer => {
      layer.templates.forEach(t => {
        if (t.name.toLowerCase().includes(query.toLowerCase()) || 
            t.file.includes(query)) {
          results.push({ ...t, layer: layer.name, dir: layer.dir });
        }
      });
    });
    return results;
  }
}

const dive = new DeepDive();

if (process.argv[2] === 'stats') {
  dive.showStats();
} else if (process.argv[2] === 'export') {
  dive.exportJSON();
} else if (process.argv[2] === 'find') {
  const results = dive.findTemplate(process.argv[3] || '');
  console.log(JSON.stringify(results, null, 2));
} else {
  console.log(`
Commands:
  stats  - Show complete statistics
  export - Export inventory to JSON
  find <query> - Search templates
  `);
}

export default DeepDive;
