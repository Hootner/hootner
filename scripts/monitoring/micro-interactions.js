class MicroInteractions { constructor() { this.init(); }

  init() { document.querySelectorAll('button, .card, .tab').forEach(el => { el.addEventListener('mouseenter', this.addGlow);
      el.addEventListener('mouseleave', this.removeGlow);
      el.addEventListener('click', this.addRipple); }); }

  addGlow(evt) { const el = evt.target;
    el.style.transition = 'box-shadow 0.3s';
    el.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.5)'; }

  removeGlow(evt) { const el = evt.target;
    el.style.boxShadow = 'none'; }

  addRipple(evt) { const el = evt.target;
    const ripple = document.createElement('span');
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = evt.clientX - rect.left - size / 2;
    const y = evt.clientY - rect.top - size / 2;

    ripple.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; width: ${size}px; height: ${size}px; background: rgba(0, 255, 255, 0.3); border-radius: 50%; transform: scale(0); animation: ripple 0.6s linear; pointer-events: none;`;
    el.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600); } }

const interactions = new MicroInteractions();

const style = document.createElement('style');
style.textContent = `@keyframes ripple { to { transform: scale(4); opacity: 0; } }`;
document.head.appendChild(style);

if (typeof module !== 'undefined' && module.exports) module.exports = MicroInteractions;
