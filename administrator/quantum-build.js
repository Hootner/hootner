#!/usr/bin/env node

import QuantumAIBuildSystem from './quantum-ai-build-system.js';

const system = new QuantumAIBuildSystem();

console.log('🚀 Starting Quantum AI Build...\n');

system.executeBuild()
  .then(report => {
    console.log('\n📊 BUILD COMPLETE');
    console.log('Status:', report.phases);
    console.log('AI Confidence:', (report.aiConfidence * 100).toFixed(1) + '%');
    console.log('Recommendations:', report.recommendations);
  })
  .catch(error => {
    console.error('❌ Build failed:', error.message);
  });