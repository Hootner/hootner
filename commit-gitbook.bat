@echo off
echo ========================================
echo  GitBook Setup - Commit to GitHub
echo ========================================
echo.

echo Adding GitBook files...
git add SUMMARY.md
git add .gitbook.yaml
git add book.json
git add GITBOOK_SETUP.md
git add GITBOOK_QUICK.md
git add GITBOOK_READY.md
git add GITBOOK_VISUAL.md
git add GITBOOK_IMPORT.md
git add docs/introduction.md
git add docs/README.md
git add .gitignore
git add README.md

echo.
echo Committing changes...
git commit -m "feat: Add GitBook documentation setup with template

- Add professional introduction page with badges
- Add SUMMARY.md with 43 pages and emojis
- Add .gitbook.yaml configuration
- Add book.json with plugins
- Add setup guides (SETUP, QUICK, IMPORT)
- Update .gitignore for GitBook builds
- Add docs/README.md for navigation"

echo.
echo Pushing to GitHub...
git push

echo.
echo ========================================
echo  ✅ GitBook setup committed!
echo ========================================
echo.
echo Next steps:
echo 1. Go to your GitBook dashboard
echo 2. Click "Create a new space"
echo 3. Choose "Import from GitHub"
echo 4. Select your HOOTNER repository
echo 5. Click "Import" and wait 30-60 seconds
echo 6. Click "Publish" - Done!
echo.
echo See GITBOOK_IMPORT.md for detailed instructions
echo.
pause
