@echo off
echo 🛑 Stopping HOOTNER agents while preserving dual Amazon Q and Copilot...
echo.

REM Kill specific agent processes but preserve dual AI
echo 📋 Checking for running agent processes...

REM Look for common agent process names
tasklist /FI "IMAGENAME eq node.exe" | findstr /I "agent" >nul
if %errorlevel% == 0 (
    echo ⚠️  Found Node.js processes that might be agents
) else (
    echo ✅ No obvious agent processes found
)

REM Kill processes with agent-related command lines (but preserve dual AI)
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq node.exe" /FO CSV ^| findstr /V "PID"') do (
    wmic process where "ProcessId=%%i" get CommandLine /format:list | findstr /I "agent" | findstr /V /I "amazon-q copilot dual-ai mcp" >nul
    if not errorlevel 1 (
        echo 🛑 Stopping agent process %%i
        taskkill /PID %%i /F >nul 2>&1
    )
)

echo.
echo ✅ Agent processes stopped (if any were running)
echo 🔒 Amazon Q and Copilot preserved for dual AI workflow
echo.
echo 🎯 Next steps:
echo    • Amazon Q and Copilot remain active
echo    • Use dual AI workflow for development  
echo    • Restart agents with: npm run agents:start
echo.
pause