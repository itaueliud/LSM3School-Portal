# LSM3 Project Hosting Guide

This guide covers hosting your full-stack school management system with frontend, backend, and database.

---

## 🏗️ Architecture Overview

```
Frontend (React/Vite)
    ↓ (API calls)
Backend (Node.js/Express)
    ↓ (queries)
Database (PostgreSQL/MySQL)
```

---

## 📋 Pre-Deployment Checklist

### Backend Setup
- [ ] Environment variables configured (.env file)
- [ ] Database migrations completed
- [ ] API endpoints tested locally
- [ ] CORS configured properly
- [ ] Error handling implemented
- [ ] Database backups configured

### Frontend Setup
- [ ] API endpoints updated to production URLs
- [ ] Build process tested (`npm run build`)
- [ ] Environment variables configured
- [ ] Performance optimized
- [ ] PWA/caching configured (optional)

---

## 🚀 Deployment Options

### OPTION 1: FREE/LOW-COST (Recommended for Learning)

#### **Frontend: Vercel (FREE)**
Best for React/Vite applications

**Steps:**
1. Push your code to GitHub
2. Install Vercel CLI: `npm install -g vercel`
3. Run: `vercel`
4. Follow the prompts and authorize with GitHub
5. Set environment variables in Vercel dashboard

**Configuration (vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@vite-api-url"
  }
}
```

**Environment Variable Setup:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add: `VITE_API_URL` = `https://your-backend-url.com`

---

#### **Backend: Railway.app (FREE for 500 hours/month)**
Simple Node.js deployment

**Steps:**
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add PostgreSQL/MySQL service from Railway
6. Configure environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `PORT=3000`

**Cost:** Free tier includes $5/month credit (sufficient for hobby projects)

---

#### **Database: Railway Postgres (Included)**
Railway provides integrated PostgreSQL

**Connection String:**
Railway will provide this automatically:
```
postgresql://user:password@host:port/database
```

---

### OPTION 2: PRODUCTION-READY (Recommended for Business)

#### **Frontend: Netlify**
**Steps:**
1. Go to https://netlify.com
2. Connect your GitHub account
3. Select repository and authorize
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables in Netlify UI
6. Deploy

**Custom Domain:**
1. In Netlify Dashboard → Domain management
2. Add your custom domain
3. Update DNS records at your registrar

---

#### **Backend: Render.com**
**Steps:**
1. Go to https://render.com
2. Connect GitHub account
3. Create new "Web Service"
4. Select your backend repository
5. Configure:
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables (same as Railway)
6. Deploy

**Cost:** Free tier available, paid tier starts at $7/month

---

#### **Database: Neon (PostgreSQL - FREE)**
Modern PostgreSQL hosting

**Steps:**
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project
4. Copy connection string
5. Add to backend environment variables as `DATABASE_URL`

**Connection management:**
- Auto-suspend after 1 week of inactivity (free tier)
- Cold start is ~3 seconds
- Perfect for learning/hobby projects

---

### OPTION 3: ENTERPRISE (Highest Control)

#### **VPS Hosting: DigitalOcean Droplet**
**Cost:** $4-6/month for basic droplet

**Steps:**
1. Create DigitalOcean account
2. Create new Droplet (Ubuntu 22.04)
3. SSH into droplet
4. Install Node.js, PostgreSQL
5. Clone your repository
6. Configure PM2 for process management
7. Setup Nginx as reverse proxy
8. Configure SSL with Let's Encrypt

**Basic Setup Commands:**
```bash
# Connect to droplet
ssh root@your_droplet_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Clone your repo
cd /var/www
git clone your-repo-url
cd your-repo/backend
npm install

# Start app with PM2
pm2 start npm --name "lsm3-backend" -- start
pm2 startup
pm2 save

# Install Nginx
sudo apt-get install -y nginx

# Configure SSL with Certbot
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

**Nginx Configuration (at `/etc/nginx/sites-available/default`):**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🔑 Environment Variables Setup

### Backend (.env file)
```env
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:port/lsm3_db
DB_HOST=host
DB_PORT=5432
DB_NAME=lsm3_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secure_random_string_here
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=https://yourdomain.com

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# App
APP_NAME=LSM3 School Management System
APP_VERSION=1.0.0
```

### Frontend (.env file)
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=LSM3 Portal
```

---

## 📦 Pre-Deployment Checklist

### Backend
```bash
# 1. Test your build
npm run build

# 2. Test production environment locally
NODE_ENV=production npm start

# 3. Check all dependencies
npm list

# 4. Run tests
npm test

# 5. Check for security vulnerabilities
npm audit

# 6. Update environment variables
# Make sure all required .env variables are set
```

### Frontend
```bash
# 1. Build the project
npm run build

# 2. Preview the build locally
npm run preview

# 3. Check bundle size
npm run build -- --report

# 4. Update API base URL for production
# Update in src/services/api.js
```

---

## 🔗 Connecting Frontend to Backend

### Update API Configuration

**File: `frontend/src/services/api.js`**

```javascript
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL,
  timeout: 10000,
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

### Backend CORS Configuration

**File: `backend/src/index.js`**

```javascript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📊 Recommended Deployment Stack (Best Value)

### For Hobby/Learning Projects:
```
Frontend:   Vercel (FREE)
Backend:    Railway.app (FREE - $5/month credit)
Database:   Neon PostgreSQL (FREE)
Domain:     Freenom or Namecheap ($0.99-$15/year)
```
**Total Cost: ~$15-20/year**

### For Small Business/Production:
```
Frontend:   Vercel ($20/month) or Netlify ($19/month)
Backend:    Railway.app or Render ($7-25/month)
Database:   Neon or Railway PostgreSQL ($10-30/month)
Domain:     Custom domain ($10-15/year)
SSL:        Automatic (included)
CDN:        Automatic (included)
```
**Total Cost: ~$40-60/month**

---

## 🚨 Post-Deployment Steps

### Monitoring & Logging
```bash
# Railway.app - Built-in logs
# Render.com - Built-in logs
# Vercel - Built-in analytics

# For DigitalOcean:
# Check logs with: tail -f ~/.pm2/logs/lsm3-backend-out.log
```

### Database Backups
- Railway: Automatic daily backups
- Neon: Automatic nightly backups
- DigitalOcean: Manual or automated snapshots

### SSL/HTTPS
- Vercel: Automatic
- Netlify: Automatic
- Railway/Render: Automatic
- DigitalOcean: Use Let's Encrypt (certbot)

### Performance Optimization
1. Enable gzip compression in Nginx/Express
2. Configure CDN for static assets
3. Setup database connection pooling
4. Enable Redis caching (optional)
5. Monitor API response times

---

## 🔧 Troubleshooting

### Common Issues

**Frontend not connecting to backend:**
1. Check `VITE_API_URL` environment variable
2. Verify backend CORS settings
3. Check browser console for errors
4. Ensure backend is running and accessible

**Database connection errors:**
1. Verify DATABASE_URL is correct
2. Check database credentials
3. Whitelist IP addresses if required
4. Check firewall rules

**Build failures:**
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check for syntax errors: `npm run lint`
3. Review build logs for warnings
4. Check disk space on server

---

## 📚 Useful Resources

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Render Docs:** https://render.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Node.js Best Practices:** https://nodejs.org/en/docs/guides/

---

## ✅ Summary

1. **Choose your hosting provider** based on budget and scale
2. **Prepare environment variables** for production
3. **Update API URLs** in frontend configuration
4. **Test locally** with production settings
5. **Deploy frontend** first (Vercel)
6. **Deploy backend** second (Railway/Render)
7. **Connect the services** and test all features
8. **Monitor** application performance and logs
9. **Setup backups** for database
10. **Configure custom domain** and SSL (optional)

Good luck with your deployment! 🎉
