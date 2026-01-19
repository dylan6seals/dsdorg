# Deployment Checklist

Use this checklist to ensure successful deployment to production.

## Pre-Deployment (Local)

### Environment Setup
- [ ] `.env` file created with all 7 variables
- [ ] MongoDB Atlas connection tested locally
- [ ] Cloudinary credentials verified
- [ ] Admin password configured (plain text for dev)
- [ ] JWT secret generated (32+ characters)

### Local Testing
- [ ] `npm install` completed successfully
- [ ] `npm run dev` starts without errors
- [ ] Homepage loads at http://localhost:5173
- [ ] Admin login works
- [ ] Create new entry works
- [ ] Edit existing entry works
- [ ] File upload works with preview
- [ ] Images display correctly
- [ ] Search and filter work
- [ ] Navigation between pages works
- [ ] Browser console shows no errors

### Code Quality
- [ ] No TypeScript/ESLint errors (if applicable)
- [ ] All console.log statements removed or commented
- [ ] Git repository clean (no uncommitted changes)
- [ ] `.gitignore` includes `.env` and `node_modules/`
- [ ] Legacy vanilla JS files deleted from `public/js/`

## MongoDB Atlas Setup

### Database Configuration
- [ ] Account created at mongodb.com/cloud/atlas
- [ ] M0 free tier cluster created
- [ ] Cluster name: `dsdorg` (or your choice)
- [ ] Database name: `dsdorg`
- [ ] Collection name: `entries`

### Security
- [ ] Database user created with read/write permissions
- [ ] Strong password generated for database user
- [ ] Connection string copied: `mongodb+srv://...`
- [ ] Network access configured (0.0.0.0/0 for Vercel)
- [ ] IP whitelist includes Vercel IPs (or allow all)

### Schema
- [ ] Entries collection using proper schema
- [ ] Indexes created (slug, date, category - optional but recommended)
- [ ] Test data imported (optional)

## Cloudinary Setup

### Account Configuration
- [ ] Account created at cloudinary.com
- [ ] Free tier confirmed (25GB storage + 25GB/month bandwidth)
- [ ] Cloud name noted: `dxxxxx`
- [ ] API key copied: `123456789012345`
- [ ] API secret copied: `abcdef...`

### Media Settings
- [ ] Upload preset created (optional): `dsdorg-uploads`
- [ ] Folder structure configured: `dsdorg/entries/`
- [ ] Auto-backup enabled (optional)
- [ ] Transformations tested (optional)

### Limits Checked
- [ ] Total storage < 25GB
- [ ] Monthly bandwidth < 25GB
- [ ] Maximum file size: 50MB confirmed

## Vercel Setup

### Account & Project
- [ ] Account created at vercel.com
- [ ] GitHub repository connected
- [ ] Project imported from GitHub
- [ ] Project name: `dsdorg` (or your choice)
- [ ] Framework preset: Vite detected automatically

### Build Configuration
- [ ] Build command: `npm run build` (or `vite build`)
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`
- [ ] Node.js version: 18.x or higher

### Environment Variables (7 Required)
- [ ] `MONGODB_URI` - Full connection string from Atlas
- [ ] `ADMIN_PASSWORD` - Bcrypt hash (production) or plain (dev)
- [ ] `JWT_SECRET` - 32+ character random string
- [ ] `CLOUDINARY_CLOUD_NAME` - From Cloudinary dashboard
- [ ] `CLOUDINARY_API_KEY` - From Cloudinary dashboard
- [ ] `CLOUDINARY_API_SECRET` - From Cloudinary dashboard
- [ ] `NODE_ENV` - Set to `production`

### Deployment Settings
- [ ] Serverless functions region: Auto or closest to users
- [ ] Auto-deploy enabled on `main` branch
- [ ] Preview deployments enabled for PRs (optional)
- [ ] Environment variables encrypted

## Domain Configuration (Optional)

### DNS Setup (Namecheap or other)
- [ ] Custom domain purchased: `dylanseals.org`
- [ ] DNS provider account accessible
- [ ] Vercel domain added in project settings

### DNS Records
- [ ] **A Record**: `@` → Vercel IP `76.76.21.21`
- [ ] **CNAME Record**: `www` → `cname.vercel-dns.com`
- [ ] TTL set to 300 seconds (5 minutes)
- [ ] DNS propagation checked (use dnschecker.org)

### SSL Certificate
- [ ] Automatic SSL enabled in Vercel (default)
- [ ] Certificate provisioned (may take 1-24 hours)
- [ ] HTTPS redirect enabled
- [ ] Domain verified with green checkmark

## First Deployment

### Deploy
- [ ] Pushed code to GitHub `main` branch
- [ ] Vercel auto-deployed (check Deployments tab)
- [ ] Build completed successfully (green checkmark)
- [ ] Serverless functions deployed (check Functions tab)
- [ ] No build errors or warnings

### Verification
- [ ] Production URL works: `https://dsdorg.vercel.app`
- [ ] Custom domain works: `https://dylanseals.org` (if configured)
- [ ] HTTPS certificate valid (padlock icon in browser)
- [ ] Homepage loads correctly
- [ ] No 404 errors in browser console
- [ ] Static assets loading (CSS, JS, images)

## Post-Deployment Testing

### Functionality Tests
- [ ] Homepage displays correctly
- [ ] Search entries works
- [ ] Category filter works
- [ ] Click entry to view full page
- [ ] Entry page displays media correctly
- [ ] Admin login page accessible at `/admin/login`

### Admin Panel Tests
- [ ] Admin login works with production password
- [ ] JWT token stored in localStorage
- [ ] Dashboard shows all entries
- [ ] Category statistics display correctly
- [ ] "Create New Entry" button works

### Entry Creation Tests
- [ ] Create new text entry (no files)
- [ ] Entry saves successfully
- [ ] Entry appears on homepage timeline
- [ ] Entry slug generated correctly
- [ ] Entry accessible via `/entry/slug`

### File Upload Tests
- [ ] Upload single image (< 5MB)
- [ ] Upload progress shows percentage
- [ ] Image preview displays before upload
- [ ] Upload completes successfully
- [ ] Image displays in entry
- [ ] Image hosted on Cloudinary (check URL)
- [ ] Upload multiple images (test limit)
- [ ] Upload video file (if applicable)
- [ ] Upload audio file (if applicable)

### Edit/Delete Tests
- [ ] Edit existing entry
- [ ] Update text content
- [ ] Upload additional media
- [ ] Remove existing media (if UI supports)
- [ ] Delete entry
- [ ] Confirm deletion works

### Error Handling Tests
- [ ] Try logging in with wrong password (should fail gracefully)
- [ ] Try accessing admin without token (should redirect to login)
- [ ] Try uploading file > 50MB (should show error)
- [ ] Try uploading 11 files (should limit to 10)
- [ ] Trigger 401 error by clearing token (should redirect)
- [ ] Error boundary catches errors (test by breaking something temporarily)

### Performance Tests
- [ ] Homepage loads in < 3 seconds
- [ ] Navigation is instant (no page reload)
- [ ] Search responds instantly
- [ ] Images load quickly via Cloudinary CDN
- [ ] Mobile responsive (test on phone)

## Security Verification

### Authentication
- [ ] Cannot access admin routes without login
- [ ] JWT token expires after 24 hours
- [ ] Token stored in localStorage (not sessionStorage)
- [ ] Logout clears token correctly
- [ ] 401 responses redirect to login

### API Security
- [ ] `/api/entries` GET is public (no auth required)
- [ ] `/api/entries` POST requires authentication
- [ ] `/api/entries` PUT requires authentication
- [ ] `/api/entries` DELETE requires authentication
- [ ] `/api/upload` requires authentication
- [ ] `/api/auth` rate-limited (1-second delay on failure)

### CORS Configuration
- [ ] CORS allows only production domain in production
- [ ] CORS allows all origins in development
- [ ] Vercel routes configured correctly in `vercel.json`

### Password Security
- [ ] Production uses bcrypt hash (starts with `$2a$` or `$2b$`)
- [ ] bcrypt hash not visible in public GitHub repo
- [ ] `.env` file in `.gitignore`
- [ ] No hardcoded credentials in code

### Input Validation
- [ ] HTML content sanitized with sanitize-html
- [ ] File upload size limited to 50MB
- [ ] File upload count limited to 10 files
- [ ] Malicious HTML stripped before saving
- [ ] XSS attacks prevented

## Monitoring & Maintenance

### Logs
- [ ] Vercel deployment logs checked (no errors)
- [ ] Serverless function logs monitored
- [ ] MongoDB Atlas logs reviewed (if applicable)
- [ ] Cloudinary usage dashboard checked

### Performance
- [ ] Lighthouse score checked (target: 80+ performance)
- [ ] Core Web Vitals monitored
- [ ] Image optimization via Cloudinary working
- [ ] API response times < 500ms

### Backups
- [ ] MongoDB Atlas automatic backups enabled
- [ ] Cloudinary media backup strategy (optional)
- [ ] Git repository backed up on GitHub
- [ ] Environment variables documented securely offline

### Updates
- [ ] npm packages up to date (run `npm outdated`)
- [ ] Security vulnerabilities checked (run `npm audit`)
- [ ] Dependabot enabled on GitHub (optional)
- [ ] Breaking changes reviewed before updating

## Rollback Plan (If Deployment Fails)

### Immediate Actions
- [ ] Check Vercel deployment logs for errors
- [ ] Check browser console for JavaScript errors
- [ ] Check Network tab for failed API requests
- [ ] Verify all 7 environment variables set correctly

### Common Issues
- [ ] **MongoDB connection fails**: Check IP whitelist, connection string
- [ ] **Cloudinary upload fails**: Verify credentials, check usage limits
- [ ] **404 on routes**: Check `vercel.json` routing configuration
- [ ] **JWT errors**: Verify JWT_SECRET set correctly
- [ ] **Password login fails**: Check ADMIN_PASSWORD (bcrypt vs plain)
- [ ] **Static assets 404**: Check build output in `dist/` folder

### Rollback Steps
1. [ ] Revert to previous Vercel deployment (Deployments → Promote)
2. [ ] Check previous commit in GitHub (revert if needed)
3. [ ] Verify environment variables unchanged
4. [ ] Re-deploy with fixes

## Success Criteria

### All Green Checkmarks
- [ ] Local development works
- [ ] MongoDB Atlas connected
- [ ] Cloudinary uploads working
- [ ] Vercel deployed successfully
- [ ] Custom domain accessible (if configured)
- [ ] All features functional
- [ ] No console errors
- [ ] Security measures in place
- [ ] Performance acceptable
- [ ] Documentation complete

### Ready for Production
- [ ] Site accessible at production URL
- [ ] Admin can create/edit/delete entries
- [ ] File uploads work correctly
- [ ] Search and filter work
- [ ] No known bugs
- [ ] Monitoring in place
- [ ] Backup strategy documented

## Post-Launch

### Announce Launch
- [ ] Update GitHub README with live URL
- [ ] Share with friends/colleagues
- [ ] Update personal portfolio/CV with link

### Ongoing Maintenance
- [ ] Monitor Vercel analytics
- [ ] Check MongoDB Atlas usage (stay under 512MB free tier)
- [ ] Check Cloudinary usage (stay under 25GB)
- [ ] Review logs weekly for errors
- [ ] Update content regularly

---

## Estimated Time

- **Local Setup**: 15 minutes
- **MongoDB Atlas**: 10 minutes
- **Cloudinary**: 5 minutes
- **Vercel Deployment**: 20 minutes
- **Domain Configuration**: 30 minutes (if applicable)
- **Testing**: 30 minutes
- **Total**: **2-4 hours** (including domain setup)

---

## Resources

- **Full Deployment Guide**: See `VERCEL_DEPLOYMENT.md`
- **API Reference**: See `API_DOCUMENTATION.md`
- **Quick Start**: See `QUICKSTART.md`
- **Architecture Details**: See `MIGRATION.md`

---

**Deployment Date**: _____________  
**Deployed By**: _____________  
**Production URL**: _____________  
**Status**: ⬜ Pending | ⬜ In Progress | ⬜ Complete | ⬜ Failed

---

*Print this checklist or keep it open while deploying!*
