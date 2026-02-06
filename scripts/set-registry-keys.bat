@echo off
echo Setting registry keys...
reg add "HKLM\SOFTWARE\Classes\CLSID\{B2B4A4D1-2754-4140-A2EB-9A76D9D7CDC6}" /ve /d "Linux" /f
reg add "HKLM\SOFTWARE\Classes\CLSID\{B2B4A4D1-2754-4140-A2EB-9A76D9D7CDC6}\DefaultIcon" /ve /d "C:\Windows\System32\wsl.exe,-1" /f
reg add "HKLM\SOFTWARE\Classes\CLSID\{B2B4A4D1-2754-4140-A2EB-9A76D9D7CDC6}\InProcServer32" /ve /d "C:\Windows\System32\windows.storage.dll" /f
echo Done! Press any key to verify...
pause
node scripts\check-registry.js
pause
