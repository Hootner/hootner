#!/usr/bin/env node
// Progressive Learning Journey - Build Your Own X
// Walks through all 11 layers systematically

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LAYERS = [
  {
    id: 1,
    name: 'Foundational Builds',
    dir: 'foundational-builds',
    description: 'Hardware and Low-Level Emulation',
    projects: ['cpu-emulator.cpp', 'assembler.py', 'linker.rs', 'disassembler.c', 'debugger.rs']
  },
  {
    id: 2,
    name: 'Language & Compilation',
    dir: 'language-compilation-builds',
    description: 'Tools for Creating and Optimizing Code',
    projects: ['compiler.js', 'language.py', 'jit-compiler.c', 'garbage-collector.c', 'regex-engine.js']
  },
  {
    id: 3,
    name: 'OS & Kernel',
    dir: 'os-kernel-builds',
    description: 'Core System Management',
    projects: ['kernel.c', 'bootloader.asm', 'scheduler.c', 'memory-manager.c', 'filesystem.c', 'shell.c']
  },
  {
    id: 4,
    name: 'Virtualization & Runtime',
    dir: 'virtualization-runtime-builds',
    description: 'Isolated Environments',
    projects: ['bytecode-vm.py', 'container.go', 'virtual-machine.c', 'container-orchestrator.js']
  },
  {
    id: 5,
    name: 'Networking & Communication',
    dir: 'networking-communication-builds',
    description: 'Connecting Systems',
    projects: ['tcp-server.py', 'http-server.js', 'dns-resolver.py', 'websocket-server.py']
  },
  {
    id: 6,
    name: 'Data Storage',
    dir: 'data-storage-builds',
    description: 'Handling Information',
    projects: ['sql-database.py', 'key-value-store.c', 'document-db.js', 'btree.py', 'lru-cache.js']
  },
  {
    id: 7,
    name: 'Web & App Servers',
    dir: 'web-app-server-builds',
    description: 'User-Facing Services',
    projects: ['web-framework.py', 'auth-server.js', 'template-engine.js', 'email-server.js']
  },
  {
    id: 8,
    name: 'Browser & UI',
    dir: 'browser-ui-builds',
    description: 'Front-End and Interaction',
    projects: ['html-parser.js', 'css-parser.js', 'virtual-dom.js', 'render-engine.py', 'text-editor.js']
  },
  {
    id: 9,
    name: 'Games & Graphics',
    dir: 'games-graphics-media-builds',
    description: 'Multimedia and Simulation',
    projects: ['game-engine.js', 'physics-engine.js', 'ray-tracer.py', 'rasterizer.py', 'audio-synth.js']
  },
  {
    id: 10,
    name: 'Dev Tools',
    dir: 'dev-tools-workflow-builds',
    description: 'Productivity Enhancers',
    projects: ['package-manager.py', 'version-control.py', 'build-tool.js', 'ci-cd-pipeline.js']
  },
  {
    id: 11,
    name: 'Advanced & Specialized',
    dir: 'advanced-specialized-builds',
    description: 'Cutting-Edge Applications',
    projects: ['blockchain.js', 'neural-network.py', 'search-engine.js', 'recommendation-engine.py']
  }
];

class LearningJourney {
  constructor() {
    this.progress = this.loadProgress();
  }

  loadProgress() {
    const file = path.join(__dirname, '.learning-progress.json');
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
    return { currentLayer: 1, completed: [] };
  }

  saveProgress() {
    const file = path.join(__dirname, '.learning-progress.json');
    fs.writeFileSync(file, JSON.stringify(this.progress, null, 2));
  }

  showStatus() {
    console.log('\n🦉 HOOTNER Learning Journey\n');
    console.log('Progress: Layer', this.progress.currentLayer, 'of', LAYERS.length);
    console.log('Completed:', this.progress.completed.length, 'projects\n');

    LAYERS.forEach(layer => {
      const status = layer.id < this.progress.currentLayer ? '✓' : 
                     layer.id === this.progress.currentLayer ? '→' : '○';
      console.log(`${status} Layer ${layer.id}: ${layer.name}`);
    });
  }

  showCurrentLayer() {
    const layer = LAYERS[this.progress.currentLayer - 1];
    console.log(`\n📚 Layer ${layer.id}: ${layer.name}`);
    console.log(`Description: ${layer.description}\n`);
    console.log('Projects:');
    layer.projects.forEach((proj, i) => {
      const done = this.progress.completed.includes(`${layer.id}-${i}`);
      console.log(`  ${done ? '✓' : '○'} ${proj}`);
    });
    console.log(`\nDirectory: .amazonq/agents/${layer.dir}/`);
  }

  nextProject() {
    const layer = LAYERS[this.progress.currentLayer - 1];
    const incomplete = layer.projects.findIndex((_, i) => 
      !this.progress.completed.includes(`${layer.id}-${i}`)
    );
    
    if (incomplete === -1) {
      console.log('\n✓ Layer complete! Moving to next layer...\n');
      this.progress.currentLayer++;
      this.saveProgress();
      if (this.progress.currentLayer > LAYERS.length) {
        console.log('🎉 All layers complete! You built everything!\n');
        return null;
      }
      return this.nextProject();
    }

    const project = layer.projects[incomplete];
    const filepath = path.join(__dirname, layer.dir, project);
    
    console.log(`\n🔨 Next: ${project}`);
    console.log(`Path: ${filepath}`);
    console.log(`\nTo mark complete: node learning-journey.js complete\n`);
    
    return { layer, project, filepath, id: `${layer.id}-${incomplete}` };
  }

  markComplete(projectId) {
    if (!this.progress.completed.includes(projectId)) {
      this.progress.completed.push(projectId);
      this.saveProgress();
      console.log('✓ Marked complete!\n');
    }
  }

  reset() {
    this.progress = { currentLayer: 1, completed: [] };
    this.saveProgress();
    console.log('Reset to Layer 1\n');
  }
}

// CLI
const journey = new LearningJourney();
const cmd = process.argv[2];

if (cmd === 'status') {
  journey.showStatus();
} else if (cmd === 'layer') {
  journey.showCurrentLayer();
} else if (cmd === 'next') {
  const next = journey.nextProject();
  if (next) {
    console.log(`Run: cat ${next.filepath}`);
  }
} else if (cmd === 'complete') {
  const next = journey.nextProject();
  if (next) {
    journey.markComplete(next.id);
    journey.nextProject();
  }
} else if (cmd === 'reset') {
  journey.reset();
} else {
  console.log(`
🦉 HOOTNER Learning Journey

Commands:
  status    - Show overall progress
  layer     - Show current layer details
  next      - Show next project to build
  complete  - Mark current project complete
  reset     - Start over from Layer 1

Example:
  node learning-journey.js status
  node learning-journey.js next
  node learning-journey.js complete
  `);
}
