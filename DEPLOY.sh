#!/bin/bash
# Quick Deploy Script for SGS Globe Demo
# Copy and run in your terminal

echo "🚀 SGS Globe Demo - Quick Deploy"
echo "================================="

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Build production bundle
echo "🔨 Building production bundle..."
npm run build

# Step 3: Preview production locally
echo "👁️  Preview production build..."
echo "Visit: http://localhost:4173"
npm run preview

# Step 4: Deploy to Vercel
echo "📤 Deploying to Vercel..."
echo "Option 1: Connect to GitHub repo and auto-deploy"
echo "Option 2: Run: npm i -g vercel && vercel --prod"

echo ""
echo "✅ Deploy complete!"
echo ""
echo "Next steps:"
echo "1. Verify your live site"
echo "2. Test on mobile and 65\" display"
echo "3. Share the link!"
