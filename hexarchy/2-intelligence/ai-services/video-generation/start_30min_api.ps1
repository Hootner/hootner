# Start 30-Minute AI Video Generation API
# Author: HOOTNER AI Platform
# Date: January 23, 2026

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "🎬 Starting 30-Minute AI Video Generation API" -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Cyan

# Check Python installation
Write-Host "📋 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   ✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check dependencies
Write-Host "`n📦 Checking dependencies..." -ForegroundColor Yellow
$requiredPackages = @("flask", "torch", "numpy", "pillow")

foreach ($package in $requiredPackages) {
    try {
        python -c "import $package" 2>$null
        Write-Host "   ✓ $package installed" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ $package not found. Installing..." -ForegroundColor Yellow
        pip install $package
    }
}

# Set environment variables
Write-Host "`n🔧 Configuring environment..." -ForegroundColor Yellow
$env:ENVIRONMENT = "development"
$env:FLASK_APP = "long_video_api.py"
$env:FLASK_ENV = "development"
Write-Host "   ✓ Environment: $env:ENVIRONMENT" -ForegroundColor Green

# Create required directories
Write-Host "`n📁 Creating directories..." -ForegroundColor Yellow
$dirs = @(
    ".\outputs\long_form",
    ".\analytics",
    ".\checkpoints"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   ✓ Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "   ✓ Exists: $dir" -ForegroundColor Green
    }
}

# Start the API
Write-Host "`n🚀 Starting API server on port 5004..." -ForegroundColor Yellow
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📡 API Endpoints:" -ForegroundColor White
Write-Host "   POST http://localhost:5004/api/v1/long-form/generate" -ForegroundColor Cyan
Write-Host "   GET  http://localhost:5004/api/v1/long-form/progress/<job_id>" -ForegroundColor Cyan
Write-Host "   GET  http://localhost:5004/api/v1/long-form/download/<job_id>" -ForegroundColor Cyan
Write-Host ("=" * 60) + "`n" -ForegroundColor Cyan

Write-Host "💡 Example Request:" -ForegroundColor Yellow
Write-Host @"
curl -X POST http://localhost:5004/api/v1/long-form/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cinematic journey through space with nebulas and stars",
    "duration_minutes": 30,
    "resolution": "4k",
    "quality": "high",
    "hdr_enabled": true
  }'
"@ -ForegroundColor White

Write-Host "`n🔄 Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

# Start the server
python long_video_api.py
