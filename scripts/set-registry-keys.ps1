# Requires Administrator privileges
# Run as: powershell -ExecutionPolicy Bypass -File scripts\set-registry-keys.ps1

$ErrorActionPreference = "Stop"

Write-Host "Setting Windows Registry Keys..." -ForegroundColor Cyan

$basePath = "HKLM:\SOFTWARE\Classes\CLSID\{B2B4A4D1-2754-4140-A2EB-9A76D9D7CDC6}"

# Set main key default value
Set-ItemProperty -Path $basePath -Name "(Default)" -Value "Linux" -Force
Write-Host "Set main key default value" -ForegroundColor Green

# Set DefaultIcon
$iconPath = "$basePath\DefaultIcon"
if (-not (Test-Path $iconPath)) { New-Item -Path $iconPath -Force | Out-Null }
Set-ItemProperty -Path $iconPath -Name "(Default)" -Value "C:\Windows\System32\wsl.exe,-1" -Force
Write-Host "Set DefaultIcon" -ForegroundColor Green

# Set InProcServer32
$serverPath = "$basePath\InProcServer32"
if (-not (Test-Path $serverPath)) { New-Item -Path $serverPath -Force | Out-Null }
Set-ItemProperty -Path $serverPath -Name "(Default)" -Value "C:\Windows\System32\windows.storage.dll" -Force
Write-Host "Set InProcServer32" -ForegroundColor Green

Write-Host ""
Write-Host "All registry keys set successfully!" -ForegroundColor Green
Write-Host "Run 'npm run check:registry' to verify" -ForegroundColor Yellow
