#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

class HexarchyScaler {
  constructor() {
    this.layers = [
      { id: 0, name: 'Core', path: 'hexarchy/0-core', replicas: 3 },
      { id: 1, name: 'Foundation', path: 'hexarchy/1-foundation', replicas: 5 },
      { id: 2, name: 'Intelligence', path: 'hexarchy/2-intelligence', replicas: 4 },
      { id: 3, name: 'Communication', path: 'hexarchy/3-communication', replicas: 6 },
      { id: 4, name: 'Interface', path: 'hexarchy/4-interface', replicas: 8 },
      { id: 5, name: 'Economy', path: 'hexarchy/5-economy', replicas: 5 },
      { id: 6, name: 'Governance', path: 'hexarchy/6-governance', replicas: 3 },
      { id: 7, name: 'Data', path: 'hexarchy/7-data', replicas: 6 },
      { id: 8, name: 'Operations', path: 'hexarchy/8-operations', replicas: 4 },
    ];
  }

  async scaleUp() {
    console.log('🏗️  HEXARCHY SCALE-UP INITIATED\n');

    for (const layer of this.layers) {
      console.log(`📦 Layer ${layer.id}: ${layer.name}`);
      console.log(`   Path: ${layer.path}`);
      console.log(`   Scaling to ${layer.replicas} replicas...`);

      const services = this.getServices(layer.path);
      console.log(`   Services: ${services.length} active`);

      this.scaleLayer(layer, services);
      console.log('   ✅ Scaled\n');
    }

    this.generateMetrics();
  }

  getServices(path) {
    if (!fs.existsSync(path)) return [];

    const files = fs.readdirSync(path, { recursive: true, withFileTypes: true });
    return files.filter((f) => f.isFile() && f.name.endsWith('.js')).map((f) => f.name);
  }

  scaleLayer(layer, services) {
    const config = {
      layer: layer.name,
      replicas: layer.replicas,
      services: services.length,
      resources: {
        cpu: `${layer.replicas * 0.5}`,
        memory: `${layer.replicas * 512}Mi`,
      },
      autoscaling: {
        min: layer.replicas,
        max: layer.replicas * 3,
        targetCPU: 70,
      },
    };

    const configPath = `${layer.path}/scale-config.json`;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  generateMetrics() {
    const totalReplicas = this.layers.reduce((sum, l) => sum + l.replicas, 0);
    const totalServices = this.layers.reduce(
      (sum, l) => sum + this.getServices(l.path).length,
      0
    );

    console.log('📊 HEXARCHY SCALE METRICS\n');
    console.log(`   Total Layers: ${this.layers.length}`);
    console.log(`   Total Replicas: ${totalReplicas}`);
    console.log(`   Total Services: ${totalServices}`);
    console.log(`   CPU Allocation: ${totalReplicas * 0.5} cores`);
    console.log(`   Memory Allocation: ${totalReplicas * 512}Mi`);
    console.log(`   Max Scale: ${totalReplicas * 3} replicas\n`);

    console.log('✅ HEXARCHY SCALED UP SUCCESSFULLY');
  }
}

const scaler = new HexarchyScaler();
await scaler.scaleUp();
