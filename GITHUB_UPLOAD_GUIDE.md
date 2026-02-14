# GitHub Upload Guide - Sarvind2 Branch

## 📋 Prerequisites

Before starting, make sure you have:
- Git installed on your computer
- GitHub account with access to the repository: `https://github.com/ahmd-byte/TradeLingo`
- Personal Access Token (PAT) or SSH key configured for authentication

---

## 🚀 Step-by-Step Upload Instructions

### Step 1: Navigate to the Frontend Folder

Open PowerShell and run:
```powershell
cd "c:\Users\Truly\Projects\deriv hackathon superbear\frontend"
```

### Step 2: Initialize Git Repository (if not already done)

Check if git is initialized:
```powershell
git status
```

If you see "fatal: not a git repository", initialize it:
```powershell
git init
```

### Step 3: Configure Git (First Time Only)

Set your name and email:
```powershell
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Step 4: Add Remote Repository

Add the GitHub repository as remote:
```powershell
git remote add origin https://github.com/ahmd-byte/TradeLingo.git
```

If you already added it, verify with:
```powershell
git remote -v
```

### Step 5: Create and Switch to sarvind2 Branch

```powershell
git checkout -b sarvind2
```

### Step 6: Stage All Files

Add all files to staging (the .gitignore will automatically exclude node_modules and other unwanted files):
```powershell
git add .
```

### Step 7: Verify What Will Be Committed

Check that node_modules is NOT included:
```powershell
git status
```

You should see files like:
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `src/` folder
- ✅ `public/` folder
- ✅ `.gitignore`
- ❌ `node_modules/` (should NOT appear - excluded by .gitignore)
- ❌ `dist/` (should NOT appear - build output)

### Step 8: Commit Your Changes

```powershell
git commit -m "Add SuperBear frontend to sarvind2 branch"
```

### Step 9: Push to GitHub

Push the new branch to GitHub:
```powershell
git push -u origin sarvind2
```

You may be prompted to enter your GitHub username and password/token.

---

## 🔐 Authentication Options

### Option A: Personal Access Token (Recommended)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Copy the token
4. When prompted for password during push, paste the token

### Option B: GitHub CLI (Easiest)

Install GitHub CLI and authenticate:
```powershell
winget install GitHub.cli
gh auth login
```

Then repeat Step 9.

### Option C: SSH Key

If you have SSH key configured, change remote URL:
```powershell
git remote set-url origin git@github.com:ahmd-byte/TradeLingo.git
```

---

## 📦 What Gets Uploaded vs Excluded

### ✅ WILL BE UPLOADED:
- All source code (`src/` folder)
- `package.json` and `package-lock.json` (dependency list)
- `.gitignore` (exclusion rules)
- Documentation files (`.md` files)
- `index.html`
- `vite.config.ts`, `tsconfig.json`
- Assets folder (`src/assets/`)

### ❌ WILL NOT BE UPLOADED (automatically excluded by .gitignore):
- `node_modules/` (all packages - 200+ MB)
- `dist/` (build output)
- `.env` files (environment variables)
- `.vscode/` (editor settings)
- Log files
- Build cache files

---

## 👥 For Team Members to Clone and Run

Once uploaded, team members should:

### 1. Clone the repository:
```bash
git clone https://github.com/ahmd-byte/TradeLingo.git
cd TradeLingo
```

### 2. Switch to sarvind2 branch:
```bash
git checkout sarvind2
```

### 3. Navigate to frontend folder:
```bash
cd frontend
```

### 4. Install dependencies:
```bash
npm install
```

This will download all packages listed in `package.json` (about 5-10 minutes).

### 5. Run the development server:
```bash
npm run dev
```

The app will start at `http://localhost:5173`

---

## 🔄 Updating the Branch Later

If you make changes and want to push updates:

```powershell
# 1. Stage changes
git add .

# 2. Commit
git commit -m "Description of your changes"

# 3. Push
git push origin sarvind2
```

---

## 🛠️ Troubleshooting

### Error: "fatal: remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/ahmd-byte/TradeLingo.git
```

### Error: "Updates were rejected because the remote contains work"
```powershell
git pull origin sarvind2 --rebase
git push origin sarvind2
```

### Error: "Permission denied"
- Check your authentication method
- Verify you have push access to the repository
- Generate a new Personal Access Token if needed

### Accidentally committed node_modules
```powershell
# Remove from git but keep locally
git rm -r --cached node_modules/
git commit -m "Remove node_modules from git"
git push origin sarvind2
```

---

## 📊 Repository Size

Expected upload size: **~5-15 MB** (without node_modules)
- With node_modules: **~200-300 MB** ❌ (Don't upload!)
- After npm install: Team members will download packages

---

## ✅ Verification Checklist

After pushing, verify on GitHub:
1. Go to `https://github.com/ahmd-byte/TradeLingo/tree/sarvind2`
2. Check that `node_modules/` folder is NOT visible
3. Check that `package.json` IS visible
4. Check that `src/` folder IS visible with all components
5. Check file count is reasonable (~50-100 files, not 5000+)

---

## 📞 Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify you're in the correct directory
3. Ensure .gitignore is present and correct
4. Check your GitHub authentication
5. Try the GitHub Desktop app as an alternative

---

## 🎯 Quick Command Summary

```powershell
# Complete workflow
cd "c:\Users\Truly\Projects\deriv hackathon superbear\frontend"
git init
git remote add origin https://github.com/ahmd-byte/TradeLingo.git
git checkout -b sarvind2
git add .
git status  # Verify node_modules is NOT listed
git commit -m "Add SuperBear frontend to sarvind2 branch"
git push -u origin sarvind2
```

Done! ✨
