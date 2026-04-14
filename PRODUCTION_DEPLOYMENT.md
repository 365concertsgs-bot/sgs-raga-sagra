# 🚀 Production Deployment - Step by Step

## Prerequisites

Ensure you have installed:
- **Node.js 14+** from https://nodejs.org/
- **Git** from https://git-scm.com/

Verify installations:
```bash
node --version    # Should show v14+
npm --version     # Should show 6+
git --version     # Should show 2+
```

---

## Step 1: Build Production Bundle

### On Windows:
```bash
cd "d:\sgs globe demo"
npm install
npm run build
```

### On Mac/Linux:
```bash
cd ~/sgs-globe-demo  # or your path
npm install
npm run build
```

**Expected Output:**
```
✓ 123 modules transformed.
vite v5.0.8 building for production...
✓ built in 12.34s
dist/
  ├── index.html
  ├── assets/
  │   ├── index.abc123.js (450KB)
  │   ├── index.def456.css (12KB)
  ...
```

---

## Step 2: Verify Local Production Build

```bash
npm run preview
```

Visit http://localhost:4173 and test:
- ✓ Globe loads and rotates
- ✓ All filters work
- ✓ Audio/video plays
- ✓ Responsive on mobile browser (devtools)
- ✓ No console errors

---

## Step 3: Push to GitHub

### Initialize GitHub (First Time Only):
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git init
git add .
git commit -m "Initial commit: SGS Globe Demo v1.0.0-optimized"
```

### Create GitHub Repository:
1. Go to https://github.com/new
2. Repository name: `sgs-globe-demo`
3. Description: "Interactive globe showcasing 365 events"
4. Make it **Private** (recommended)
5. Click "Create repository"

### Connect and Push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/sgs-globe-demo.git
git branch -M main
git push -u origin main
```

---

## Step 4: Deploy to Vercel

### Option A: Automatic (Recommended)

**1. Go to https://vercel.com/new**

**2. Import GitHub repository:**
   - Click "Import Git Repository"
   - Select `sgs-globe-demo`

**3. Configure project:**
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

**4. Add Environment Variables:**
   - Go to "Environment Variables" section
   - Add: `VITE_SUPABASE_URL` = `your_supabase_url`
   - Add: `VITE_SUPABASE_ANON_KEY` = `your_anon_key`

**5. Click "Deploy"**

✅ **Done!** Your app is now live at:
- https://sgs-globe-demo.vercel.app
- Or custom domain if configured

---

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI (first time only)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

When prompted:
- Scope: Select your account
- Link to existing project: No
- Project name: sgs-globe-demo
- Directory: ./dist
- Override build command: No
- Override output directory: No

---

### Option C: Manual Upload

```bash
# Build the app
npm run build

# The dist/ folder contains your production app
# Upload dist/ folder to any web hosting:
# - AWS S3
# - Azure Static Web Apps
# - Netlify
# - Cloudflare Pages
# - Your own server
```

---

## Step 5: Set Environment Variables in Vercel

If you haven't set them during deployment:

1. Go to https://vercel.com/dashboard
2. Select your project `sgs-globe-demo`
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your-long-anon-key-here` |

5. **Redeploy** after adding variables

---

## Step 6: Verify Deployment

### Check Live Site:
```
https://sgs-globe-demo.vercel.app
```

**Test Everything:**
- ✅ Page loads under 3 seconds
- ✅ Globe renders and rotates
- ✅ Filters work smoothly
- ✅ Audio/video plays (check browser console)
- ✅ Responsive on mobile (use DevTools)
- ✅ No red errors in console

### View Logs:
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments" tab
4. Click on latest deployment
5. View build logs and runtime logs

---

## Step 7: Set Up Custom Domain (Optional)

To use your own domain (e.g., globe.example.com):

1. Go to Vercel Dashboard
2. Select project → Settings → Domains
3. Add your domain
4. Update DNS records as instructed:
   - Option A: Change DNS provider
   - Option B: Add CNAME record

Wait 24-48 hours for DNS propagation.

---

## Continuous Deployment Workflow

After initial setup, your workflow becomes simple:

```bash
# 1. Make changes locally
# ... edit files ...

# 2. Commit and push
git add .
git commit -m "Add new feature"
git push origin main

# 3. Vercel automatically deploys
# Check: https://vercel.com/dashboard → Deployments
```

---

## Monitoring & Maintenance

### View Deployment Status:
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Actions: https://github.com/YOUR_USERNAME/sgs-globe-demo/actions

### Check Performance:
- Vercel Analytics: https://vercel.com/analytics
- Monitor:
  - Page Load Time
  - Core Web Vitals
  - Error Rate
  - Bandwidth Usage

### Update Code:
```bash
# Pull latest changes
git pull origin main

# Make changes
# ...

# Deploy
git add .
git commit -m "Update: description here"
git push origin main
```

---

## Rollback to Previous Version

If something goes wrong:

```bash
# Option 1: Via Vercel Dashboard
# Go to Deployments → Click previous successful deployment → Redeploy
```

```bash
# Option 2: Via Git
# Revert to previous commit
git log --oneline                    # Find commit hash
git revert <commit-hash>
git push origin main                 # Vercel redeploys automatically
```

---

## Troubleshooting

### Build Fails on Vercel

**Problem**: Build works locally but fails on Vercel

**Solution**:
```bash
# Clear and rebuild locally
rm -rf node_modules dist
npm install
npm run build

# If it works locally, commit and push
git add . && git commit -m "fix build" && git push
```

### Environment Variables Not Working

**Problem**: App shows Supabase error

**Solution**:
1. Double-check variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Verify values are correct from Supabase Dashboard
3. Redeploy after adding variables: Vercel Dashboard → Redeploy

### Audio Not Playing

**Problem**: Audio works locally but not in production

**Solution**:
1. Check browser autoplay permissions (Allow in settings)
2. Verify URL is CORS-enabled
3. Check browser console for errors
4. Try different media file

### Site is Slow

**Problem**: Production site loads slowly

**Solution**:
1. Check Vercel Analytics for bottlenecks
2. Verify images are optimized
3. Check network tab in DevTools
4. Review build logs for warnings

---

## Success Checklist

✅ Development complete
✅ Local build successful (`npm run build`)
✅ Production preview works (`npm run preview`)
✅ GitHub repository created
✅ Code pushed to GitHub
✅ Vercel connected to GitHub
✅ Environment variables set
✅ Deployment successful
✅ Live site loads under 3 seconds
✅ All features work in production
✅ Mobile responsive verified
✅ Audio autoplay tested
✅ Lighthouse score 90+

---

## 🎉 You're Live!

Your app is now deployed to production and accessible worldwide!

### Live URL:
```
https://sgs-globe-demo.vercel.app
```

### Share with:
- Your team
- Users
- Social media
- Stakeholders

### Next Steps:
1. Monitor performance in Vercel Dashboard
2. Gather user feedback
3. Plan future enhancements
4. Update content regularly

---

**Congratulations! 🚀 Your SGS Globe Demo is now in production!**

For issues: Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) or contact Vercel support.
