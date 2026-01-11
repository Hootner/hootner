import fs from 'fs';

const hexagonalStructure = {
  "0-core": "Domain logic, business rules, pure functions",
  "1-foundation": "Infrastructure, databases, external services", 
  "2-intelligence": "AI, ML, analytics, data processing",
  "3-communication": "APIs, messaging, external integrations",
  "4-interface": "UI, frontend, user interactions",
  "5-economy": "Business logic, commerce, revenue",
  "6-governance": "Security, compliance, policies",
  "7-data": "Data management, storage, repositories", 
  "8-operations": "DevOps, monitoring, deployment"
};

function validateHexagonalStructure() {
  const issues = [];
  
  Object.keys(hexagonalStructure).forEach(layer => {
    const layerPath = `hexarchy/${layer}`;
    if (!fs.existsSync(layerPath)) {
      issues.push(`Missing hexagonal layer: ${layerPath}`);
    }
  });
  
  return issues;
}

function generateHexagonalReport() {
  const issues = validateHexagonalStructure();
  
  console.log('🏗️ Hexagonal Architecture Status:');
  
  if (issues.length === 0) {
    console.log('✅ All hexagonal layers present');
    Object.entries(hexagonalStructure).forEach(([layer, description]) => {
      console.log(`   ${layer}: ${description}`);
    });
  } else {
    console.log(`⚠️ Missing ${issues.length} layers:`);
    issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  console.log('\n🎯 Hexagonal Benefits:');
  console.log('   - Domain isolation & clean boundaries');
  console.log('   - Independent layer development & testing');
  console.log('   - Technology-agnostic implementations');
  console.log('   - Scalable & maintainable architecture');
}

generateHexagonalReport();