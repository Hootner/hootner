Write-Host "🦉 HOOTNER Day 1 - Proving the owl flies...`n" -ForegroundColor Cyan

# Check Node
$nodeVersion = (node -v).Substring(1).Split('.')[0]
if ([int]$nodeVersion -lt 18) { throw "Node $nodeVersion found. Need 18+" }
Write-Host "✓ Node.js $(node -v)" -ForegroundColor Green

# Check Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) { throw "Docker not found" }
Write-Host "✓ Docker installed" -ForegroundColor Green

# Check Docker running
docker ps 2>$null
if ($LASTEXITCODE -ne 0) { throw "Docker not running" }
Write-Host "✓ Docker running" -ForegroundColor Green

# Start infrastructure
Write-Host "`n📦 Starting MongoDB + Redis..." -ForegroundColor Yellow
docker-compose up -d

# Install dependencies
if (!(Test-Path "node_modules")) {
    Write-Host "`n📥 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

if (!(Test-Path "api\graphql\node_modules")) {
    Write-Host "📥 Installing API dependencies..." -ForegroundColor Yellow
    Push-Location api\graphql
    npm install
    Pop-Location
}

# Start services
Write-Host "`n🚀 Starting frontend + GraphQL API...`n" -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "`n✨ HOOTNER is ready!`n" -ForegroundColor Green
Write-Host "🔗 Key URLs:" -ForegroundColor Cyan
Write-Host "   Login:      http://localhost:3001"
Write-Host "   Dashboard:  http://localhost:3005"
Write-Host "   Player:     http://localhost:3001/video-player"
Write-Host "   GraphQL:    http://localhost:4000/graphql"
Write-Host "`n🦉 The owl is flying. Press Ctrl+C to stop.`n" -ForegroundColor Cyan

npm run start:all
