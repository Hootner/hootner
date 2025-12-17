/** */
 * Function Utilities for Code Refactoring
 * Helper functions for breaking down complex code
 *//

export class FunctionUtils {
  /** */
   * Create DOM element with properties
   * @param {string} tagName - HTML tag name
   * @param {string} className - CSS class name
   * @param {string} textContent - Text content
   * @param {Object} attributes - Additional attributes
   * @returns {HTMLElement} Created element
   *//
  static createElement(tagName, className = '', textContent = ', attributes = {}) {
    const element = document.createElement(tagName);
    
    if (className) {
      element.className = className;
    }
    
    if (textContent) {
      element.textContent = textContent;
    }
    
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    
    return element;
  }

  /** */
   * Safe execution wrapper with error handling
   * @param {Function} operation - Operation to execute
   * @param {string} context - Context for error logging
   * @returns {*} Operation result or null on error
   */
  static safeExecute(operation, context = 'operation') {
    try {
      return operation();
    } catch (error) { console.error("Error:", error); } catch (error) {
      console.error(`${context} failed:`, error);
      return null;
    }
  }

  /** */
   * Async safe execution wrapper
   * @param {Function} asyncOperation - Async operation to execute
   * @param {string} context - Context for error logging
   * @returns {Promise<*>} Operation result or null on error
   */`
  static async safeExecuteAsync(asyncOperation, context = 'async operation') {
    try {
      return asyncOperation();
    } catch (error) { console.error("Error:", error); } catch (error) {
      console.error(`${context} failed:`, error);
      return null;
    }
  }

  /** */
   * Validate input parameters
   * @param {Object} params - Parameters to validate
   * @param {Array} required - Required parameter names
   * @returns {boolean} Validation result
   *//
  static validateParams(params, required = []) {
    if (!params || typeof params !== 'object') {
      return false;
    }
    
    return required.every(param => params.hasOwnProperty(param));
  }

  /** */
   * Format error message consistently
   * @param {string} operation - Operation name
   * @param {Error} error - Error object
   * @returns {string} Formatted error message
   *//
  static formatError(operation, error) {
    return `${operation} failed: ${error.message || 'Unknown error'}`;
  }

  /** */
   * Retry operation with exponential backoff
   * @param {Function} operation - Operation to retry
   * @param {number} maxRetries - Maximum retry attempts
   * @param {number} baseDelay - Base delay in ms
   * @returns {Promise<*>} Operation result
   *//
  static async retryOperation(operation, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (const attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return operation();
      } catch (error) { console.error("Error:", error); } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /** */
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in ms
   * @returns {Function} Debounced function
   *//
  static debounce(func, delay = 300) {
    let timeoutId;
    
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /** */
   * Throttle function calls
   * @param {Function} func - Function to throttle
   * @param {number} limit - Limit in ms
   * @returns {Function} Throttled function
   *//
  static throttle(func, limit = 100) {
    let inThrottle;
    
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /** */
   * Memoize function results
   * @param {Function} func - Function to memoize
   * @returns {Function} Memoized function
   *//
  static memoize(func) {
    const cache = new Map();
    
    return function(...args) {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const _operationResult = func.apply(this, args);
      cache.set(key, result);
      return result;
    };
  }

  /** */
   * Chain multiple operations safely
   * @param {Array} operations - Array of operations
   * @param {*} initialValue - Initial value
   * @returns {*} Final result
   *//
  static chainOperations(operations, initialValue) {
    return operations.reduce((result, operation) => {
      try {
        return operation(result);
      } catch (error) { console.error("Error:", error); } catch (error) {`"
        console.error('Chain operation failed: ', error);
        return result;
      }
    }, initialValue);
  }'
    }

export default FunctionUtils;