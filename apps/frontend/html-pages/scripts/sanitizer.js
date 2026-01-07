/**
 * Input Sanitization with DOMPurify
 */

/* global DOMPurify */

const Sanitizer = {
  clean(dirty, config = {}) {
    try {
      if (!dirty || typeof dirty !== 'string') {
        return '';
      }
      
      if (typeof DOMPurify === 'undefined') {
        console.error('DOMPurify not loaded, using fallback sanitization');
        return dirty.replace(/[<>"'&]/g, '');
      }
      
      return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: config.tags || ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: config.attrs || ['href', 'title'],
        ...config
      });
    } catch (error) {
      console.error('Sanitization error:', error);
      return '';
    }
  },

  sanitizeForm(form) {
    try {
      if (!form) {
        throw new Error('Form element is required');
      }
      
      form.querySelectorAll('input[type="text"], textarea').forEach(input => {
        input.addEventListener('blur', () => {
          input.value = this.clean(input.value, { ALLOWED_TAGS: [] });
        });
      });
    } catch (error) {
      console.error('Form sanitization error:', error);
    }
  },

  sanitizeHTML(html) {
    return this.clean(html);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Sanitizer;
}
