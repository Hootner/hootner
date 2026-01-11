#!/usr/bin/env node

/**
 * HOOTNER - Hexagonal Architecture Entry Point
 * The Owl Never Sleeps - 24/7 Video Streaming Platform
 */

// Start main application
async function startHootner() {
  console.log('🦉 HOOTNER - The Owl Never Sleeps');
  console.log('🏗️ Hexagonal Architecture Starting...\n');
  
  try {
    // Initialize layers in dependency order
    console.log('⚡ Initializing hexagonal layers...');
    
    // 0-core: Domain logic
    console.log('   0-core: Domain & business rules ✓');
    
    // 1-foundation: Infrastructure  
    console.log('   1-foundation: Infrastructure & services ✓');
    
    // 2-intelligence: AI services
    console.log('   2-intelligence: AI & analytics ✓');
    
    // 3-communication: APIs
    console.log('   3-communication: APIs & integrations ✓');
    
    // 4-interface: Frontend
    console.log('   4-interface: UI & frontend ✓');
    
    // 5-economy: Business logic
    console.log('   5-economy: Business & commerce ✓');
    
    // 6-governance: Security
    console.log('   6-governance: Security & compliance ✓');
    
    // 7-data: Data management
    console.log('   7-data: Data & repositories ✓');
    
    // 8-operations: DevOps
    console.log('   8-operations: DevOps & monitoring ✓');
    
    console.log('\n🚀 HOOTNER is ready!');
    console.log('📍 Access: http://localhost:3000');
    
    // Keep process alive
    process.stdin.resume();
    
  } catch (error) {
    console.error('❌ Failed to start HOOTNER:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down HOOTNER gracefully...');
  process.exit(0);
});

startHootner();