/**
 * Lazy Load Manager - Optimized resource loading
 * Implements intersection observer for images and deferred script loading
 */

class LazyLoadManager { constructor() { this.observer = null;
    this.scriptCache = new Set();
    this.init(); }

  init() { this.setupImageLazyLoading();
    this.setupIframeLazyLoading(); }

  setupImageLazyLoading() { if ('IntersectionObserver' in window) { this.observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { const img = entry.target;
            if (img.dataset.src) { img.src = img.dataset.src;
              img.removeAttribute('data-src'); }
            if (img.dataset.srcset) { img.srcset = img.dataset.srcset;
              img.removeAttribute('data-srcset'); }
            this.observer.unobserve(img); } }); }, { rootMargin: '50px' });

      this.observeImages(); } else { this.loadAllImages(); } }

  observeImages() { document.querySelectorAll('img[data-src], img[loading="lazy"]').forEach(img => { this.observer.observe(img); }); }

  loadAllImages() { document.querySelectorAll('img[data-src]').forEach(img => { if (img.dataset.src) img.src = img.dataset.src;
      if (img.dataset.srcset) img.srcset = img.dataset.srcset; }); }

  setupIframeLazyLoading() { if ('IntersectionObserver' in window) { const iframeObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { const iframe = entry.target;
            if (iframe.dataset.src) { iframe.src = iframe.dataset.src;
              iframe.removeAttribute('data-src'); }
            iframeObserver.unobserve(iframe); } }); }, { rootMargin: '100px' });

      document.querySelectorAll('iframe[data-src]').forEach(iframe => { iframeObserver.observe(iframe); }); } }

  loadScript(src, async = true) { if (this.scriptCache.has(src)) { return Promise.resolve(); }

    return new Promise((resolve, reject) => { const script = document.createElement('script');
      script.src = src;
      script.async = async;
      script.onload = () => { this.scriptCache.add(src);
        resolve(); };
      script.onerror = reject;
      document.head.appendChild(script); }); }

  loadScriptsOnIdle(scripts) { if ('requestIdleCallback' in window) { requestIdleCallback(() => { scripts.forEach(src => this.loadScript(src)); }, { timeout: 2000 }); } else { setTimeout(() => { scripts.forEach(src => this.loadScript(src)); }, 1000); } }

  preloadCritical(resources) { resources.forEach(({ href, as, type }) => { const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (type) link.type = type;
      document.head.appendChild(link); }); } }

if (typeof module !== 'undefined' && module.exports) { module.exports = LazyLoadManager; }
