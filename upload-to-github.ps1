# Quick Upload Script
# Run this file in PowerShell to upload the frontend to GitHub

# Navigate to frontend folder
Set-Location "c:\Users\Truly\Projects\deriv hackathon superbear\frontend"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   SuperBear Frontend - GitHub Upload Script   " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✓ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed. Please install Git first:" -ForegroundColor Red
    Write-Host "  https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 1: Configuring Git..." -ForegroundColor Yellow
$userName = Read-Host "Enter your Git username"
$userEmail = Read-Host "Enter your Git email"

git config user.name "$userName"
git config user.email "$userEmail"
Write-Host "✓ Git configured" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Initializing Git repository..." -ForegroundColor Yellow
git init
Write-Host "✓ Repository initialized" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Adding remote repository..." -ForegroundColor Yellow
git remote remove origin 2>$null  # Remove if exists
git remote add origin https://github.com/ahmd-byte/TradeLingo.git
Write-Host "✓ Remote added" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Creating sarvind2 branch..." -ForegroundColor Yellow
git checkout -b sarvind2
Write-Host "✓ Branch created" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5: Staging files..." -ForegroundColor Yellow
git add .
Write-Host "✓ Files staged" -ForegroundColor Green

Write-Host ""
Write-Host "Step 6: Checking what will be committed..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
git status --short
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host ""
Write-Host "⚠ IMPORTANT: Verify that 'node_modules/' is NOT in the list above" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Does everything look correct? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Upload cancelled. Please review the files." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 7: Committing changes..." -ForegroundColor Yellow
git commit -m "Add SuperBear frontend to sarvind2 branch"
Write-Host "✓ Changes committed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 8: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "You may be prompted for GitHub username and Personal Access Token" -ForegroundColor Cyan
Write-Host ""

git push -u origin sarvind2

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "   ✓ SUCCESS! Frontend uploaded to GitHub      " -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "View your code at:" -ForegroundColor Cyan
    Write-Host "https://github.com/ahmd-byte/TradeLingo/tree/sarvind2" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Push failed. Check the error message above." -ForegroundColor Red
    Write-Host "See GITHUB_UPLOAD_GUIDE.md for troubleshooting." -ForegroundColor Yellow
}
