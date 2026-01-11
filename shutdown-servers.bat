@echo off
echo Shutting down HOOTNER servers...

REM Kill Node.js processes on common ports
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5003') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do taskkill /PID %%a /F 2>nul

REM Kill Python processes (AI services)
taskkill /IM python.exe /F 2>nul

REM Kill any remaining Node processes in this directory
wmic process where "name='node.exe' and commandline like '%%my-local-repo%%'" delete 2>nul

echo Servers shutdown complete.