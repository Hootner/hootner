@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting HOOTNER servers...
echo.

:: Set environment variables
set NODE_ENV=development

:: Array of servers (name:script:port)
set servers[0]=Main Server:server.js:3000
set servers[1]=MCP Server:servers/mcp-server.js:3001
set servers[2]=Collaboration Server:servers/collab-server.js:3002
set servers[3]=Electron Code Editor Server:servers/electron-code-editor-server.js:3003
set servers[4]=HTML Pages Server:servers/html-pages-server.js:3004
set servers[5]=Hub App Server:servers/hub-app.js:3005
set servers[6]=Secure Server:servers/secure-server.js:3006
set servers[7]=Video Player Server:servers/video-player-server.js:3007
set servers[8]=HOOTNER MCP Server:servers/hootner-mcp-server.js:3008

:: Start each server
for /L %%i in (0,1,8) do (
    if defined servers[%%i] (
        for /f "tokens=1,2,3 delims=:" %%a in ("!servers[%%i]!") do (
            echo 🔄 Starting %%a on port %%c...

            :: Check if file exists
            if exist "%%b" (
                start "%%a" cmd /k "set PORT=%%c && node %%b"
                timeout /t 2 /nobreak >nul
            ) else (
                echo ⚠️  %%a script not found: %%b
            )
        )
    )
)

echo.
echo 🎉 All servers started!
echo.
echo 📊 Server URLs:
echo   Main Server: http://localhost:3000
echo   MCP Server: http://localhost:3001
echo   Collaboration Server: http://localhost:3002
echo   Electron Code Editor Server: http://localhost:3003
echo   HTML Pages Server: http://localhost:3004
echo   Hub App Server: http://localhost:3005
echo   Secure Server: http://localhost:3006
echo   Video Player Server: http://localhost:3007
echo   HOOTNER MCP Server: http://localhost:3008
echo.
echo Press any key to stop all servers...
pause >nul

echo.
echo 🛑 Stopping all servers...
taskkill /f /fi "WindowTitle eq Main Server*" >nul 2>&1
taskkill /f /fi "WindowTitle eq MCP Server*" >nul 2>&1
taskkill /f /fi "WindowTitle eq Collaboration Server*" >nul 2>&1
taskkill /f /fi "WindowTitle eq Electron Code Editor Server*" >nul 2>&1
taskkill /f /fi "WindowTitle eq HTML Pages Server*" >nul 2>&1
taskkill /f /fi "WindowTitle eq Hub App Server*" >nul 2>&1
taskkill /f /fi "WindowTitle eq Secure Server*" >nul 2>&1
taskkill /f /fi "WindowTitle eq Video Player Server*" >nul 2>&1
taskkill /f /fi "WindowTitle eq HOOTNER MCP Server*" >nul 2>&1

echo ✅ All servers stopped.
pause
