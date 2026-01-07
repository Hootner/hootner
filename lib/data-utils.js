/**
 * Data manipulation utilities
 */

const _ = { chunk: (arr, size) => { const chunks = [];
    for (let i = 0; i < arr.length; i += size) { chunks.push(arr.slice(i, i + size)); }
    return chunks; },

  debounce: (fn, delay) => { let timer;
    return (...args) => { clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay); }; },

  throttle: (fn, limit) => { let inThrottle;
    return (...args) => { if (!inThrottle) { fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit); } }; },

  groupBy: (arr, key) => { return arr.reduce((acc, item) => { const group = typeof key === 'function' ? key(item) : item[key];
      (acc[group] = acc[group] || []).push(item);
      return acc; }, {}); },

  uniq: (arr) => [...new Set(arr)],

  flatten: (arr) => arr.flat(Infinity),

  pick: (obj, keys) => { return keys.reduce((acc, key) => { if (key in obj) acc[key] = obj[key];
      return acc; }, {}); },

  omit: (obj, keys) => { const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result; } };

if (typeof module !== 'undefined') module.exports = _;
