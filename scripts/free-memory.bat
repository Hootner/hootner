@echo off
echo Freeing up memory...

REM Kill memory-heavy processes (safe ones)
echo Stopping Chrome/Edge background processes...
taskkill /F /IM chrome.exe /T 2>nul
taskkill /F /IM msedge.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul

REM Clear temp files
echo Clearing temp files...
del /q/f/s "%TEMP%\*" 2>nul
del /q/f/s "C:\Windows\Temp\*" 2>nul

REM Clear npm cache
echo Clearing npm cache...
npm cache clean --force 2>nul

REM Empty recycle bin
echo Emptying recycle bin...
rd /s /q %systemdrive%\$Recycle.bin 2>nul

REM Clear DNS cache
echo Clearing DNS cache...
ipconfig /flushdns >nul

echo.
echo Done! Memory freed.
echo Restart your computer for best results.
pause
