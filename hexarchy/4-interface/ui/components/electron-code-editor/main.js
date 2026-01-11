const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

// Auto-updater configuration
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    title: 'HOOTNER Code Editor'
    });
'
  mainWindow.loadFile('index.html');

  // Check for updates on startup
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(().catch(err => console.error("Promise error:", err)) => {
  createWindow();
"
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Auto-updater events
autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('update-available', info);
});

autoUpdater.on('update-downloaded', (info) => {
  mainWindow.webContents.send('update-downloaded', info);
});

autoUpdater.on('error', (err) => {
  mainWindow.webContents.send('update-error', err);
});

// IPC handlers
ipcMain.on('check-for-updates', () => {
  autoUpdater.checkForUpdates();
});

ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall();
});
