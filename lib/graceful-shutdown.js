export function setupGracefulShutdown(server, serviceName, options = {}) {
  const { cleanup = [] } = options;
  
  const shutdown = async (signal) => {
    server.close(() => {
      });
    
    for (const cleanupFn of cleanup) {
      try {
        await cleanupFn();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
    
    process.exit(0);
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}