# Install New Outlook for Windows

Write-Host "Installing New Outlook for Windows..." -ForegroundColor Cyan

# Install via winget
winget install --id 9NRX63209R7B --source msstore --accept-package-agreements --accept-source-agreements

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Installation complete!" -ForegroundColor Green
} else {
    Write-Host "Opening Microsoft Store..." -ForegroundColor Yellow
    Start-Process "ms-windows-store://pdp/?ProductId=9NRX63209R7B"
}
