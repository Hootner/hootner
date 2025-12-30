/**
 * Offline storage utilities
 */

const storage = {
  async getItem(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  async setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  async removeItem(key) {
    localStorage.removeItem(key);
  },

  async clear() {
    localStorage.clear();
  },

  async keys() {
    return Object.keys(localStorage);
  },

  async length() {
    return localStorage.length;
  }
};

// IndexedDB fallback for larger data
const db = {
  name: 'hootner-db',
  version: 1,

  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('store')) {
          db.createObjectStore('store');
        }
      };
    });
  },

  async get(key) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('store', 'readonly');
      const request = tx.objectStore('store').get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async set(key, value) {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('store', 'readwrite');
      const request = tx.objectStore('store').put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};

if (typeof module !== 'undefined') module.exports = { storage, db };
