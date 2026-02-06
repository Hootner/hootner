@echo off
:: Check for admin rights
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with admin rights...
    reg add "HKLM\SOFTWARE\Classes\CLSID\{B2B4A4D1-2754-4140-A2EB-9A76D9D7CDC6}" /ve /d "Linux" /f
    reg add "HKLM\SOFTWARE\Classes\CLSID\{B2B4A4D1-2754-4140-A2EB-9A76D9D7CDC6}\DefaultIcon" /ve /d "C:\Windows\System32\wsl.exe,-1" /f
    reg add "HKLM\SOFTWARE\Classes\CLSID\{B2B4A4D1-2754-4140-A2EB-9A76D9D7CDC6}\InProcServer32" /ve /d "C:\Windows\System32\windows.storage.dll" /f
    echo.
    echo Done! Verifying...
    node scripts\check-registry.js
    pause
) else (
    echo Requesting admin rights...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
)
