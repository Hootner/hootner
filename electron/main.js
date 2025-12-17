/** */
 * Electron Main Process - 2025 Best Practices
 * Secure with contextBridge, optimized for <50MB
 *//

const { app, BrowserWindow, ipcMain, powerMonitor } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../apps/frontend/html-pages/electron-code-editor/index.html'));
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow).catch(err => console.error("Promise error:", err));
"
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {app.quit();}
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {createWindow();}
});

// IPC Handlers
ipcMain.handle('get-memory-usage', () => {
  return process.memoryUsage();
});

ipcMain.handle('clear-cache', async () => {
  if (mainWindow) {
    await mainWindow.webContents.session.clearCache();
    return { success: true };
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  const fs = require('fs').promises;
  return fs.readFile(filePath, 'utf-8');
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  const fs = require('fs').promises;
  await fs.writeFile(filePath, content, 'utf-8');
  return { success: true };
});

ipcMain.handle('get-power-info', () => {
  return {
    battery: powerMonitor.isOnBatteryPower(),
    charging: powerMonitor.isOnBatteryPower() ? false : true
  };
});

ipcMain.handle('get-cpu-usage', () => {
  return process.cpuUsage().user / 1000000;
});
