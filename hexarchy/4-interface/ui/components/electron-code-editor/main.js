/**
 * HOOTNER Code Editor - Main Electron Process
 * Enterprise-grade code editor with AI integration
 */

const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let aiAssistantWindow;

class HootnerCodeEditor {
  constructor() {
    this.windows = new Map();
    this.config = {
      width: 1400,
      height: 900,
      minWidth: 800,
      minHeight: 600
    };
  }

  createMainWindow() {
    mainWindow = new BrowserWindow({
      ...this.config,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
      icon: path.join(__dirname, 'assets/icon.png'),
      title: 'HOOTNER Code Editor',
      titleBarStyle: 'hiddenInset',
      show: false
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Show when ready
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      console.log('🦉 HOOTNER Code Editor ready');
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
      this.windows.delete('main');
    });

    this.windows.set('main', mainWindow);
    return mainWindow;
  }

  createAIAssistantWindow() {
    aiAssistantWindow = new BrowserWindow({
      width: 400,
      height: 600,
      parent: mainWindow,
      modal: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'ai-preload.js')
      },
      title: 'AI Assistant',
      show: false
    });

    aiAssistantWindow.loadFile(path.join(__dirname, 'ai-assistant.html'));
    
    aiAssistantWindow.on('closed', () => {
      aiAssistantWindow = null;
      this.windows.delete('ai');
    });

    this.windows.set('ai', aiAssistantWindow);
    return aiAssistantWindow;
  }

  setupMenu() {
    const template = [
      {
        label: 'File',
        submenu: [
          { label: 'New File', accelerator: 'CmdOrCtrl+N', click: () => this.sendToRenderer('file:new') },
          { label: 'Open File', accelerator: 'CmdOrCtrl+O', click: () => this.sendToRenderer('file:open') },
          { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => this.sendToRenderer('file:save') },
          { type: 'separator' },
          { label: 'Exit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
          { label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
          { type: 'separator' },
          { label: 'Find', accelerator: 'CmdOrCtrl+F', click: () => this.sendToRenderer('edit:find') },
          { label: 'Replace', accelerator: 'CmdOrCtrl+H', click: () => this.sendToRenderer('edit:replace') }
        ]
      },
      {
        label: 'AI',
        submenu: [
          { label: 'Chat Mode', accelerator: 'CmdOrCtrl+K', click: () => this.sendToRenderer('ai:chat') },
          { label: 'Write Mode', accelerator: 'CmdOrCtrl+L', click: () => this.sendToRenderer('ai:write') },
          { label: 'Code Review', accelerator: 'CmdOrCtrl+R', click: () => this.sendToRenderer('ai:review') },
          { type: 'separator' },
          { label: 'Show AI Assistant', click: () => this.toggleAIAssistant() }
        ]
      },
      {
        label: 'View',
        submenu: [
          { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' },
          { label: 'Developer Tools', accelerator: 'F12', role: 'toggleDevTools' }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  setupIPC() {
    // File operations
    ipcMain.handle('file:read', async (event, filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        return { success: true, content };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('file:write', async (event, filePath, content) => {
      try {
        fs.writeFileSync(filePath, content, 'utf8');
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // AI operations
    ipcMain.handle('ai:analyze', async (event, code) => {
      return this.analyzeCode(code);
    });

    ipcMain.handle('ai:refactor', async (event, code, type) => {
      return this.refactorCode(code, type);
    });

    // Window management
    ipcMain.on('window:minimize', () => mainWindow?.minimize());
    ipcMain.on('window:maximize', () => {
      if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow?.maximize();
      }
    });
    ipcMain.on('window:close', () => mainWindow?.close());
  }

  sendToRenderer(channel, data) {
    mainWindow?.webContents.send(channel, data);
  }

  toggleAIAssistant() {
    if (aiAssistantWindow) {
      if (aiAssistantWindow.isVisible()) {
        aiAssistantWindow.hide();
      } else {
        aiAssistantWindow.show();
      }
    } else {
      this.createAIAssistantWindow();
      aiAssistantWindow.show();
    }
  }

  // AI Code Analysis
  analyzeCode(code) {
    const issues = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Security checks
      if (line.includes('eval(')) {
        issues.push({ line: lineNum, type: 'security', severity: 'high', message: 'Avoid using eval() - security risk' });
      }
      
      // Performance checks
      if (line.includes('document.getElementById') && line.includes('loop')) {
        issues.push({ line: lineNum, type: 'performance', severity: 'medium', message: 'Cache DOM queries outside loops' });
      }
      
      // Best practices
      if (line.includes('var ') && !line.includes('//')) {
        issues.push({ line: lineNum, type: 'style', severity: 'low', message: 'Use const/let instead of var' });
      }
      
      if (line.includes('console.log') && !line.includes('//')) {
        issues.push({ line: lineNum, type: 'cleanup', severity: 'low', message: 'Remove console.log in production' });
      }
    });

    const stats = {
      lines: lines.length,
      functions: (code.match(/function\s+\w+/g) || []).length,
      classes: (code.match(/class\s+\w+/g) || []).length,
      complexity: Math.min(10, Math.floor(lines.length / 20) + issues.length)
    };

    return {
      success: true,
      issues,
      stats,
      score: Math.max(0, 100 - (issues.length * 5))
    };
  }

  // AI Code Refactoring
  refactorCode(code, type) {
    let refactored = code;
    const changes = [];

    switch (type) {
      case 'modernize':
        refactored = refactored
          .replace(/var\s+/g, 'const ')
          .replace(/function\s+(\w+)\s*\(/g, 'const $1 = (')
          .replace(/\.then\(/g, ' await ');
        changes.push('Converted to modern ES6+ syntax');
        break;
        
      case 'optimize':
        refactored = refactored
          .replace(/document\.getElementById\(([^)]+)\)/g, 'document.querySelector(`#${$1}`)')
          .replace(/for\s*\(\s*var\s+i\s*=\s*0/g, 'for (let i = 0');
        changes.push('Applied performance optimizations');
        break;
        
      case 'cleanup':
        refactored = refactored
          .replace(/console\.log\([^)]*\);?\n?/g, '')
          .replace(/\n\s*\n\s*\n/g, '\n\n')
          .replace(/\s+$/gm, '');
        changes.push('Cleaned up code');
        break;
    }

    return {
      success: true,
      code: refactored,
      changes,
      type
    };
  }

  async start() {
    await app.whenReady();
    
    this.createMainWindow();
    this.setupMenu();
    this.setupIPC();
    
    console.log('🚀 HOOTNER Code Editor started');
  }
}

// Application lifecycle
const editor = new HootnerCodeEditor();

app.whenReady().then(() => {
  editor.start();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      editor.createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
  
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
});

module.exports = HootnerCodeEditor;
