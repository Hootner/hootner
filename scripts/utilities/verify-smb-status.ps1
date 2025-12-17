# Verify SMB Status
Write-Host "`n=== SMB Service Status ===" -ForegroundColor Cyan
Get-Service LanmanServer | Format-List Status, StartType

Write-Host "`n=== Firewall Rules ===" -ForegroundColor Cyan
Get-NetFirewallRule -DisplayName "Block_SMB_445*" | Format-Table DisplayName, Enabled, Action

Write-Host "`n=== Port 445 Status ===" -ForegroundColor Cyan
$port445 = netstat -ano | findstr :445
if ($port445) {
    Write-Host "Port 445 is active:" -ForegroundColor Yellow
    $port445
} else {
    Write-Host "Port 445 is closed" -ForegroundColor Green
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
