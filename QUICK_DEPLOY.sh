#!/bin/bash
# ==============================================================
#  SGS Globe Demo - Quick Deployment Script (Mac/Linux)
# ==============================================================
#  This script automates the entire production deployment process
#  Usage: bash QUICK_DEPLOY.sh
# ==============================================================

set -e  # Exit on error

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           SGS Globe Demo - Production Deploy              ║"
echo "║              Mac/Linux Deployment Script                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "[1/7] Checking Prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed"
    echo "   Install from: https://nodejs.org/"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "⚠️  WARNING: Git is not installed"
    echo "   Install from: https://git-scm.com/"
fi

echo "✓ Node.js: $(node --version)"
echo "✓ npm: $(npm --version)"
echo ""

# Install dependencies
echo "[2/7] Installing Dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Build production bundle
echo "[3/7] Building Production Bundle..."
npm run build
echo "✓ Production bundle created"
echo ""

# Test local production preview
echo "[4/7] Testing Production Preview..."
echo "   ℹ️  Start preview with: npm run preview"
echo "   Then visit: http://localhost:4173"
echo ""
read -p "Press Enter to continue to GitHub push..."
echo ""

# Git operations
echo "[5/7] Preparing GitHub Push..."

if [ ! -d ".git" ]; then
    echo "ℹ️  Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: SGS Globe Demo Production Build"
else
    echo "ℹ️  Git repository found"
    git add .
    git status
    echo ""
    read -p "Enter commit message (press Enter for default): " gitcommit
    if [ -z "$gitcommit" ]; then
        gitcommit="Production: App optimization and deployment"
    fi
    git commit -m "$gitcommit"
fi

echo "ℹ️  To push to GitHub, run: git push origin main"
echo ""

# Deployment instructions
echo "[6/7] Deployment Instructions..."
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║            Next Steps for Production Deployment            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Option A - Vercel (Recommended):"
echo "  1. Go to: https://vercel.com/new"
echo "  2. Import this GitHub repository"
echo "  3. Add environment variables:"
echo "     - VITE_SUPABASE_URL"
echo "     - VITE_SUPABASE_ANON_KEY"
echo "  4. Click 'Deploy'"
echo ""
echo "Option B - Vercel CLI:"
echo "  1. Install Vercel CLI: npm install -g vercel"
echo "  2. Run: vercel --prod"
echo "  3. Answer the prompts"
echo ""
echo "Option C - Other Platforms:"
echo "  - AWS S3, Azure, Netlify, Cloudflare Pages, etc."
echo "  - Upload the 'dist' folder to your hosting provider"
echo ""
echo "============================================================"
echo "The 'dist' folder contains your complete production app"
echo "============================================================"
echo ""

# Open dist folder
echo "[7/7] Opening Deployment Folder..."
if [ "$(uname)" == "Darwin" ]; then
    # macOS
    open dist
    echo "✓ Opened dist folder"
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    # Linux
    xdg-open dist 2>/dev/null || echo "ℹ️  dist folder location: $(pwd)/dist"
fi
echo ""

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✅ Deployment Ready!                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Your production bundle is ready to deploy!"
echo "Location: $(pwd)/dist"
echo ""
echo "For detailed instructions, see: PRODUCTION_DEPLOYMENT.md"
echo ""
