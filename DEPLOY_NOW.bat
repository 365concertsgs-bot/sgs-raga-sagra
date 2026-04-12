@echo off
cd "d:\sgs globe demo"

REM Use full path to git
"C:\Program Files\Git\bin\git.exe" add .github/workflows/deploy.yml
"C:\Program Files\Git\bin\git.exe" commit -m "Add Vercel deployment workflow"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Deployment workflow pushed to GitHub!
echo.
echo Your app will auto-deploy at: https://sgs-raga-sagra.vercel.app
echo.
pause
