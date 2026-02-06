import fs from 'fs';
import path from 'path';
import { Worker } from 'worker_threads';

class SelfHealingArchitecture {
  constructor() {
    this.layers = [
      '0-core', '1-foundation', '2-intelligence', '3-communication',
      '4-interface', '5-economy', '6-governance', '7-data', '8-operations'
    ];
    this.violations = [];
    this.healingActions = [];
  }

  async detectViolations() {
    console.log('🔍 Scanning for architectural violations...');
    
    for (const layer of this.layers) {
      const layerPath = `hexarchy/${layer}`;
      if (!fs.existsSync(layerPath)) continue;
      
      // Check for dependency violations
      const files = this.getAllFiles(layerPath);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const imports = this.extractImports(content);
        
        for (const imp of imports) {
          if (this.isViolation(layer, imp)) {
            this.violations.push({
              layer,
              file,
              violation: imp,
              type: 'dependency'
            });
          }
        }
      }
    }
    
    console.log(`❌ Found ${this.violations.length} violations`);
    return this.violations;
  }

  async healViolations() {
    console.log('🔧 Auto-healing violations...');
    
    for (const violation of this.violations) {
      const action = this.generateHealingAction(violation);
      await this.executeHealing(action);
      this.healingActions.push(action);
    }
    
    console.log(`✅ Healed ${this.healingActions.length} violations`);
  }

  isViolation(layer, importPath) {
    const layerNum = parseInt(layer.split('-')[0]);
    
    // Rule: Lower layers cannot import from higher layers
    if (importPath.includes('hexarchy/')) {
      const importLayerNum = parseInt(importPath.split('/')[1].split('-')[0]);
      return importLayerNum > layerNum;
    }
    
    return false;
  }

  generateHealingAction(violation) {
    return {
      type: 'move_dependency',
      from: violation.file,
      to: this.findCorrectLayer(violation.violation),
      violation: violation.violation
    };
  }

  async executeHealing(action) {
    // Move violating code to correct layer
    const content = fs.readFileSync(action.from, 'utf8');
    const fixed = content.replace(action.violation, action.to);
    fs.writeFileSync(action.from, fixed);
  }

  getAllFiles(dir) {
    let files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        files = files.concat(this.getAllFiles(fullPath));
      } else if (item.endsWith('.js') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  extractImports(content) {
    const imports = [];
    const importRegex = /import.*from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  findCorrectLayer(importPath) {
    // Logic to determine correct layer for dependency
    if (importPath.includes('database')) return 'hexarchy/0-core/database/';
    if (importPath.includes('api')) return 'hexarchy/3-communication/';
    return 'hexarchy/0-core/';
  }
}

export default SelfHealingArchitecture;