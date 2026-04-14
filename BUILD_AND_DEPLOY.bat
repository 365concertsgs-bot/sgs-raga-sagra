@echo off
REM Production Deployment Script for SGS Globe Demo
REM This script builds and prepares your app for Vercel deployment

setlocal enabledelayedexpansion

echo.
echo ======================================
echo   SGS Globe Demo - Production Deploy
echo ======================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo Then re-run this script
    pause
    exit /b 1
)

echo [✓] Node.js found: 
node --version

echo.
echo [1/4] Installing dependencies...
npm install
if errorlevel 1 (
    echo [ERROR] npm install failed
    pause
    exit /b 1
)

echo.
echo [2/4] Building production bundle...
npm run build
if errorlevel 1 (
    echo [ERROR] npm run build failed
    pause
    exit /b 1
)

echo.
echo [✓] Production build created successfully!
echo.
echo ======================================
echo   Next Steps:
echo ======================================
echo.
echo Option A: Deploy via Vercel CLI
echo   1. Run: npm i -g vercel
echo   2. Run: vercel login
echo   3. Run: vercel --prod
echo.
echo Option B: Deploy via GitHub (Recommended)
echo   1. Run: git add .
echo   2. Run: git commit -m "Production deployment"
echo   3. Run: git push origin main
echo   4. Connect repo to Vercel Dashboard
echo.
echo Option C: Manual Deployment
echo   1. Upload dist/ folder to your hosting
echo.
echo Set Environment Variables in Vercel:
echo   - VITE_SUPABASE_URL
echo   - VITE_SUPABASE_ANON_KEY
echo.
echo ======================================
echo.

pause
