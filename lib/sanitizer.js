/**
 * Input sanitizer
 */

class Sanitizer {
  constructor() {
    this.hasPurify = typeof DOMPurify !== 'undefined';
  }

  sanitize(input) {
    if (this.hasPurify) {
      return DOMPurify.sanitize(input, { USE_PROFILES: { html: true } });
    } else {
      const div = document.createElement('div');
      div.textContent = input;
      return div.innerHTML;
    }
  }

  cleanElement(element) {
    element.innerHTML = this.sanitize(element.innerHTML);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const sanitizer = new Sanitizer();
  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => { el.value = sanitizer.sanitize(el.value); });
  });
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Sanitizer;
}
