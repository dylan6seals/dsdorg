# Quick Start Guide

Get your MERN stack personal portfolio running in **under 15 minutes**.

## Prerequisites

- **Node.js** 18+ and npm
- **Git** installed
- **Code editor** (VS Code recommended)

## Local Development Setup

### 1. Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/dylan6seals/dsdorg.git
cd dsdorg

# Install dependencies
npm install
```

### 2. Environment Configuration (3 minutes)

```bash
# Create environment file
cp .env.example .env
```

**Edit `.env` with your credentials:**

```bash
# MongoDB - Get from MongoDB Atlas (free M0 tier)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dsdorg

# Admin Password - For local dev, use plain text (production uses bcrypt)
ADMIN_PASSWORD=your-secure-password

# JWT Secret - Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=abc123def456...

# Cloudinary - Get from cloudinary.com (free tier)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret

# Environment
NODE_ENV=development
```

### 3. Start Development Server (1 minute)

```bash
npm run dev
```

**Open**: http://localhost:5173

You should see your homepage!

## First Run Checklist

### ✅ Homepage Works
- [ ] Timeline displays (may be empty if no entries)
- [ ] Search box appears
- [ ] Category filter shows
- [ ] Stats show "0 total"

### ✅ Admin Access
1. Click "Admin" in footer or visit: http://localhost:5173/admin/login
2. Enter your `ADMIN_PASSWORD` from `.env`
3. Should redirect to dashboard

### ✅ Create First Entry
1. Click "Create New Entry" button
2. Fill in form:
   - **Title**: My First Entry
   - **Category**: text
   - **Date**: (auto-filled with today)
   - **Content**: Type anything in markdown
3. Click "Save Entry"
4. Should see success message

### ✅ View Entry
1. Click "View Site" in admin panel
2. Should see your new entry on homepage
3. Click entry title to see full view

### ✅ Test File Upload
1. Edit your entry
2. Click "Choose Files" button
3. Select 1-2 images from your computer
4. Should see preview thumbnails
5. Click "Save Entry"
6. Upload progress should show
7. Images should appear in entry

## Common Issues

### Port Already in Use

```bash
# Vite default port 5173 is taken
# Edit vite.config.js and change:
server: {
  port: 3000  # Use any available port
}
```

### MongoDB Connection Fails

```bash
Error: querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net
```

**Fix**:
1. Check `MONGODB_URI` is correct
2. Whitelist your IP in MongoDB Atlas:
   - Atlas Dashboard → Network Access → Add IP Address
   - Use `0.0.0.0/0` for development (allow all)

### Cloudinary Upload Fails

```bash
Error: Upload failed: Invalid API key
```

**Fix**:
1. Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
2. Check credentials at: https://cloudinary.com/console
3. Copy from "Account Details" section

### Admin Login Fails

```bash
Error: Invalid password
```

**Fix**:
1. Check `ADMIN_PASSWORD` in `.env` exactly matches what you're typing
2. No quotes needed in `.env` file
3. For local dev, use plain text password (not bcrypt hash)

### API Requests Fail

```bash
Failed to fetch entry
```

**Fix**:
1. Check browser console for CORS errors
2. Verify Vite dev server is running
3. Try `vercel dev` instead (requires Vercel CLI):
   ```bash
   npm i -g vercel
   vercel dev
   ```

## Markdown Basics

```markdown
# Big header
## Medium header
### Small header

**bold text**
*italic text*

[link text](https://url.com)

- bullet point
- another point

> quote

code in `backticks````

## Categories

Choose from:
- **text**: written content
- **image**: photo or graphic
- **video**: video file
- **audio**: music or podcast
- **link**: external resource
- **mixed**: combination

## Project Structure

```
dsdorg/
├── api/                    # Backend serverless functions
│   ├── auth.js            # Login endpoint
│   ├── entries.js         # CRUD operations
│   └── upload.js          # File upload
├── src/                   # React frontend
│   ├── pages/            # Page components
│   ├── components/       # Reusable components
│   └── utils/api.js      # Axios instance
├── public/               # Static assets
└── .env                  # Your environment variables
```

## Next Steps

Once local development works:

1. **Add Content**:
   - Create multiple entries
   - Test all categories
   - Upload various file types

2. **Customize**:
   - Edit `src/styles/*.css` for visual changes
   - Modify components in `src/pages/`
   - Update site title in `index.html`

3. **Deploy to Production**:
   - Follow `VERCEL_DEPLOYMENT.md` for complete guide
   - Estimated time: 2-4 hours
   - Result: Live site at your domain

## Getting Help

### Documentation Order
1. **QUICKSTART.md** (this file) - Get running locally
2. **README.md** - Understand features
3. **VERCEL_DEPLOYMENT.md** - Deploy to production
4. **API_DOCUMENTATION.md** - API reference
5. **MIGRATION.md** - Technical details

### Troubleshooting
- Check browser console for errors
- Verify all environment variables
- Check MongoDB Atlas network access
- Check Cloudinary dashboard

## Scripts Reference

```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

---

**Quick Start Complete!** 🎉

You now have a fully functional local development environment.

**Next**: When ready to deploy, open `VERCEL_DEPLOYMENT.md`
