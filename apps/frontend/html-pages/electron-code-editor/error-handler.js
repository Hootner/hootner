/* global UI_CONSTANTS */
import DOMPurify from 'dompurify';

class ErrorHandler { 
  constructor() { 
    this.errors = [];
    this.maxErrors = 100;
    this.listeners = new Set();
    this.setupGlobalHandlers(); 
  }

  setupGlobalHandlers() { 
    window.addEventListener('error', (event) => { 
      this.handleError({ 
        type: 'runtime',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error,
        timestamp: Date.now() 
      }); 
    });
    window.addEventListener('unhandledrejection', (event) => { 
      this.handleError({ 
        type: 'promise',
        message: event.reason?.message || String(event.reason),
        error: event.reason,
        timestamp: Date.now() 
      }); 
    }); 
  }

  handleError(errorInfo) { 
    try { 
      const error = { 
        id: Date.now() + Math.random(),
        ...errorInfo,
        stack: errorInfo.error?.stack || new Error().stack 
      };
      this.errors.unshift(error);
      if (this.errors.length > this.maxErrors) { 
        this.errors = this.errors.slice(0, this.maxErrors); 
      }
      this.notifyListeners(error);
      this.logError(error);
      if (error.type === 'critical') { 
        this.showCriticalError(error); 
      }
    } catch (e) { 
      console.error('Error handler failed:', e); 
    }
  }

  logError(error) { 
    const prefix = { 
      runtime: '🔴 Runtime Error:',
      promise: '⚠️ Unhandled Promise:',
      validation: '⚡ Validation Error:',
      network: '🌐 Network Error:',
      file: '📁 File Error:',
      lsp: '🔧 LSP Error:',
      monaco: '📝 Editor Error:',
      critical: '💥 Critical Error:' 
    }[error.type] || '❌ Error:';
    console.error(prefix, error.message);
    if (error.stack) console.error(error.stack);
  }

  notifyListeners(error) { 
    this.listeners.forEach(listener => { 
      try { 
        listener(error); 
      } catch (e) { 
        console.error('Listener error:', e); 
      } 
    }); 
  }

  showCriticalError(error) { 
    try {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #d32f2f; color: white;
        padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000; max-width: 400px; animation: slideIn 0.3s ease;
      `;
      notification.innerHTML = DOMPurify.sanitize(`
        <div style="display: flex; align-items: start; gap: 12px;">
          <span style="font-size: 24px;">💥</span>
          <div style="flex: 1;">
            <strong style="display: block; margin-bottom: 4px;">Critical Error</strong>
            <div style="font-size: 14px; opacity: 0.9;">${this.escapeHtml(error.message)}</div>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" 
                  style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0;">×</button>
        </div>
      `);
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);
    } catch (e) {
      console.error('Show critical error failed:', e);
    }
  }

  showNotification(message, type = 'info') { 
    try {
      const colors = { info: '#2196F3', success: '#4CAF50', warning: '#FF9800', error: '#f44336' };
      const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: ${colors[type]}; color: white;
        padding: 12px 20px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 9999; animation: slideIn 0.3s ease;
      `;
      notification.innerHTML = DOMPurify.sanitize(`
        <div style="display: flex; align-items: center; gap: 10px;">
          <span>${icons[type]}</span>
          <span>${this.escapeHtml(message)}</span>
          <button onclick="this.parentElement.parentElement.remove()" 
                  style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: 8px;">×</button>
        </div>
      `);
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (e) {
      console.error('Show notification failed:', e);
    }
  }

  escapeHtml(text) { 
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML; 
  }

  addListener(callback) { 
    this.listeners.add(callback);
    return () => this.listeners.delete(callback); 
  }

  getErrors(filter = {}) { 
    let filtered = this.errors;
    if (filter.type) { 
      filtered = filtered.filter(e => e.type === filter.type); 
    }
    if (filter.since) { 
      filtered = filtered.filter(e => e.timestamp >= filter.since); 
    }
    return filtered; 
  }

  clearErrors() { 
    this.errors = [];
    this.notifyListeners({ type: 'cleared' }); 
  }

  async tryCatch(fn, context = 'operation') { 
    try { 
      return await fn(); 
    } catch (error) { 
      this.handleError({ 
        type: 'runtime',
        message: `${context}: ${error.message}`,
        error,
        timestamp: Date.now() 
      });
      throw error; 
    }
  }

  validateFile(filename) { 
    const errors = [];
    if (!filename || typeof filename !== 'string') { 
      errors.push('Filename must be a non-empty string'); 
    } else { 
      if (filename.length > 255) { 
        errors.push('Filename too long (max 255 characters)'); 
      }
      if (/[<>:"|?*]/.test(filename)) { 
        errors.push('Filename contains invalid characters'); 
      }
    }
    if (errors.length > 0) { 
      return { valid: false, errors }; 
    }
    return { valid: true, errors: [] }; 
  }

  validateCode(code, language) { 
    try { 
      if (!code || typeof code !== 'string') { 
        throw new Error('Code must be a non-empty string'); 
      }
      if (code.length > 10 * 1024 * 1024) { 
        throw new Error('Code size exceeds 10MB limit'); 
      }
      if (language === 'javascript') { 
        try { 
          new Function(code); 
        } catch (e) { 
          return { valid: false, error: e.message }; 
        }
      }
      return { valid: true }; 
    } catch (error) { 
      this.handleError({ 
        type: 'validation',
        message: `Code validation failed: ${error.message}`,
        timestamp: Date.now() 
      });
      return { valid: false, error: error.message }; 
    }
  }

  async withRetry(fn, options = {}) { 
    const { maxRetries = 3, delay = 1000, backoff = 2, context = 'operation' } = options;
    let lastError;
    for (let i = 0; i < maxRetries; i++) { 
      try { 
        return await fn(); 
      } catch (error) { 
        lastError = error;
        if (i < maxRetries - 1) { 
          const waitTime = delay * Math.pow(backoff, i);
          console.warn(`${context} failed, retrying in ${waitTime}ms... (${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime)); 
        } 
      }
    }
    this.handleError({ 
      type: 'runtime',
      message: `${context} failed after ${maxRetries} retries: ${lastError.message}`,
      error: lastError,
      timestamp: Date.now() 
    });
    throw lastError; 
  }

  async withTimeout(fn, timeout = 5000, context = 'operation') { 
    try {
      return await Promise.race([
        fn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`${context} timed out after ${timeout}ms`)), timeout)
        )
      ]);
    } catch (error) { 
      this.handleError({ 
        type: 'runtime',
        message: error.message,
        error,
        timestamp: Date.now() 
      });
      throw error; 
    }
  }

  getErrorStats() { 
    const stats = { 
      total: this.errors.length,
      byType: {},
      recent: this.errors.slice(0, 10) 
    };
    this.errors.forEach(error => { 
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1; 
    });
    return stats; 
  }
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn { 
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(style);

if (typeof module !== 'undefined' && module.exports) { module.exports = ErrorHandler; }
