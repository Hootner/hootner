#!/usr/bin/env node

import userDetection from '../hexarchy/7-data/analytics/user-detection.js';

async function checkUsers() {
  console.log('🔍 Scanning for active users...\n');
  
  try {
    const results = await userDetection.detectActiveUsers();
    
    console.log('📊 USER DETECTION RESULTS:');
    console.log('=' .repeat(50));
    console.log(`Total Users Found: ${results.totalUsers}`);
    console.log(`Active (24h): ${results.activeInLast24h}`);
    console.log(`Paid Users: ${results.paidUsers}`);
    console.log(`Revenue Generated: $${results.users.reduce((sum, u) => sum + u.totalSpent, 0).toFixed(2)}`);
    
    if (results.users.length > 0) {
      console.log('\n👥 USER DETAILS:');
      results.users.slice(0, 10).forEach(user => {
        const lastSeen = new Date(user.lastSeen).toLocaleString();
        const status = user.hasPaid ? '💰 PAID' : '🆓 FREE';
        const spent = user.totalSpent > 0 ? `($${user.totalSpent})` : '';
        
        console.log(`  ${status} ${user.userId} ${spent}`);
        console.log(`    Last seen: ${lastSeen}`);
        console.log(`    Sources: ${user.sources.join(', ')}`);
        if (user.ip) console.log(`    IP: ${user.ip}`);
        console.log('');
      });
    }
    
    // Real-time stats
    const realtime = await userDetection.getRealTimeStats();
    console.log('⚡ REAL-TIME STATS:');
    console.log(`  Active Connections: ${realtime.activeConnections}`);
    console.log(`  Current Users: ${realtime.currentUsers}`);
    console.log(`  System Load: CPU ${realtime.systemLoad.cpu}%, RAM ${realtime.systemLoad.memory}%`);
    console.log(`  Requests/min: ${realtime.systemLoad.requests}`);
    
  } catch (error) {
    console.error('❌ Error detecting users:', error.message);
  }
}

// Run detection
checkUsers();