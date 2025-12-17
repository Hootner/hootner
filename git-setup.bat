@echo off
set PATH=%PATH%;"C:\Program Files\Git\bin"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/hootner.git
git push -u origin main