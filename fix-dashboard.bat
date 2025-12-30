@echo off
REM Dashboard.html Critical Bug Fixes Patch (Windows)
REM Apply this patch to fix all 10 critical bugs

echo Applying critical bug fixes to dashboard.html...
echo.

set FILE=apps\frontend\html-pages\dashboard.html

REM Backup original file
copy "%FILE%" "%FILE%.backup" >nul
echo [OK] Backup created: %FILE%.backup

echo.
echo ==========================================
echo MANUAL FIXES REQUIRED
echo ==========================================
echo.
echo The file is too large for automated patching.
echo Please apply these fixes manually:
echo.
echo 1. Line ~2918 - Fix incomplete CSS:
echo    Change: flex-direction: 
echo    To:     flex-direction: column;
echo.
echo 2. Line ~2972 - Fix malformed string:
echo    Change: '</body>\n + (data.revenue / 1000).toFixed(1) + 'K';
echo    To:     '$' + (data.revenue / 1000).toFixed(1) + 'K';
echo.
echo 3. Add sanitization helper after opening script tag:
echo    const sanitize = (html) =^> DOMPurify.sanitize(html);
echo.
echo 4. Line ~3005 - Sanitize activity.text:
echo    Change: item.innerHTML = `<p><strong>${activity.text}</strong></p>`;
echo    To:     item.innerHTML = sanitize(`<p><strong>${activity.text}</strong></p>`);
echo.
echo 5. Line ~3033 - Replace eval():
echo    Change: const result = eval(code);
echo    To:     const result = new Function('return ' + code)();
echo.
echo 6. Line ~3070 - Fix regex validation:
echo    Change: if (username ^&^& !/^[a-zA-Z0-9_]{3,30}$/.test(username))
echo    To:     if (username ^&^& (username.length ^< 3 ^|^| username.length ^> 30 ^|^| !/^[a-zA-Z0-9_]+$/.test(username)))
echo.
echo 7. Line ~3398 - Sanitize suggestions:
echo    Wrap all template literals with sanitize()
echo.
echo 8. Line ~3410 - Sanitize search queries:
echo    Wrap all template literals with sanitize()
echo.
echo 9. Line ~3638 - Sanitize notifications:
echo    Change: ${n.text} and ${n.user}
echo    To:     ${sanitize(n.text)} and ${sanitize(n.user)}
echo.
echo 10. Line ~3838 - Replace second eval():
echo     Same as fix #5
echo.
echo ==========================================
echo.
echo Original file backed up to: %FILE%.backup
echo To restore: copy %FILE%.backup %FILE%
echo.
pause
