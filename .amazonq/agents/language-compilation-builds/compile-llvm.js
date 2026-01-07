#!/usr/bin/env node
import fs from 'fs';
import { execSync } from 'child_process';

const input = process.argv[2] || '(add 2 3)';
const outputName = process.argv[3] || 'program';

// Import compiler
import('./compiler-llvm.js').then(module => {
  const llvmIR = module.compiler(input);
  
  // Save to file.ll
  fs.writeFileSync('output.ll', llvmIR);
  console.log('✓ Generated output.ll');
  
  try {
    // Compile to assembly
    execSync('llc output.ll -o output.s', { stdio: 'inherit' });
    console.log('✓ Compiled to output.s');
    
    // Link to executable
    execSync(`gcc output.s -o ${outputName}`, { stdio: 'inherit' });
    console.log(`✓ Created executable: ${outputName}`);
    
    // Run it
    const result = execSync(`./${outputName}`).toString();
    console.log(`\nResult: ${result}`);
  } catch (error) {
    console.error('Error: LLVM toolchain not found. Install with:');
    console.error('  brew install llvm (macOS)');
    console.error('  apt install llvm (Linux)');
  }
});
