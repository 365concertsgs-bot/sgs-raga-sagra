# GitHub Setup Script for SGS Project
# This script will:
# 1. Initialize git
# 2. Commit your files
# 3. Create a GitHub repo
# 4. Push your code

Write-Host "Starting GitHub setup..." -ForegroundColor Green

# Step 1: Configure git (use your GitHub email and name)
$email = Read-Host "Enter your GitHub email"
$name = Read-Host "Enter your GitHub username"

git config --global user.email "$email"
git config --global user.name "$name"
Write-Host "Git configured" -ForegroundColor Green

# Step 2: Initialize repository
git init
Write-Host "Git repository initialized" -ForegroundColor Green

# Step 3: Add files
git add .
Write-Host "Files staged" -ForegroundColor Green

# Step 4: Create initial commit
git commit -m "Initial commit - SGS Raga Sagra project"
Write-Host "Initial commit created" -ForegroundColor Green

# Step 5: Log in to GitHub and create repo
Write-Host "`nLogging into GitHub..." -ForegroundColor Yellow
& "C:\Program Files\GitHub CLI\gh.exe" auth login -p https -w
Write-Host "GitHub authenticated" -ForegroundColor Green

# Step 6: Create remote repository
Write-Host "`nCreating GitHub repository..." -ForegroundColor Yellow
& "C:\Program Files\GitHub CLI\gh.exe" repo create Sgs_raga_sagra --public --source=. --remote=origin --push
Write-Host "Repository created and code pushed!" -ForegroundColor Green

# Step 7: Get the repository URL
$repoUrl = & "C:\Program Files\GitHub CLI\gh.exe" repo view --json url -q
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Your repository is now live!" -ForegroundColor Green
Write-Host "Repository URL:" -ForegroundColor Cyan
Write-Host $repoUrl -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
