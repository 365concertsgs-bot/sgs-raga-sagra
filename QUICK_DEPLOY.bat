@echo off
REM ==============================================================
REM  SGS Globe Demo - Quick Deployment Script (Windows)
REM ==============================================================
REM  This script automates the entire production deployment process
REM  Usage: Double-click this file or run: QUICK_DEPLOY.bat
REM ==============================================================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           SGS Globe Demo - Production Deploy              ║
echo ║                  Windows Deployment Script                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
echo [1/7] Checking Prerequisites...
where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo    Please install Node.js from: https://nodejs.org/
    echo    Then close and reopen this command prompt
    pause
    exit /b 1
)

where git >nul 2>nul
if errorlevel 1 (
    echo.
    echo ⚠️  WARNING: Git is not installed or not in PATH
    echo    Please install Git from: https://git-scm.com/
    echo    Git is needed for GitHub deployment
    pause
)

echo ✓ Node.js found: 
node --version
echo ✓ npm found: 
npm --version
echo.

REM Install dependencies
echo [2/7] Installing Dependencies...
call npm install
if errorlevel 1 (
    echo ❌ npm install failed
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

REM Build production bundle
echo [3/7] Building Production Bundle...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✓ Production bundle created
echo.

REM Test local production preview
echo [4/7] Testing Production Preview...
echo    ℹ️  Starting local preview server...
echo    ✓ Server will start at: http://localhost:4173
echo    ℹ️  You can now test the app locally before deploying
echo.
echo    Press any key to continue to GitHub push...
pause

REM Git operations
echo [5/7] Preparing GitHub Push...
where git >nul 2>nul
if errorlevel 1 (
    echo ⚠️  Skipping Git operations (Git not installed)
    goto :skipgit
)

REM Check if git is initialized
if not exist ".git" (
    echo ℹ️  Initializing Git repository...
    call git init
    call git add .
    call git commit -m "Initial commit: SGS Globe Demo Production Build"
) else (
    echo ℹ️  Git repository found
    call git add .
    call git status
    echo.
    set /p gitcommit="Enter commit message (or press Enter for default): "
    if "!gitcommit!"=="" (
        set gitcommit=Production: App optimization and deployment
    )
    call git commit -m "!gitcommit!"
)

echo ℹ️  Your changes are committed locally
echo ℹ️  To push to GitHub, run: git push origin main
echo.

:skipgit

REM Deployment instructions
echo [6/7] Deployment Instructions...
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║            Next Steps for Production Deployment            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Option A - Vercel (Recommended):
echo   1. Go to: https://vercel.com/new
echo   2. Import this GitHub repository
echo   3. Add environment variables:
echo      - VITE_SUPABASE_URL
echo      - VITE_SUPABASE_ANON_KEY
echo   4. Click "Deploy"
echo.
echo Option B - Vercel CLI:
echo   1. Install Vercel CLI: npm install -g vercel
echo   2. Run: vercel --prod
echo   3. Answer the prompts
echo.
echo Option C - Other Platforms:
echo   - AWS S3, Azure, Netlify, Cloudflare Pages, etc.
echo   - Upload the "dist" folder to your hosting provider
echo.
echo ============================================================
echo The "dist" folder contains your complete production app
echo ============================================================
echo.

REM Open dist folder
echo [7/7] Opening Deployment Folder...
start explorer "dist"
echo ✓ Opened dist folder in Explorer
echo.

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║              ✅ Deployment Ready!                         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Your production bundle is ready to deploy!
echo Location: %cd%\dist
echo.
echo For detailed instructions, see: PRODUCTION_DEPLOYMENT.md
echo.

pause
