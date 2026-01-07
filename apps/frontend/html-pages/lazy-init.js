/**
 * Global Lazy Loading Initialization
 * Auto-initializes lazy loading for all pages
 */

(function() { 'use strict';

  const lazyLoadManager = new LazyLoadManager();

  // Defer non-critical scripts
  const deferredScripts = [
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
    'https://d3js.org/d3.v7.min.js',
    'https://cdn.jsdelivr.net/npm/apexcharts',
    'https://cdn.plot.ly/plotly-latest.min.js'
  ];

  // Load deferred scripts on idle
  lazyLoadManager.loadScriptsOnIdle(deferredScripts);

  // Preload critical resources
  lazyLoadManager.preloadCritical([
    { href: '/shared-styles.css', as: 'style' },
    { href: '/lazy-load-manager.js', as: 'script' }
  ]);

  // Re-observe images on dynamic content load
  const observeDynamicContent = () => { const observer = new MutationObserver(() => { lazyLoadManager.observeImages(); });

    observer.observe(document.body, { childList: true,
      subtree: true }); };

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', observeDynamicContent); } else { observeDynamicContent(); }

  // Register service worker
  if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js')
        .then(() => )
        .catch(() => console.warn('Service Worker registration failed')); }); }

  // Export for global access
  window.lazyLoadManager = lazyLoadManager; })();
