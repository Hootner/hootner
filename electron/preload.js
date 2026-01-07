/**
 * Electron Preload - Secure contextBridge API
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', { getMemoryUsage: () => ipcRenderer.invoke('get-memory-usage'),
  clearCache: () => ipcRenderer.invoke('clear-cache'),
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  writeFile: (path, content) => ipcRenderer.invoke('write-file', path, content),
  getPowerInfo: () => ipcRenderer.invoke('get-power-info'),
  getCPUUsage: () => ipcRenderer.invoke('get-cpu-usage') });
