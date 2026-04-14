# 🔍 Pre-Deployment Verification Checklist

Complete this checklist before deploying to production.

## Code Quality & Build

- [ ] **Local Build Passes**
  ```bash
  npm run build
  ```
  No errors, clean output, `dist/` folder created

- [ ] **No Console Errors**
  ```bash
  npm run preview
  ```
  Open http://localhost:4173 and check browser DevTools console

- [ ] **Bundle Size Acceptable**
  - [ ] Main JS bundle < 500KB gzipped
  - [ ] CSS bundl < 50KB gzipped
  - [ ] Total dist/ folder < 2MB

- [ ] **Code Quality**
  - [ ] No `console.log` statements left in production code
  - [ ] No commented-out code blocks
  - [ ] No hardcoded API keys or secrets
  - [ ] All environment variables use VITE_ prefix

---

## Responsive Design

### Mobile (375px)
- [ ] App loads on iPhone SE (375x667)
- [ ] Touch targets are at least 44px
- [ ] Content is readable without horizontal scroll
- [ ] Filters collapse into mobile menu
- [ ] Audio player is touch-friendly

### Tablet (768px)
- [ ] App scales correctly
- [ ] 2-column layout where appropriate
- [ ] Touch interactions work smoothly

### Desktop (1440px)
- [ ] Full 3-column layout displays
- [ ] Globe is fully visible
- [ ] All filters visible at once
- [ ] Smooth animations work

### Large Display (2560px / 65" touchscreen)
- [ ] All elements scale appropriately with clamp()
- [ ] Text is readable at distance
- [ ] Touch targets remain accessible
- [ ] No layout breaks or overlaps

**Test with:**
```bash
npm run preview
# Then use Chrome DevTools to change viewport sizes
```

---

## Audio & Media Playback

- [ ] **Autoplay Behavior**
  - [ ] Audio tries to autoplay unmuted
  - [ ] Falls back to muted if required by browser
  - [ ] User notification shows muted status when needed
  - [ ] No console errors related to autoplay

- [ ] **Platform Support**
  - [ ] ✓ YouTube videos play
  - [ ] ✓ Vimeo videos play
  - [ ] ✓ Spotify embeds work
  - [ ] ✓ SoundCloud embedded players work
  - [ ] ✓ Direct MP3 files play
  - [ ] ✓ audio.mp3 fallback works

- [ ] **Cross-Browser Audio**
  - [ ] Chrome: Audio works
  - [ ] Firefox: Audio works
  - [ ] Safari: Audio works (may be muted)
  - [ ] Edge: Audio works

**Test with:**
- Try different event numbers to find ones with audio
- Click event to open modal and check if audio plays
- Check browser console for any media errors

---

## Features & Functionality

### Globe & Interaction
- [ ] Globe renders without errors
- [ ] Globe rotates smoothly
- [ ] Clicking on continents highlights them
- [ ] Clicking on globe points shows event details

### Event Filtering
- [ ] Event number slider works (1-365)
- [ ] Year dropdown filters correctly
- [ ] Country search autocomplete works
- [ ] Country search filters events
- [ ] Event name search works
- [ ] Continent buttons filter correctly
- [ ] Multiple filters work together

### Event Details Modal
- [ ] Modal slides up smoothly (Framer Motion animation)
- [ ] Close button (X) works
- [ ] Event carousel shows images
- [ ] Previous/Next buttons navigate images
- [ ] Event description scrolls (if longer than viewport)
- [ ] Audio player appears if event has audio/video

### Controls
- [ ] All buttons are clickable
- [ ] All inputs respond to keyboard and touch
- [ ] No broken links
- [ ] Loading states show properly

**Test with:**
```bash
npm run preview
# Check different events, filters, and interactions
```

---

## Performance

### Load Time
- [ ] Page loads in < 3 seconds on 4G
- [ ] First contentful paint < 1.5 seconds
- [ ] Largest contentful paint < 2.5 seconds

### Lighthouse Score
- [ ] Performance: 85+
- [ ] Accessibility: 90+
- [ ] Best Practices: 90+
- [ ] SEO: 90+

**Test with:**
```bash
npm run preview
# Chrome DevTools → Lighthouse tab
# Run audit for "Mobile" and "Desktop"
```

### Network Requests
- [ ] No failed network requests (404, 500, etc.)
- [ ] Supabase data loads successfully
- [ ] Images load from CDN (if configured)
- [ ] No mixed HTTP/HTTPS warnings

---

## Browser & Device Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Firefox Mobile

### Devices
- [ ] iPhone 12/13/14 (375px)
- [ ] iPad Air (768px)
- [ ] MacBook Pro 14" (1440px)
- [ ] Windows laptop 15.6" (1366px)
- [ ] 65" 4K display (2560px+)

---

## Data & Environment

- [ ] **.env file configured**
  ```
  VITE_SUPABASE_URL=https://xxx.supabase.co
  VITE_SUPABASE_ANON_KEY=xxx
  ```

- [ ] **Supabase Connection Works**
  - [ ] Events data loads from `events_365` table
  - [ ] Media data loads from `events365_media` table
  - [ ] No 401/403 Supabase errors

- [ ] **No Hardcoded Values**
  - [ ] No localhost URLs
  - [ ] No development Supabase keys
  - [ ] No API keys in source code

---

## Deployment Readiness

### Git & GitHub
- [ ] [ ] Repository is on GitHub (public/private)
- [ ] [ ] All changes are committed
- [ ] [ ] Branch is up-to-date
- [ ] [ ] No uncommitted changes in working directory

**Verify:**
```bash
git status  # Should say "working tree clean"
```

### Build Artifacts
- [ ] [ ] `dist/` folder exists
- [ ] [ ] `dist/index.html` is present
- [ ] [ ] `dist/assets/` folder has JS and CSS files
- [ ] [ ] No .map files in production build (unless necessary)

### Environment Variables (for Hosting)
- [ ] [ ] Add to Vercel (or hosting provider):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

- [ ] [ ] Verify no other secrets needed

---

## Deployment Platform Setup

### For Vercel Deployment:
- [ ] Vercel account created (vercel.com)
- [ ] GitHub connected to Vercel
- [ ] Project imported to Vercel
- [ ] Environment variables added to Vercel
- [ ] Build settings correct:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

### For GitHub Pages (Alternative):
- [ ] GitHub Pages enabled in repository settings
- [ ] Build and deployment branch set to `main`
- [ ] GitHub Actions configured for automated builds

### For Custom Hosting (Alternative):
- [ ] Hosting account set up
- [ ] SSH/FTP access verified
- [ ] Domain configured
- [ ] SSL certificate installed

---

## Final Checks (Day of Deployment)

- [ ] **Source Code**
  - [ ] All optimizations merged to main branch
  - [ ] No old .map files or debug code

- [ ] **Build**
  - [ ] Fresh build succeeds: `npm run build`
  - [ ] Preview works: `npm run preview`
  - [ ] No warnings in build output

- [ ] **Features**
  - [ ] Globe works
  - [ ] Events filter and display
  - [ ] Audio/video plays
  - [ ] Mobile responsive
  - [ ] Icons display correctly

- [ ] **Team Notification**
  - [ ] Team informed of deployment time
  - [ ] Rollback plan communicated
  - [ ] Contact person identified if issues occur

---

## Post-Deployment Verification

After deploying to production:

- [ ] **Live Site Loads**
  - [ ] Visit production URL
  - [ ] Page loads completely
  - [ ] No 404 or 500 errors

- [ ] **Features Work**
  - [ ] Globe renders
  - [ ] Events display
  - [ ] Filters work
  - [ ] Audio/video plays
  - [ ] Mobile is responsive

- [ ] **Performance (Live)**
  - [ ] Lighthouse score 85+ on production URL
  - [ ] Load time < 3 seconds
  - [ ] No console errors

- [ ] **Monitoring**
  - [ ] Error tracking enabled (Vercel/Sentry)
  - [ ] User analytics connected
  - [ ] Check for real-time issues

---

## Rollback Plan

If production deployment has critical issues:

```bash
# Option 1: Revert git commit and redeploy
git revert <commit-hash>
git push origin main

# Option 2: Redeploy previous build
# Vercel Dashboard → Deployments → Select previous → Redeploy

# Option 3: Restore from backup
# Contact hosting support for backup restoration
```

---

## Sign-Off Checklist

- [ ] All above items checked and verified
- [ ] Product owner approved deployment
- [ ] Team lead reviewed and signed off
- [ ] Deployment notification sent to stakeholders
- [ ] Post-deployment monitoring plan in place

**Date Deployed:** _______________

**Deployed By:** _______________

**Deployment Verified By:** _______________

**Notes:** 
```
[Leave space for deployment notes]
```

---

**ℹ️ For detailed deployment instructions, see [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)**

