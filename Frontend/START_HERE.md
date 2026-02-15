# 🚀 Quick Start - Upload to GitHub

## For First-Time Upload to sarvind2 Branch

### Easiest Method: Run the Automated Script

1. Open PowerShell in this folder
2. Run:
   ```powershell
   .\upload-to-github.ps1
   ```
3. Follow the prompts
4. Done! ✨

---

### Alternative: Manual Commands

If the script doesn't work, run these commands in PowerShell:

```powershell
# 1. Initialize git
git init

# 2. Configure your details
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 3. Add remote
git remote add origin https://github.com/ahmd-byte/TradeLingo.git

# 4. Create sarvind2 branch
git checkout -b sarvind2

# 5. Add all files (node_modules is auto-excluded)
git add .

# 6. Check what will be uploaded (node_modules should NOT appear)
git status

# 7. Commit
git commit -m "Add SuperBear frontend to sarvind2 branch"

# 8. Push to GitHub
git push -u origin sarvind2
```

---

## ⚠️ IMPORTANT

- **DO NOT** manually add node_modules folder
- The `.gitignore` file automatically excludes it
- Only `package.json` is uploaded (others run `npm install` to get packages)

---

## 📖 Need More Help?

See **GITHUB_UPLOAD_GUIDE.md** for:
- Authentication setup
- Troubleshooting
- Detailed explanations
- Team member instructions

---

## ✅ After Upload

Verify on GitHub:
- Go to: https://github.com/ahmd-byte/TradeLingo/tree/sarvind2
- Check `node_modules/` is NOT visible
- Check `src/` folder IS visible

---

## 👥 For Team Members

Once uploaded, team members should:

```bash
git clone https://github.com/ahmd-byte/TradeLingo.git
cd TradeLingo
git checkout sarvind2
cd frontend
npm install    # This downloads all packages
npm run dev    # Start the app
```
