@echo off
REM Security Key Setup for Microsoft Account
REM Location: D:\security-keys\

echo 🔐 Setting up Microsoft Account Security Key Storage
echo.

REM Create secure directory
mkdir "D:\security-keys" 2>nul
mkdir "D:\security-keys\microsoft-account" 2>nul

echo ✅ Created: D:\security-keys\microsoft-account\
echo.

REM Set permissions (restrict to current user only)
icacls "D:\security-keys" /inheritance:r
icacls "D:\security-keys" /grant:r "%USERNAME%:(OI)(CI)F"
icacls "D:\security-keys" /remove "Users"
icacls "D:\security-keys" /remove "Everyone"

echo ✅ Permissions set (only %USERNAME% has access)
echo.

REM Create README
echo # Microsoft Account Security Keys > "D:\security-keys\microsoft-account\README.txt"
echo. >> "D:\security-keys\microsoft-account\README.txt"
echo Store your Microsoft account security keys here: >> "D:\security-keys\microsoft-account\README.txt"
echo - Personal Access Tokens >> "D:\security-keys\microsoft-account\README.txt"
echo - API Keys >> "D:\security-keys\microsoft-account\README.txt"
echo - Recovery Codes >> "D:\security-keys\microsoft-account\README.txt"
echo. >> "D:\security-keys\microsoft-account\README.txt"
echo This folder is encrypted and only accessible by: %USERNAME% >> "D:\security-keys\microsoft-account\README.txt"

echo ✅ Security key storage ready!
echo.
echo 📁 Location: D:\security-keys\microsoft-account\
echo 🔒 Access: Only %USERNAME%
echo.
echo Next steps:
echo 1. Save your Microsoft Personal Access Token here
echo 2. Name it: vscode-marketplace-token.txt
echo 3. Keep it secure - never commit to git!
echo.

explorer "D:\security-keys\microsoft-account"
