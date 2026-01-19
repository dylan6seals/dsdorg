# DSD.ORG - MERN Stack Deployment Guide

Complete guide for deploying your personal life portfolio to Vercel with MongoDB Atlas and Cloudinary.

## Prerequisites

- GitHub repository with your code
- [Vercel account](https://vercel.com/signup) (free)
- [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register) (free)
- [Cloudinary account](https://cloudinary.com/users/register/free) (free)
- Domain name (optional - use dylanseals.org or your own)

## Step 1: Set Up MongoDB Atlas

### 1.1 Create a Free Cluster

1. Go to [MongoDB Atlas](https://mongodb.com/cloud/atlas)
2. Click "Build a Database"
3. Choose **M0 FREE** tier
4. Select your preferred region (closest to your users)
5. Name your cluster (e.g., "dsdorg")
6. Click "Create"

### 1.2 Create Database User

1. In Security → Database Access → Add New Database User
2. Choose "Password" authentication
3. Username: `dsdorg-admin` (or your choice)
4. Generate a secure password and **save it securely**
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

### 1.3 Configure Network Access

1. Go to Security → Network Access → Add IP Address
2. Click "Allow Access from Anywhere" (for Vercel compatibility)
3. This adds `0.0.0.0/0` to the whitelist
4. Click "Confirm"

**Note**: Vercel functions use dynamic IPs, so we need to allow all IPs. Your JWT authentication keeps the API secure.

### 1.4 Get Connection String

1. Go to Database → Connect
2. Choose "Connect your application"
3. Driver: Node.js, Version: 5.5 or later
4. Copy the connection string:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. Replace `<username>` with your database username
6. Replace `<password>` with your database user password
7. Add `/dsdorg` after `.net/` to specify the database name:
```
mongodb+srv://dsdorg-admin:yourpassword@cluster0.xxxxx.mongodb.net/dsdorg?retryWrites=true&w=majority
```

**Save this connection string** - you'll need it for Vercel environment variables.

## Step 2: Set Up Cloudinary

### 2.1 Create Account

1. Go to [Cloudinary Signup](https://cloudinary.com/users/register/free)
2. Sign up for free account (25GB storage, 25GB bandwidth/month)
3. Verify your email

### 2.2 Get API Credentials

1. Go to your Dashboard
2. Copy these three values:
   - **Cloud Name**: Your unique cloud identifier
   - **API Key**: Your API key (looks like a long number)
   - **API Secret**: Click "eye" icon to reveal, then copy

**Save these credentials** - you'll add them to Vercel.

### 2.3 Configure Upload Settings (Optional)

1. Go to Settings → Upload
2. Enable "Unique filename" for automatic naming
3. Set "Default folder" to "dsdorg" to organize uploads

## Step 3: Generate Secure Passwords

### 3.1 Generate JWT Secret

Run this command to generate a secure random string:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Save the output** - this is your JWT_SECRET.

### 3.2 Hash Admin Password

For production, use bcrypt to hash your password:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your_actual_password', 10));"
```

Replace `your_actual_password` with your desired admin password. 

**Save the output hash** (starts with `$2a$` or `$2b$`) - this is your ADMIN_PASSWORD.

**Alternative**: You can use a plain text password for testing, but hashed is strongly recommended for production.

## Step 4: Deploy to Vercel

### 4.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 4.2 Connect GitHub to Vercel

**Option A: Web Interface (Recommended)**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository `dylan6seals/dsdorg`
4. Vercel will auto-detect it as a Vite project

**Option B: CLI**

```bash
cd dsdorg
vercel
```

Follow the prompts to link your GitHub repository.

### 4.3 Configure Build Settings

In the Vercel import screen:

- **Framework Preset**: Vite
- **Build Command**: `vite build` (or leave default)
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Click "Deploy" (but it will fail without environment variables - that's expected).

### 4.4 Add Environment Variables

1. In your Vercel project → Settings → Environment Variables
2. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NODE_ENV` | `production` | Production |
| `MONGODB_URI` | Your full MongoDB connection string | All |
| `ADMIN_PASSWORD` | Your bcrypt hash or plain password | All |
| `JWT_SECRET` | Your generated JWT secret (64+ chars) | All |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | All |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | All |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | All |

**Important**: 
- Select "Production", "Preview", and "Development" for each variable
- Don't include quotes around values
- Don't expose these values publicly

### 4.5 Redeploy

1. Go to Deployments tab
2. Click on the failed deployment
3. Click "Redeploy" button
4. Wait 1-2 minutes for build to complete

Your site will be live at `https://your-project.vercel.app`!

## Step 5: Configure Custom Domain (dylanseals.org)

### 5.1 Add Domain in Vercel

1. Go to your Vercel project → Settings → Domains
2. Click "Add"
3. Enter `dylanseals.org`
4. Click "Add"
5. Also add `www.dylanseals.org`

Vercel will provide DNS records to configure.

### 5.2 Configure DNS in Namecheap

1. Log in to [Namecheap](https://www.namecheap.com)
2. Go to Domain List → dylanseals.org → Manage
3. Go to "Advanced DNS" tab

### 5.3 Add DNS Records

Add/modify these records:

**For Root Domain (dylanseals.org):**

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | @ | `76.76.21.21` | Automatic |
| A Record | @ | `76.76.21.93` | Automatic |
| A Record | @ | `76.76.21.164` | Automatic |
| A Record | @ | `76.76.21.241` | Automatic |

**For WWW Subdomain:**

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME Record | www | `cname.vercel-dns.com.` | Automatic |

**Note**: Values above are Vercel's current IPs. Always verify with Vercel's provided DNS records in case they've changed.

### 5.4 Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours (usually ~30 minutes)
- Check status at [whatsmydns.net](https://www.whatsmydns.net/)
- Vercel will automatically provision SSL certificate (Let's Encrypt)
- Your site will be available at both `http://dylanseals.org` and `https://dylanseals.org`

### 5.5 Verify SSL Certificate

1. Wait for Vercel to show "Valid Configuration" in Domains tab
2. Visit `https://dylanseals.org` - should show secure padlock
3. HTTP will automatically redirect to HTTPS

## Step 6: Test Your Deployment

### 6.1 Test Public Site

1. Visit `https://dylanseals.org`
2. Should show empty timeline (no entries yet)
3. Test search and filters
4. Check responsive design on mobile

### 6.2 Test Admin Login

1. Go to `https://dylanseals.org/admin/login`
2. Enter your admin password
3. Should redirect to dashboard
4. Check localStorage has `adminToken` (browser DevTools → Application → Local Storage)

### 6.3 Create Test Entry

1. Click "new entry"
2. Fill in:
   - Title: "Test Entry"
   - Category: "text"
   - Content Type: "markdown"
   - Content: "# Hello World\n\nThis is a **test** entry."
3. Click "add media files" and upload an image
4. Click "create entry"
5. Should redirect to dashboard showing new entry

### 6.4 Verify Entry Display

1. Go to main page
2. Should see "Test Entry" in timeline
3. Click entry to view full page
4. Verify markdown rendered correctly
5. Verify image displays from Cloudinary URL

### 6.5 Test File Upload

1. Check uploaded image URL in browser DevTools → Network tab
2. Should be `res.cloudinary.com/your-cloud-name/image/upload/...`
3. Verify image loads quickly (CDN delivery)

## Step 7: Ongoing Maintenance

### Monitor Usage

**MongoDB Atlas:**
- Dashboard → Clusters → Metrics
- Monitor: Storage size, connections, operations/second
- Free tier limits: 512MB storage, 500 connections

**Cloudinary:**
- Dashboard → Usage
- Monitor: Storage, bandwidth, transformations
- Free tier limits: 25GB storage, 25GB/month bandwidth

**Vercel:**
- Dashboard → Usage
- Monitor: Bandwidth, build minutes, function invocations
- Free tier limits: 100GB bandwidth/month, 6000 build minutes/month

### Backup Strategy

**Database Backups:**

1. Manual export:
```bash
mongodump --uri="your-mongodb-uri" --out=./backup
```

2. Or use MongoDB Atlas automated backups (paid feature)

**Code Backups:**

- GitHub already serves as version control
- Vercel keeps deployment history

**Media Backups:**

- Cloudinary stores files permanently unless deleted
- Download via Cloudinary Media Library if needed

### Update Dependencies

Regularly check for updates:

```bash
npm outdated
npm update
```

Then commit changes and Vercel will auto-deploy.

### Monitor Logs

**Vercel Function Logs:**

1. Go to Deployments → Select deployment
2. Click "Functions" tab
3. Click any function to see logs
4. Useful for debugging API errors

**MongoDB Logs:**

1. MongoDB Atlas → Deployment → Database
2. Click cluster → Metrics → Real-time tab
3. View slow queries, errors

## Troubleshooting

### Build Fails on Vercel

**Error: "Cannot find module"**
- Check `package.json` has all dependencies
- Run `npm install` locally and commit `package-lock.json`

**Error: "Build exceeded maximum duration"**
- Check for circular dependencies
- Optimize imports (tree-shaking)
- Contact Vercel support if persists

### API Endpoints Return 500

**Check Function Logs:**
1. Vercel Dashboard → Deployments → Functions
2. Look for error messages

**Common Issues:**
- MongoDB connection string incorrect
- Environment variables not set
- Cloudinary credentials invalid

### Cannot Upload Files

**Error: "Unauthorized"**
- Check JWT token in localStorage (browser DevTools)
- Try logging out and back in
- Verify `JWT_SECRET` matches between login and API

**Error: "File too large"**
- Max file size is 50MB (Cloudinary config)
- Check file size before uploading
- Consider resizing images before upload

**Error: "Invalid credentials"**
- Verify Cloudinary credentials in Vercel environment variables
- Check no extra spaces in credential values

### Domain Not Working

**DNS Not Resolving:**
- Wait 30+ minutes for propagation
- Check DNS with `nslookup dylanseals.org`
- Verify DNS records in Namecheap match Vercel requirements

**Certificate Error:**
- Wait for Vercel to provision SSL (can take up to 24 hours)
- Check Vercel Domains tab shows "Valid Configuration"
- Try removing and re-adding domain in Vercel

### Database Connection Issues

**Error: "MongoServerError: Authentication failed"**
- Check username/password in connection string
- Verify database user exists in MongoDB Atlas
- Check user has read/write permissions

**Error: "MongoNetworkError: connection timeout"**
- Check IP whitelist includes `0.0.0.0/0`
- Verify cluster is running (not paused)
- Check MongoDB Atlas status page

## Security Checklist

- ✅ Use bcrypt hashed password for `ADMIN_PASSWORD`
- ✅ Use strong random `JWT_SECRET` (64+ characters)
- ✅ Never commit `.env` file to Git
- ✅ Enable 2FA on Vercel, MongoDB, Cloudinary accounts
- ✅ Regularly update dependencies for security patches
- ✅ Monitor Vercel function logs for suspicious activity
- ✅ Set strong password on MongoDB Atlas database user
- ✅ Use HTTPS only (Vercel handles this automatically)

## Cost Estimate

Running on free tiers:

| Service | Free Tier | Typical Usage | Cost |
|---------|-----------|---------------|------|
| Vercel | 100GB bandwidth/month | ~1-5GB | $0 |
| MongoDB Atlas | 512MB storage | ~10-50MB | $0 |
| Cloudinary | 25GB storage + 25GB bandwidth | ~1-10GB | $0 |
| Namecheap Domain | N/A | 1 domain | ~$10/year |

**Total: ~$10/year** (just domain cost)

## Getting Help

**Documentation:**
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Cloudinary Docs](https://cloudinary.com/documentation)

**Support:**
- Vercel: [vercel.com/support](https://vercel.com/support)
- MongoDB: [support.mongodb.com](https://support.mongodb.com/)
- Cloudinary: [support.cloudinary.com](https://support.cloudinary.com/)

---

## Next Steps

1. ✅ Complete deployment following steps 1-6
2. ✅ Create your first real entry
3. ✅ Customize colors/styles if desired (in `src/styles/main.css`)
4. ✅ Share your site!
5. ✅ Set up regular backups
6. ✅ Monitor usage to stay within free tiers

**Your personal corner of the internet is live!** 🎉

---

*Last Updated: January 19, 2026*
