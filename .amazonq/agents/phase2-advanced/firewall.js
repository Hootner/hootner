// Minimal Firewall - Packet Filtering, Rules, Stateful Inspection
class Firewall {
  constructor() {
    this.rules = [];
    this.connections = new Map(); // Track stateful connections
    this.blocked = [];
  }

  // Add rule: { action: 'allow'|'deny', protocol, srcIp, srcPort, destIp, destPort }
  addRule(rule) {
    this.rules.push({ ...rule, id: this.rules.length + 1 });
  }

  // Check if packet matches rule
  matchRule(packet, rule) {
    if (rule.protocol && rule.protocol !== packet.protocol) return false;
    if (rule.srcIp && !this.matchIP(packet.src, rule.srcIp)) return false;
    if (rule.srcPort && rule.srcPort !== packet.srcPort) return false;
    if (rule.destIp && !this.matchIP(packet.dest, rule.destIp)) return false;
    if (rule.destPort && rule.destPort !== packet.destPort) return false;
    return true;
  }

  matchIP(ip, pattern) {
    if (pattern === '*') return true;
    if (pattern.includes('/')) {
      const [network, bits] = pattern.split('/');
      return this.inSubnet(ip, network, bits);
    }
    return ip === pattern;
  }

  inSubnet(ip, network, bits) {
    const ipNum = this.ipToNum(ip);
    const netNum = this.ipToNum(network);
    const mask = -1 << (32 - parseInt(bits));
    return (ipNum & mask) === (netNum & mask);
  }

  ipToNum(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
  }

  // Stateful inspection
  trackConnection(packet) {
    const key = `${packet.src}:${packet.srcPort}->${packet.dest}:${packet.destPort}`;
    const reverseKey = `${packet.dest}:${packet.destPort}->${packet.src}:${packet.srcPort}`;
    
    if (packet.flags?.includes('SYN')) {
      this.connections.set(key, { state: 'syn', time: Date.now() });
    } else if (this.connections.has(reverseKey)) {
      return true; // Part of established connection
    }
    return false;
  }

  // Filter packet
  filter(packet) {
    // Check stateful connections first
    if (this.trackConnection(packet)) {
      console.log(`✓ ALLOW (established): ${packet.src} -> ${packet.dest}`);
      return 'allow';
    }

    // Check rules
    for (const rule of this.rules) {
      if (this.matchRule(packet, rule)) {
        if (rule.action === 'deny') {
          this.blocked.push({ ...packet, time: Date.now(), rule: rule.id });
          console.log(`✗ DENY (rule ${rule.id}): ${packet.src} -> ${packet.dest}`);
        } else {
          console.log(`✓ ALLOW (rule ${rule.id}): ${packet.src} -> ${packet.dest}`);
        }
        return rule.action;
      }
    }

    // Default deny
    this.blocked.push({ ...packet, time: Date.now(), rule: 'default' });
    console.log(`✗ DENY (default): ${packet.src} -> ${packet.dest}`);
    return 'deny';
  }

  getStats() {
    return {
      totalRules: this.rules.length,
      activeConnections: this.connections.size,
      blockedPackets: this.blocked.length
    };
  }
}

// Demo: Corporate Firewall
const fw = new Firewall();

// Rules (order matters)
fw.addRule({ action: 'allow', protocol: 'tcp', destPort: 80 }); // HTTP
fw.addRule({ action: 'allow', protocol: 'tcp', destPort: 443 }); // HTTPS
fw.addRule({ action: 'allow', protocol: 'udp', destPort: 53 }); // DNS
fw.addRule({ action: 'deny', srcIp: '192.168.1.0/24', destIp: '10.0.0.0/8' }); // Block internal->DMZ
fw.addRule({ action: 'deny', srcIp: '*', destPort: 22 }); // Block SSH from outside

// Test packets
const packets = [
  { src: '203.0.113.50', dest: '192.168.1.10', protocol: 'tcp', srcPort: 54321, destPort: 443 },
  { src: '203.0.113.50', dest: '192.168.1.10', protocol: 'tcp', srcPort: 12345, destPort: 22 },
  { src: '192.168.1.100', dest: '8.8.8.8', protocol: 'udp', srcPort: 55555, destPort: 53 },
  { src: '192.168.1.100', dest: '10.0.0.5', protocol: 'tcp', srcPort: 44444, destPort: 80 }
];

console.log('=== Firewall Test ===\n');
packets.forEach(packet => fw.filter(packet));

console.log('\n=== Stats ===');
console.log(fw.getStats());

export default Firewall;
