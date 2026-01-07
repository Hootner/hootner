#!/usr/bin/env node
/**
 * Layer 5: Firewall - Packet filtering and security rules
 * Dependencies: Layer 0 (Logic), Layer 3 (Memory), Layer 5 (TCP)
 */

class Firewall {
  constructor() {
    this.rules = [];
    this.packets = [];
    this.blocked = [];
    this.allowed = [];
  }

  // Add firewall rule
  addRule(rule) {
    this.rules.push({
      action: rule.action, // ALLOW or BLOCK
      protocol: rule.protocol || '*',
      srcIP: rule.srcIP || '*',
      dstIP: rule.dstIP || '*',
      srcPort: rule.srcPort || '*',
      dstPort: rule.dstPort || '*',
      priority: rule.priority || 100
    });
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  // Match rule
  matchRule(packet, rule) {
    return (
      (rule.protocol === '*' || rule.protocol === packet.protocol) &&
      (rule.srcIP === '*' || rule.srcIP === packet.srcIP) &&
      (rule.dstIP === '*' || rule.dstIP === packet.dstIP) &&
      (rule.srcPort === '*' || rule.srcPort === packet.srcPort) &&
      (rule.dstPort === '*' || rule.dstPort === packet.dstPort)
    );
  }

  // Filter packet
  filter(packet) {
    this.packets.push(packet);
    
    // Check rules in priority order
    for (const rule of this.rules) {
      if (this.matchRule(packet, rule)) {
        const result = {
          packet,
          rule,
          action: rule.action,
          time: Date.now()
        };
        
        if (rule.action === 'BLOCK') {
          this.blocked.push(result);
          console.log(`[BLOCKED] ${packet.srcIP}:${packet.srcPort} -> ${packet.dstIP}:${packet.dstPort}`);
          return false;
        } else {
          this.allowed.push(result);
          console.log(`[ALLOWED] ${packet.srcIP}:${packet.srcPort} -> ${packet.dstIP}:${packet.dstPort}`);
          return true;
        }
      }
    }
    
    // Default deny
    this.blocked.push({ packet, rule: null, action: 'BLOCK', time: Date.now() });
    console.log(`[BLOCKED] ${packet.srcIP} (no matching rule)`);
    return false;
  }

  // Stateful inspection
  trackConnection(packet) {
    const key = `${packet.srcIP}:${packet.srcPort}-${packet.dstIP}:${packet.dstPort}`;
    return { key, state: packet.flags };
  }

  // Get statistics
  stats() {
    return {
      rules: this.rules.length,
      packets: this.packets.length,
      allowed: this.allowed.length,
      blocked: this.blocked.length,
      blockRate: (this.blocked.length / this.packets.length * 100).toFixed(1) + '%'
    };
  }

  // List rules
  listRules() {
    return this.rules.map((r, i) => ({
      id: i,
      action: r.action,
      rule: `${r.protocol} ${r.srcIP}:${r.srcPort} -> ${r.dstIP}:${r.dstPort}`,
      priority: r.priority
    }));
  }
}

// Demo
if (require.main === module) {
  const fw = new Firewall();
  
  console.log('=== Firewall Demo ===\n');
  
  // Add rules
  fw.addRule({ action: 'ALLOW', protocol: 'TCP', dstPort: 80, priority: 10 });
  fw.addRule({ action: 'ALLOW', protocol: 'TCP', dstPort: 443, priority: 10 });
  fw.addRule({ action: 'BLOCK', srcIP: '10.0.0.5', priority: 5 });
  fw.addRule({ action: 'ALLOW', protocol: 'UDP', dstPort: 53, priority: 20 });
  
  console.log('Rules:', fw.listRules(), '\n');
  
  // Test packets
  fw.filter({ protocol: 'TCP', srcIP: '192.168.1.10', srcPort: 5000, dstIP: '93.184.216.34', dstPort: 80, flags: 'SYN' });
  fw.filter({ protocol: 'TCP', srcIP: '10.0.0.5', srcPort: 6000, dstIP: '93.184.216.34', dstPort: 443, flags: 'SYN' });
  fw.filter({ protocol: 'TCP', srcIP: '192.168.1.11', srcPort: 7000, dstIP: '93.184.216.34', dstPort: 22, flags: 'SYN' });
  fw.filter({ protocol: 'UDP', srcIP: '192.168.1.12', srcPort: 8000, dstIP: '8.8.8.8', dstPort: 53, flags: '' });
  
  console.log('\nStats:', fw.stats());
}

module.exports = Firewall;
