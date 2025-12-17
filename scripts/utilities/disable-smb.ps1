# Disable and Block SMB Port 445
# Run as Administrator

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: Must run as Administrator!" -ForegroundColor Red
    exit 1
}

Write-Host "=== Disabling SMB Port 445 ===" -ForegroundColor Cyan

# Remove existing rules
Remove-NetFirewallRule -DisplayName "Block_SMB_445_Inbound" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Block_SMB_445_Outbound" -ErrorAction SilentlyContinue

# Stop and disable SMB Server
Write-Host "Stopping SMB Server..." -ForegroundColor Yellow
Stop-Service -Name LanmanServer -Force -ErrorAction SilentlyContinue
Set-Service -Name LanmanServer -StartupType Disabled

# Block port 445
Write-Host "Blocking port 445..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "Block_SMB_445_Inbound" -Direction Inbound -LocalPort 445 -Protocol TCP -Action Block | Out-Null
New-NetFirewallRule -DisplayName "Block_SMB_445_Outbound" -Direction Outbound -LocalPort 445 -Protocol TCP -Action Block | Out-Null

Write-Host "`nSUCCESS: SMB disabled and port 445 blocked!" -ForegroundColor Green

# Verify
Write-Host "`nChecking port 445..." -ForegroundColor Yellow
$port445 = netstat -ano | findstr :445
if ($port445) {
    Write-Host "Port 445 still active (restart required)" -ForegroundColor Yellow
} else {
    Write-Host "Port 445 is closed" -ForegroundColor Green
}

Write-Host "`nRESTART YOUR COMPUTER for full effect." -ForegroundColor Cyan
