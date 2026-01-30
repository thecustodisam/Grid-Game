# 🚀 Vercel Deployment Guide

Complete guide to deploy your NBA Top Shot Immaculate Grid game to Vercel.

## 📋 Prerequisites

1. A Vercel account (free): https://vercel.com/signup
2. Vercel CLI installed (optional but recommended):
   ```bash
   npm install -g vercel
   ```
3. Your code committed to GitHub (already done ✅)

---

## 🎯 Deployment Options

### Option 1: Deploy via GitHub (Recommended - Easiest)

This is the easiest method with automatic deployments on every push.

#### Step 1: Connect to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub account and repository: `thecustodisam/Grid-Game`
4. Click "Import"

#### Step 2: Configure Build Settings

Vercel should auto-detect the settings, but verify:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### Step 3: Add Build Script

Make sure your `package.json` has:
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

#### Step 4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Your app will be live at: `https://your-project-name.vercel.app`

---

### Option 2: Deploy via CLI (Advanced)

Use this for more control and local deployment.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Deploy

```bash
# From your project directory
cd "/Users/samheimuli/Dapper/Grid Game"

# Deploy to production
vercel --prod
```

#### Step 4: Follow Prompts

- Setup and deploy? `Y`
- Which scope? Select your account
- Link to existing project? `N` (first time) or `Y` (subsequent)
- What's your project's name? `grid-game` (or your choice)
- In which directory is your code located? `./`
- Want to override settings? `N`

---

## ⚙️ Configuration Files

### vercel.json

Already created in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "functions": {
    "api/**/*.js": {
      "memory": 3008,
      "maxDuration": 10
    }
  }
}
```

### package.json (Update)

Ensure you have the build script:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "server": "node server.js"
  }
}
```

---

## 🔧 Backend API Setup

Your backend is configured to work with Vercel serverless functions.

### How It Works

- Frontend: Static files served from `/dist`
- Backend: Serverless functions in `/api` directory
- Data: Loaded on cold start (first request may be slower)
- Subsequent requests: Fast with caching

### API Endpoints

Once deployed, your API will be available at:

```
https://your-app.vercel.app/api/health
https://your-app.vercel.app/api/moments
https://your-app.vercel.app/api/players
https://your-app.vercel.app/api/validate
https://your-app.vercel.app/api/hint
https://your-app.vercel.app/api/grid/daily
```

---

## 🎮 Testing Deployment

### Test Frontend

```bash
# Visit your Vercel URL
https://your-app.vercel.app
```

### Test API

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Get daily grid
curl https://your-app.vercel.app/api/grid/daily

# Get all players
curl https://your-app.vercel.app/api/players
```

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Build exceeded maximum duration"**
- Solution: Increase build timeout in Vercel project settings
- Go to: Project Settings → General → Build & Development Settings

**Error: "Out of memory"**
- Solution: Already configured with 3008MB memory in vercel.json
- If still failing, reduce data size or split into chunks

### API Not Working

**Error: "Cannot find module"**
- Check that all imports use relative paths
- Ensure data files are included in deployment

**Error: "Function timeout"**
- Increase maxDuration in vercel.json (max 60s on Pro plan)
- Optimize data loading

### Data Too Large

**Error: "Deployment size exceeded"**

If your data files are too large (>50MB total):

**Option A: Use Environment Variable**
```bash
# Store data URL in environment variable
vercel env add DATA_URL
# Enter URL to hosted JSON file
```

**Option B: Use External Storage**
- Upload `topshot-moments.json` to Vercel Blob Storage
- Update dataService to fetch from URL

**Option C: Use Static Version**
- Use the frontend-only version without backend
- All data bundled in the build

---

## 📊 Performance Optimization

### Enable Caching

Add headers in vercel.json:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=3600, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

### Edge Functions (Optional)

For faster global performance:

```json
{
  "functions": {
    "api/health.js": {
      "runtime": "edge"
    }
  }
}
```

---

## 🔒 Environment Variables

If you need to add environment variables:

### Via Dashboard

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add variables:
   - `NODE_ENV=production`
   - `API_URL=https://your-app.vercel.app/api`

### Via CLI

```bash
vercel env add NODE_ENV
# Enter: production
```

---

## 🚀 Automatic Deployments

Once connected to GitHub:

- **Push to main branch** → Automatic production deployment
- **Push to other branches** → Automatic preview deployment
- **Pull requests** → Automatic preview URLs

### Preview URLs

Each push gets a unique URL:
```
https://grid-game-abc123.vercel.app
```

---

## 📦 Alternative: Frontend-Only Deployment

If you want to deploy just the frontend (simpler, no API):

### Step 1: Update main.jsx

```javascript
// Use static data version
import App from './App.jsx'  // Not App-API.jsx
```

### Step 2: Simplify vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ]
}
```

### Step 3: Deploy

```bash
vercel --prod
```

This deploys only the React app with static data (no backend).

---

## 🎯 Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Game is playable
- [ ] API endpoints respond
- [ ] Data loads properly
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Custom domain configured (optional)

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain

1. Go to: Project Settings → Domains
2. Enter your domain: `immaculategrid.yourdomain.com`
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 48 hours)

---

## 📈 Monitoring

### View Logs

```bash
# Real-time logs
vercel logs --follow

# Last 100 lines
vercel logs
```

### Analytics

Enable Vercel Analytics:
1. Go to Project Settings → Analytics
2. Toggle "Enable Analytics"
3. View traffic, performance, and errors

---

## 💰 Pricing

### Free Tier (Hobby)
- ✅ Unlimited personal projects
- ✅ HTTPS/SSL included
- ✅ Automatic deployments
- ⚠️ 100GB bandwidth/month
- ⚠️ 10s function timeout

### Pro Tier ($20/month)
- ✅ Commercial use
- ✅ 1TB bandwidth/month
- ✅ 60s function timeout
- ✅ Priority support

For your game, the Free tier should be sufficient initially.

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentation**: https://vercel.com/docs
- **CLI Docs**: https://vercel.com/docs/cli
- **GitHub Integration**: https://vercel.com/docs/git

---

## 🎉 Success!

Once deployed, your game will be live at:
- **Production**: `https://your-project.vercel.app`
- **Custom Domain**: `https://yourdomain.com` (if configured)

Share your link and let people play! 🏀

---

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Review the error messages
3. Check this guide's troubleshooting section
4. Contact Vercel support (Pro tier)

---

**Your NBA Top Shot Immaculate Grid is ready to go live! 🚀**
