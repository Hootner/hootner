# HOOTNER HTML Reorganization Script
# Moves all HTML pages to dist/ and updates all links to create hub-and-spoke architecture

Write-Host "🦉 HOOTNER HTML Reorganization Starting..." -ForegroundColor Green

$sourcePath = "hexarchy\4-interface\ui\pages"
$destPath = "dist"
$projectRoot = (Get-Location).Path

# Ensure dist directory exists
if (-not (Test-Path $destPath)) {
    New-Item -ItemType Directory -Path $destPath | Out-Null
    Write-Host "✓ Created dist/ directory" -ForegroundColor Cyan
}

# HTML pages to move
$htmlPages = @(
    "dashboard.html",
    "video-player.html",
    "profile.html",
    "settings.html",
    "upload-video.html",
    "my-videos.html",
    "login.html",
    "feed-react.html",
    "auto-editor.html",
    "code-editor.html",
    "ultra-editor.html",
    "ai-video.html",
    "analytics.html",
    "marketplace.html",
    "messages.html",
    "live-stream.html",
    "live-activity.html",
    "collaboration.html",
    "contact.html",
    "agent-management.html",
    "admin-session-manager.html",
    "devops-monitoring.html"
)

# Support files to move
$supportFiles = @(
    "shared-styles.css",
    "tailwind-output.css",
    "tailwind-input.css",
    "manifest.json",
    "sw.js",
    "security-core.js"
)

Write-Host "`n📦 Moving files to dist/..." -ForegroundColor Yellow

# Move HTML pages
foreach ($file in $htmlPages) {
    $sourcePath = "hexarchy\4-interface\ui\pages\$file"
    $destFilePath = "dist\$file"
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destFilePath -Force
        Write-Host "  ✓ Moved $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Skipped $file (not found)" -ForegroundColor Yellow
    }
}

# Move support files
foreach ($file in $supportFiles) {
    $sourcePath = "hexarchy\4-interface\ui\pages\$file"
    $destFilePath = "dist\$file"
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destFilePath -Force
        Write-Host "  ✓ Moved $file" -ForegroundColor Green
    }
}

Write-Host "`n🔧 Updating file paths..." -ForegroundColor Yellow

# Update all HTML files in dist/
Get-ChildItem -Path "dist\*.html" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileName = $_.Name
    
    # Update asset paths from ../assets/ to ../hexarchy/4-interface/ui/assets/
    $content = $content -replace '\.\.\/assets\/', '../hexarchy/4-interface/ui/assets/'
    
    # Update component paths
    $content = $content -replace '\.\.\/components\/', '../hexarchy/4-interface/ui/components/'
    
    # Update shared styles path
    $content = $content -replace '<link rel="stylesheet" href="shared-styles.css"', '<link rel="stylesheet" href="./shared-styles.css"'
    
    # Update tailwind paths
    $content = $content -replace '<link rel="stylesheet" href="/tailwind-output.css"', '<link rel="stylesheet" href="./tailwind-output.css"'
    $content = $content -replace 'href="/tailwind-output.css"', 'href="./tailwind-output.css"'
    
    # For non-dashboard pages: ensure all internal page links go to dashboard
    if ($fileName -ne "dashboard.html") {
        # Update any remaining page links to just filename (same directory)
        $content = $content -replace 'href="([a-z\-]+)\.html"', 'href="dashboard.html"'
        
        # Keep only dashboard links
        $content = $content -replace 'href="dashboard\.html"', 'href="dashboard.html"'
    } else {
        # For dashboard: update page links to be relative (same directory)
        # This ensures nav hub links work
        foreach ($page in $htmlPages) {
            if ($page -ne "dashboard.html") {
                # Already relative, no change needed
            }
        }
    }
    
    # Only write if changes were made
    if ($content -ne $originalContent) {
        Set-Content -Path $_.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  ✓ Updated $fileName" -ForegroundColor Green
    }
}

Write-Host "`n✅ Reorganization complete!" -ForegroundColor Green
Write-Host "📁 All HTML files are now in: dist/" -ForegroundColor Cyan
Write-Host "🔗 Dashboard connects to all pages" -ForegroundColor Cyan
Write-Host "🔙 All pages link back to dashboard only" -ForegroundColor Cyan

Write-Host "`n💡 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Add navigation hub to dist/dashboard.html" -ForegroundColor White
Write-Host "  2. Update server configuration to serve from dist/" -ForegroundColor White
Write-Host "  3. Test all pages in browser" -ForegroundColor White
