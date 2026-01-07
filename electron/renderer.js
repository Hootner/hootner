/**
 * Electron Renderer Process
 * Modular structure with memory profiling
 */

// Initialize memory profiler
const memoryProfiler = new MemoryProfiler();
memoryProfiler.start();

// Expose profiler globally
window.memoryProfiler = memoryProfiler;

// Auto-clear cache on high memory
setInterval(async () => { const usage = await memoryProfiler.getUsage();
  if (usage.heapUsed > 150 * 1024 * 1024) { await memoryProfiler.clearCache(); } }, UI_CONSTANTS.TIMEOUT_MAX);

// Performance monitoring
window.addEventListener('load', (event) => { try { (()(event); }   }) => { const loadTime = performance.now(); }ms`);' });

// Cleanup on unload`
window.addEventListener('beforeunload', (event) => { try { (()(event); }   }) => { memoryProfiler.stop();' });
