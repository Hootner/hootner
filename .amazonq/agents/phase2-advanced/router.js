// Minimal Router - Routing Table, Packet Forwarding, NAT
class Router {
  constructor(name) {
    this.name = name;
    this.interfaces = new Map(); // interface -> network
    this.routingTable = []; // { dest, mask, gateway, interface, metric }
    this.natTable = new Map(); // internal -> external mapping
    this.nextPort = 50000;
  }

  addInterface(name, network) {
    this.interfaces.set(name, network);
    // Add direct route
    this.addRoute(network, '255.255.255.0', null, name, 0);
  }

  addRoute(dest, mask, gateway, iface, metric = 1) {
    this.routingTable.push({ dest, mask, gateway, interface: iface, metric });
    this.routingTable.sort((a, b) => a.metric - b.metric);
  }

  // Match IP against network/mask
  matchNetwork(ip, network, mask) {
    const ipParts = ip.split('.').map(Number);
    const netParts = network.split('.').map(Number);
    const maskParts = mask.split('.').map(Number);
    
    for (let i = 0; i < 4; i++) {
      if ((ipParts[i] & maskParts[i]) !== (netParts[i] & maskParts[i])) {
        return false;
      }
    }
    return true;
  }

  // Find route for destination
  findRoute(destIp) {
    for (const route of this.routingTable) {
      if (this.matchNetwork(destIp, route.dest, route.mask)) {
        return route;
      }
    }
    return null;
  }

  // Forward packet
  forward(packet) {
    const route = this.findRoute(packet.dest);
    if (!route) {
      console.log(`No route to ${packet.dest}`);
      return null;
    }

    console.log(`Forwarding ${packet.src} -> ${packet.dest} via ${route.interface}`);
    
    // NAT translation if going through external interface
    if (route.interface === 'eth0' && this.isPrivateIP(packet.src)) {
      const natKey = `${packet.src}:${packet.srcPort}`;
      const externalPort = this.nextPort++;
      this.natTable.set(natKey, externalPort);
      packet.srcPort = externalPort;
      packet.src = this.interfaces.get('eth0'); // External IP
      console.log(`NAT: ${natKey} -> ${packet.src}:${externalPort}`);
    }

    return { packet, interface: route.interface };
  }

  isPrivateIP(ip) {
    return ip.startsWith('192.168.') || ip.startsWith('10.');
  }
}

// Demo: Home Network Router
const router = new Router('HomeRouter');

// Interfaces
router.addInterface('eth0', '203.0.113.1'); // External (WAN)
router.addInterface('eth1', '192.168.1.1'); // Internal (LAN)

// Default route to internet
router.addRoute('0.0.0.0', '0.0.0.0', '203.0.113.254', 'eth0', 10);

// Test packets
const packets = [
  { src: '192.168.1.100', srcPort: 12345, dest: '8.8.8.8', destPort: 53, data: 'DNS query' },
  { src: '192.168.1.100', srcPort: 54321, dest: '192.168.1.50', destPort: 80, data: 'Local HTTP' },
  { src: '192.168.1.200', srcPort: 44444, dest: '1.1.1.1', destPort: 443, data: 'HTTPS' }
];

packets.forEach(packet => {
  console.log(`\nPacket: ${packet.src}:${packet.srcPort} -> ${packet.dest}:${packet.destPort}`);
  router.forward(packet);
});

export default Router;
