@echo off
git remote set-url origin https://github.com/Hootner/hootner.git
git pull origin main --allow-unrelated-histories
git push -u origin main