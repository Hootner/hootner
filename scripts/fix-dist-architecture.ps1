# HOOTNER Hub-and-Spoke Architecture Implementation
# For apps/frontend/dist directory

Write-Host "🦉 HOOTNER Hub-and-Spoke Architecture Implementation" -ForegroundColor Green
Write-Host "Target: apps/frontend/dist/" -ForegroundColor Cyan
Write-Host ""

$distPath = "apps\frontend\dist"

# List of all HTML pages in dist
$allPages = Get-ChildItem -Path $distPath -Filter "*.html" | Select-Object -ExpandProperty Name

Write-Host "📋 Found $($allPages.Count) HTML pages in dist/" -ForegroundColor Yellow
$allPages | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }

Write-Host "`n🔧 Step 1: Update non-dashboard pages to only link to dashboard..." -ForegroundColor Yellow

foreach ($page in $allPages) {
    if ($page -ne "dashboard.html") {
        $filePath = Join-Path $distPath $page
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        if ($content) {
            # Remove cross-page links (replace with dashboard.html)
            # But preserve dashboard.html links
            $updated = $false
            
            # List of pages to replace (all except dashboard)
            $pagesToReplace = $allPages | Where-Object { $_ -ne "dashboard.html" -and $_ -ne $page }
            
            foreach ($targetPage in $pagesToReplace) {
                $pattern = "href=[`"']/?$targetPage[`"']"
                if ($content -match $pattern) {
                    $content = $content -replace $pattern, 'href="dashboard.html"'
                    $updated = $true
                }
            }
            
            if ($updated) {
                Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
                Write-Host "   ✓ Updated $page (removed cross-page links)" -ForegroundColor Green
            }
        }
    }
}

Write-Host "`n✅ Hub-and-Spoke architecture implemented!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Architecture:" -ForegroundColor Cyan
Write-Host "   Hub: dashboard.html" -ForegroundColor Yellow
Write-Host "   Spokes: All other $($allPages.Count - 1) pages" -ForegroundColor Yellow
Write-Host "   Rule: Only dashboard → pages and pages → dashboard" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Next: Manually add navigation hub to dashboard.html" -ForegroundColor White
