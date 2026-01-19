# DEPLOYMENT GUIDE

## When you're ready to deploy dsd.org to production

---

## Option 1: Traditional VPS (Recommended)

### Requirements
- VPS with Node.js installed (DigitalOcean, Linode, AWS EC2, etc.)
- Domain name pointed to your server
- SSH access

### Steps

1. **Prepare your server**
```bash
# Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install nginx for reverse proxy
sudo apt-get install nginx
```

2. **Upload your code**
```bash
# On your local machine
git add .
git commit -m "Ready for deployment"
git push origin main

# On your server
git clone https://github.com/dylan6seals/dsdorg.git
cd dsdorg
npm install
```

3. **Configure environment**
```bash
# Create .env file
cp .env.example .env
nano .env

# Set production values:
NODE_ENV=production
PORT=3000
ADMIN_PASSWORD=your_super_secure_password_here
SESSION_SECRET=random_long_string_here
```

4. **Start with PM2**
```bash
pm2 start server.js --name dsdorg
pm2 save
pm2 startup
```

5. **Configure nginx**
```bash
sudo nano /etc/nginx/sites-available/dsdorg

# Add this configuration:
server {
    listen 80;
    server_name dsd.org www.dsd.org;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    client_max_body_size 50M;
}

# Enable site
sudo ln -s /etc/nginx/sites-available/dsdorg /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **Add SSL certificate (Let's Encrypt)**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d dsd.org -d www.dsd.org
```

7. **Set up firewall**
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## Option 2: Platform as a Service (PaaS)

### Railway.app (Easy)
1. Connect GitHub repo
2. Add environment variables
3. Deploy automatically

### Render.com
1. Connect GitHub repo
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Add environment variables
5. Deploy

### Heroku
1. Install Heroku CLI
2. `heroku create dsdorg`
3. `heroku config:set ADMIN_PASSWORD=your_password`
4. `git push heroku main`

---

## Option 3: Serverless (Advanced)

For serverless deployment, you'd need to:
- Convert to serverless functions
- Use managed database (not SQLite)
- Use cloud storage for uploads

Not recommended for this project - keep it simple!

---

## Database Backups

### Manual backup
```bash
# Backup
cp data/dsdorg.db data/dsdorg.db.backup.$(date +%Y%m%d)

# Restore
cp data/dsdorg.db.backup.20260119 data/dsdorg.db
```

### Automated backups (cron)
```bash
crontab -e

# Add this line (daily backup at 2am)
0 2 * * * cp /path/to/dsdorg/data/dsdorg.db /path/to/backups/dsdorg.db.$(date +\%Y\%m\%d)
```

---

## Monitoring

### PM2 monitoring
```bash
pm2 monit
pm2 logs dsdorg
pm2 restart dsdorg
```

### Check if site is up
```bash
curl https://dsd.org
```

---

## Updates

### Pull latest changes
```bash
cd /path/to/dsdorg
git pull origin main
npm install
pm2 restart dsdorg
```

---

## Security Checklist

- [ ] Changed default admin password
- [ ] Set strong SESSION_SECRET
- [ ] Enabled HTTPS (SSL)
- [ ] Set up firewall
- [ ] Regular backups configured
- [ ] Limited file upload sizes
- [ ] Sanitizing user input (already implemented)
- [ ] Using environment variables (not hardcoded secrets)

---

## Performance Tips

### Enable gzip in nginx
```nginx
gzip on;
gzip_types text/css application/javascript image/svg+xml;
```

### Add caching headers
```nginx
location /uploads/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Optimize images before upload
Use tools like:
- ImageOptim
- TinyPNG
- squoosh.app

---

## Domain Setup

### DNS Records
```
A     @       your.server.ip.address
A     www     your.server.ip.address
```

Or if using CNAME:
```
CNAME www     your-app.railway.app
```

---

## Maintenance

### Regular tasks
- Check PM2 logs weekly
- Backup database weekly
- Update Node.js packages monthly
- Monitor disk space
- Check SSL certificate renewal (auto with certbot)

### Server maintenance
```bash
# Update system
sudo apt update && sudo apt upgrade

# Update npm packages
cd /path/to/dsdorg
npm outdated
npm update
pm2 restart dsdorg
```

---

## Troubleshooting Production

**Site is down**
```bash
pm2 status
pm2 logs dsdorg --lines 50
```

**Database locked**
```bash
# Check if multiple processes are running
ps aux | grep node
# Kill duplicates if needed
```

**Out of disk space**
```bash
df -h
# Clean old backups
# Compress old media files
```

**High memory usage**
```bash
pm2 restart dsdorg
# Consider upgrading VPS if persistent
```

---

## Scaling (Future)

If you get lots of traffic:

1. **Add CDN** for static assets (Cloudflare)
2. **Optimize database** (add indexes, optimize queries)
3. **Cache responses** (Redis or similar)
4. **Upgrade VPS** (more RAM, faster CPU)
5. **Consider SQLite alternatives** (PostgreSQL for very high traffic)

But honestly, SQLite can handle a LOT. You probably won't need this.

---

## Cost Estimates

### VPS Options
- DigitalOcean Droplet: $6-12/month
- Linode: $5-10/month
- Vultr: $5-10/month

### PaaS Options
- Railway: $5-10/month
- Render: $7/month
- Heroku: $7-25/month

### Domain
- .org domain: $10-15/year

**Total: ~$10-20/month**

---

## Pre-deployment Checklist

- [ ] Test locally thoroughly
- [ ] Backup database
- [ ] Change admin password
- [ ] Generate strong session secret
- [ ] Test on mobile
- [ ] Check all links work
- [ ] Verify uploads work
- [ ] Test search function
- [ ] Create a few real entries
- [ ] Take screenshots
- [ ] Set up analytics (optional)
- [ ] Prepare announcement post

---

## Post-deployment

1. Test everything again on production
2. Create your first real entry
3. Share with friends
4. Enjoy your personal internet space!

---

*Remember: This is YOUR space. There's no rush to deploy. Take your time, fill it with content you love, make it truly yours.*
