@echo off
echo Cleaning for fresh deploy...

rmdir /s /q node_modules 2>nul
rmdir /s /q data\logs 2>nul
rmdir /s /q data\uploads 2>nul
rmdir /s /q data\usage 2>nul
rmdir /s /q .aws 2>nul
rmdir /s /q dist 2>nul
rmdir /s /q build 2>nul
rmdir /s /q coverage 2>nul
del /q *.log 2>nul
del /q .env.local 2>nul

echo Done! Run: npm install && npm run aws:onboard
pause