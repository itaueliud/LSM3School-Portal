# LSM3 Project - Quick Deployment Checklist

## 🎯 Choose Your Deployment Stack

### Option A: Quick & Free (Recommended for Learning)
- **Frontend:** Vercel (Free)
- **Backend:** Railway.app (Free - $5/month credit)
- **Database:** Neon PostgreSQL (Free)
- **Cost:** Free - $15/year (domain only)

### Option B: Professional (Recommended for Business)
- **Frontend:** Vercel or Netlify ($20/month)
- **Backend:** Railway ($7-25/month)
- **Database:** Neon or Railway Postgres ($0-30/month)
- **Domain:** Custom domain ($10-15/year)
- **Cost:** $40-60/month

---

## ✅ Pre-Deployment Checklist

### 1. Local Testing
- [ ] Backend runs locally: `npm start` (in /backend)
- [ ] Frontend builds locally: `npm run build` (in /frontend)
- [ ] No console errors in browser DevTools
- [ ] API endpoints respond correctly
- [ ] Database queries work
- [ ] No hardcoded local URLs
- [ ] `.env` files created for both frontend and backend

### 2. Code Preparation
- [ ] All code committed to git
- [ ] No sensitive data in code (API keys, passwords)
- [ ] Package.json has correct scripts:
  - Backend: `"start": "node src/index.js"`
  - Frontend: `"build": "vite build"`
- [ ] No 404 status on health check endpoint

### 3. Database Preparation
- [ ] Database schema is finalized
- [ ] All migrations are created
- [ ] Test data loaded (optional)
- [ ] Database backups enabled

### 4. Environment Variables
- [ ] Create `.env` files in both directories
- [ ] Use `.env.example` as template
- [ ] MongoDB/PostgreSQL connection string ready
- [ ] JWT_SECRET generated securely
- [ ] API URLs point to production

---

## 🚀 Deployment Steps

### Step 1: Deploy Database (Neon PostgreSQL)

**Time: 5 minutes**

1. Go to https://neon.tech
2. Sign up with GitHub account
3. Create new project
4. Copy the connection string:
   ```
   postgresql://user:password@host/dbname
   ```
5. Save for backend configuration

✅ **Database is now ready**

---

### Step 2: Deploy Backend (Railway.app)

**Time: 10 minutes**

**Option A: Using Railway Git Integration**

1. Go to https://railway.app
2. Sign up with GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository (techSwiftrix)
5. Give access to repository
6. Railway auto-detects Node.js project
7. Go to project Variables tab
8. Add environment variables:
   - `DATABASE_URL`: Paste Neon connection string
   - `JWT_SECRET`: Generate new secure random string
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://yourdomain.com` (or Vercel URL later)
   - `PORT`: `3000`
9. Railway automatically deploys
10. Get your API URL from Railway (e.g., `https://api.railway.app`)

**Option B: Using Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize in your backend directory
cd backend
railway init

# Deploy
railway up
```

✅ **Backend is now deployed**

---

### Step 3: Deploy Frontend (Vercel)

**Time: 10 minutes**

1. Go to https://vercel.com
2. Sign up with GitHub account
3. Click "New Project"
4. Select your repository (techSwiftrix)
5. Configure settings:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add environment variables:
   - `VITE_API_URL`: Paste your Railway backend URL from Step 2
7. Click "Deploy"
8. Wait for deployment to complete
9. Get your frontend URL (e.g., `https://lsm3.vercel.app`)

✅ **Frontend is now deployed**

---

### Step 4: Update CORS Settings

1. Go back to Railway backend dashboard
2. Update `FRONTEND_URL` variable to your Vercel URL
3. Railway redeploys automatically

✅ **Frontend and backend are now connected**

---

### Step 5: Test Deployed Application

In browser console:
```javascript
// Check if API is accessible
fetch('https://your-api-url/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ API Connected', data))
  .catch(err => console.error('❌ API Error', err))
```

Test these features:
- [ ] Can access deployed frontend
- [ ] Can login with test account
- [ ] API calls work
- [ ] Database reads/writes work
- [ ] No CORS errors in console
- [ ] No 404 errors

---

### Step 6: Custom Domain (Optional)

#### Register Domain
1. Go to Namecheap or GoDaddy
2. Register domain (e.g., `lsm3school.com`)
3. Note the nameservers

#### Connect to Vercel
1. Vercel Dashboard → Domains
2. Add domain
3. Update nameservers at registrar
4. Wait 24-48 hours for DNS propagation

#### Connect to Railway (API)
1. Railway Dashboard → Settings → Domains
2. Add custom domain (e.g., `api.lsm3school.com`)
3. Update DNS records if needed

---

## 📊 Post-Deployment Tasks

### Monitoring
- [ ] Check Vercel analytics dashboard weekly
- [ ] Monitor Railway logs for errors
- [ ] Setup email alerts for deployment failures
- [ ] Monitor database performance

### Backups
- [ ] Enable automatic Neon backups
- [ ] Setup weekly database exports
- [ ] Test recovery procedure

### Security
- [ ] Change default passwords
- [ ] Enable two-factor authentication
- [ ] Rotate JWT secret monthly
- [ ] Review CORS settings
- [ ] Setup rate limiting

### Performance
- [ ] Enable image optimization in Vercel
- [ ] Monitor frontend bundle size
- [ ] Setup database connection pooling
- [ ] Enable caching headers

---

## 🔗 Useful Links

| Service | Link | Purpose |
|---------|------|---------|
| Vercel | https://vercel.com | Frontend hosting |
| Railway.app | https://railway.app | Backend hosting |
| Neon | https://neon.tech | Database hosting |
| Namecheap | https://namecheap.com | Domain registration |

---

## ❓ Troubleshooting

### Frontend shows 404 after deployment
**Solution:** 
1. Check Vercel build logs
2. Verify `dist` folder is created
3. Confirm root directory is `frontend`
4. Check environment variables are set

### API not responding
**Solution:**
1. Check Railway service status
2. Verify DATABASE_URL is correct
3. Check Railway logs for errors
4. Ensure frontend CORS URL is updated

### Database connection fails
**Solution:**
1. Verify DATABASE_URL format
2. Check Neon database is running
3. Whitelist Railway IP in Neon (if needed)
4. Verify credentials are correct

### CORS errors in browser
**Solution:**
1. Check `FRONTEND_URL` in backend
2. Ensure backend is using correct origin
3. Verify API URL in frontend matches deployment
4. Restart backend service

---

## 📝 Notes

- First deployment may take 5-10 minutes
- Neon auto-suspends after 1 week of inactivity (free tier)
- Railway provides $5/month free credit
- Vercel auto-scales based on traffic
- All SSL certificates automatic

---

## 🎉 Success!

Your application is now live and accessible worldwide!

**Next steps:**
1. Share your application URL
2. Invite team members
3. Start using it in production
4. Gather user feedback
5. Scale as needed

For more details, see `HOSTING_GUIDE.md` in the project root.
