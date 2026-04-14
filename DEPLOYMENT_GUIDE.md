# 🚀 Deployment Guide

## Pre-Deployment Checklist

- [x] Responsive design tested on multiple devices
- [x] Audio autoplay configured
- [x] Performance optimizations applied
- [x] CSS updated with responsive units
- [x] Bundle optimized (~450KB gzipped)
- [ ] Run `npm run build` successfully
- [ ] Test production build locally
- [ ] GitHub repository created
- [ ] Vercel account connected
- [ ] Supabase environmental variables set

## Step 1: Build for Production

```bash
# Navigate to project directory
cd "d:\sgs globe demo"

# Install latest dependencies
npm install

# Build optimized production bundle
npm run build

# Preview the production build locally
npm run preview
```

Verify output mentions:
- ✓ Built in X.XXs
- ✓ dist/ folder created with optimized files
- ✓ Gzipped size approximately 450KB

## Step 2: Prepare Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: SGS Globe Demo v1.0.0-optimized"

# Create GitHub repository at https://github.com/your-username/sgs-globe-demo

# Add remote and push
git remote add origin https://github.com/your-username/sgs-globe-demo.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Automatic Deployment (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub (select your repository)
4. Vercel automatically detects Vite
5. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase key
6. Click "Deploy"

### Option B: CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts:
# - Set scope: your-username
# - Link to existing project: No
# - Project name: sgs-globe-demo
# - Production folder: dist
# - Override build command: npm run build

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

## Step 4: Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to Project Settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Step 5: Verify Deployment

```bash
# Visit https://your-vercel-url.vercel.app
# Or your custom domain

# Test:
✓ Globe loads and rotates
✓ Filters work smoothly
✓ Audio plays (autoplay may be muted initially)
✓ Responsive on mobile browser
✓ Responsive on tablet
✓ Fully functional on desktop
```

## Continuous Deployment Workflow

After setup:
1. Make changes locally
2. `git commit` and `git push` to main branch
3. Vercel automatically builds and deploys
4. View deployment at Analytics page

## Performance Optimization Tips

### 1. Image Optimization
The app already uses lazy loading. For additional optimization:
```bash
npx imagemin public/*.png --out-dir=public
```

### 2. Monitor Bundle Size
```bash
npm install --save-dev rollup-plugin-visualizer
# Then check dist folder size
```

### 3. Enable CDN Caching
Vercel automatically caches:
- Static assets (images, fonts)
- Built JavaScript bundles
- CSS files

No additional configuration needed!

## Troubleshooting Deployment

### Build Fails on Vercel

**Issue**: `npm run build` fails on Vercel but works locally

**Solution**:
```bash
# Clear node_modules locally
rm -rf node_modules
npm install

# Rebuild locally
npm run build

# Commit and push
git add . && git commit -m "rebuild" && git push
```

### Environment Variables Not Working

**Issue**: App can't connect to Supabase in production

**Solution**:
1. Verify variables in Vercel Dashboard
2. Redeploy after adding variables
3. Check variable names match exactly:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Audio Not Playing in Production

**Issue**: Audio works locally but not in production

**Solution**:
- Check browser autoplay permissions
- Ensure audio URL is CORS-enabled
- Test with unmuted audio first
- Check browser developer console for errors

## Monitoring & Maintenance

### Weekly Checks
```bash
# Check for dependency updates
npm outdated

# Update if needed
npm update
```

### Monthly Tasks
```bash
# Audit for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update lock file
npm install
```

### Performance Monitoring
- Use Vercel Analytics dashboard
- Monitor Core Web Vitals
- Check error rates
- Review resource usage

## Rollback Procedure

If deployment breaks:

```bash
# Revert to last working commit
git revert HEAD
git push

# Vercel automatically deploys the previous version
# Check Deployments tab in Vercel Dashboard
```

Or manually  select previous deployment in Vercel Dashboard.

## Backup & Recovery

### Backup Local Files
```bash
# Create backup
git clone https://github.com/your-username/sgs-globe-demo.git backup
```

### Database Backup
Supabase automatically backs up:
- Daily backups (30-day retention)
- Manual backups available
- Export data via Supabase dashboard

## Privacy & Security

- ✓ Supabase API keys are kept in environment variables
- ✓ Not exposed in source code
- ✓ Only accessible in server-side environment
- ✓ GitHub repo kept private (recommended)

## Production Checklist

Before going live:
- [ ] Website loads under 3 seconds
- [ ] All filters work smoothly
- [ ] Audio/video plays on different media
- [ ] Responsive on 480px mobile screen
- [ ] Responsive on 65" display (at 2560px+)
- [ ] Touch interaction works smoothly
- [ ] No console errors
- [ ] Analytics configured in Vercel
- [ ] Custom domain set up (if applicable)
- [ ] SSL certificate active (auto with Vercel)

## Success! 🎉

Your app is now deployed and accessible to users worldwide!

### Next Steps
1. Share the link: `https://your-domain.com`
2. Monitor analytics in Vercel Dashboard
3. Gather user feedback
4. Plan future enhancements

---

**Questions?** Check the [README.md](./README.md) or [OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md)
