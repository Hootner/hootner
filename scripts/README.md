# Server Management Scripts

This directory contains scripts to manage all HOOTNER servers.

## Available Scripts

### Start All Servers

#### Node.js Script (Cross-platform)
```bash
npm run start:all
# or
node scripts/start-all-servers.js
```

#### Windows Batch File
```cmd
npm run start:all:win
# or
scripts/start-all-servers.bat
```

#### Linux/macOS Shell Script
```bash
./scripts/start-all-servers.sh
```

## Server Configuration

The scripts will start the following servers:

| Server Name | Script | Default Port | URL |
|-------------|--------|--------------|-----|
| Main Server | `server.js` | 3000 | http://localhost:3000 |
| MCP Server | `servers/mcp-server.js` | 3001 | http://localhost:3001 |
| Collaboration Server | `servers/collab-server.js` | 3002 | http://localhost:3002 |
| Electron Code Editor Server | `servers/electron-code-editor-server.js` | 3003 | http://localhost:3003 |
| HTML Pages Server | `servers/html-pages-server.js` | 3004 | http://localhost:3004 |
| Hub App Server | `servers/hub-app.js` | 3005 | http://localhost:3005 |
| Secure Server | `servers/secure-server.js` | 3006 | http://localhost:3006 |
| Video Player Server | `servers/video-player-server.js` | 3007 | http://localhost:3007 |
| HOOTNER MCP Server | `servers/hootner-mcp-server.js` | 3008 | http://localhost:3008 |

## Features

- **Graceful Shutdown**: Press Ctrl+C to stop all servers gracefully
- **Color-coded Output**: Each server has its own color for easy identification
- **Error Handling**: Skips servers that don't exist and reports errors
- **Port Configuration**: Each server runs on its own port to avoid conflicts
- **Process Management**: Tracks all server processes for proper cleanup

## Environment Variables

The scripts will use the following environment variables:

- `NODE_ENV`: Set to 'development' by default
- `PORT`: Overridden for each server to avoid conflicts

## Stopping Servers

### Graceful Stop
Press `Ctrl+C` in the terminal where the script is running.

### Force Stop (Windows)
```cmd
taskkill /f /im node.exe
```

### Force Stop (Linux/macOS)
```bash
pkill -f node
```

## Troubleshooting

1. **Port Already in Use**: If a port is already in use, the server will fail to start. Check for other running processes.

2. **Missing Server Files**: The script will skip servers whose files don't exist and show a warning.

3. **Permission Issues**: On Linux/macOS, make sure the shell script is executable:
   ```bash
   chmod +x scripts/start-all-servers.sh
   ```

4. **Node.js Version**: Ensure you're using Node.js 18+ as specified in package.json engines.

## Customization

To add or modify servers, edit the `servers` array in the respective script files:

- `scripts/start-all-servers.js` - Node.js version
- `scripts/start-all-servers.bat` - Windows batch version
- `scripts/start-all-servers.sh` - Linux/macOS shell version
