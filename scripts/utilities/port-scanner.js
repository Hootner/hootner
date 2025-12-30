import net from 'net';

const PORTS = [
  { port: 3000, service: 'Frontend' },
  { port: 3001, service: 'Grafana' },
  { port: 4000, service: 'GraphQL API' },
  { port: 5000, service: 'Backend' },
  { port: 6379, service: 'Redis' },
  { port: 8080, service: 'HTTP Proxy' },
  { port: 9090, service: 'Prometheus' },
  { port: 27017, service: 'MongoDB' },
];

const scanPort = (host, port, timeout = 2000) => {
  return new Promise(resolve => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);

    socket.on('connect', () => {
      socket.destroy();
      resolve({ port, open: true });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ port, open: false });
    });

    socket.on('error', () => {
      resolve({ port, open: false });
    });

    socket.connect(port, host);
  });
};

const scan = async (host = 'localhost') => {
  
  const results = await Promise.all(
    PORTS.map(async ({ port, service }) => {
      const result = await scanPort(host, port);
      return { ...result, service };
    })
  );

    results.forEach(({ port, service, open }) => {
    const status = open ? '✅ OPEN' : '❌ CLOSED';
    `);
  });

  const openPorts = results.filter(r => r.open);
  
  return results;
};

const host = process.argv[2] || 'localhost';
scan(host).catch(console.error);

export { scanPort, scan };
