@echo off
REM Install Git silently
echo Installing Git...
powershell -Command "Invoke-WebRequest https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe -OutFile git-installer.exe; .\git-installer.exe /VERYSILENT /NORESTART"
timeout /t 5

REM Configure Git
git config --global user.email "365concertsgs@gmail.com"
git config --global user.name "SGS User"

REM Initialize and commit
git init
git add .
git commit -m "Initial commit - SGS Project"

echo.
echo ========================================
echo NEXT STEPS (Do these in your browser):
echo ========================================
echo.
echo 1. Go to: https://github.com/new
echo 2. Create a repository named: "sgs-raga-sagra" (make it PUBLIC)
echo 3. Copy the URL and come back here
echo 4. Run this command in the terminal:
echo.
echo git remote add origin YOUR_REPO_URL
echo git branch -M main
echo git push -u origin main
echo.
echo 5. Your public link will be: https://github.com/YOUR_USERNAME/sgs-raga-sagra
echo.
pause
