# 🚀 Quick Deploy to Vercel (5 Minutes)

The fastest way to get your game online.

## Method 1: GitHub Auto-Deploy (Easiest) ⭐

### Step 1: Go to Vercel
Visit: https://vercel.com/new

### Step 2: Import Your Repository
1. Click "Import Git Repository"
2. Select: `thecustodisam/Grid-Game`
3. Click "Import"

### Step 3: Configure (Auto-detected)
These settings should be automatic:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 4: Deploy
Click "Deploy" and wait 2-3 minutes.

**That's it!** Your game will be live at:
```
https://grid-game-[random].vercel.app
```

---

## Method 2: CLI Deploy (Advanced)

### One-Time Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login
```

### Deploy
```bash
# From your project directory
vercel --prod
```

Follow the prompts and your site will be live in minutes!

---

## 🎮 What You Get

After deployment, you'll have:

✅ **Live Game**: Accessible worldwide
✅ **Fast CDN**: Served from edge locations globally
✅ **HTTPS**: Secure SSL certificate included
✅ **API Backend**: Serverless functions for game logic
✅ **Auto Updates**: Every git push auto-deploys

---

## 🔗 Your URLs

After deployment:

**Frontend (Game)**:
```
https://your-app.vercel.app
```

**API Endpoints**:
```
https://your-app.vercel.app/api/health
https://your-app.vercel.app/api/grid/daily
https://your-app.vercel.app/api/players
https://your-app.vercel.app/api/validate
```

---

## ⚡ Test Your Deployment

### Test the Game
1. Visit: `https://your-app.vercel.app`
2. Click a cell
3. Search for a player
4. Submit an answer
5. Check if validation works

### Test the API
```bash
# Replace YOUR_APP with your actual Vercel URL
curl https://YOUR_APP.vercel.app/api/health
curl https://YOUR_APP.vercel.app/api/grid/daily
```

---

## 🐛 Common Issues

### Issue: Build Fails
**Error**: "Command 'npm run build' exited with 1"

**Fix**:
```bash
# Test build locally first
npm run build

# If it works locally but fails on Vercel:
# - Check Vercel logs for specific error
# - Ensure all dependencies are in package.json
```

### Issue: API Returns 500
**Error**: API endpoints return internal server error

**Fix**: Check function logs in Vercel dashboard
- Go to: Deployments → [Your deployment] → Functions
- Look for error messages in logs
- Usually: missing data files or import errors

### Issue: Page Shows 404
**Error**: Homepage shows "404 Not Found"

**Fix**: Check build output directory
- Ensure `dist` folder is created during build
- Verify vercel.json has correct distDir: "dist"

---

## 💡 Pro Tips

### Custom Domain
After deployment, add a custom domain:
1. Go to: Project Settings → Domains
2. Add: `immaculategrid.yourdomain.com`
3. Follow DNS instructions

### Environment Variables
Add custom API URL (if needed):
1. Go to: Project Settings → Environment Variables
2. Add: `VITE_API_URL` = `https://your-custom-api.com`

### Performance
Your app automatically gets:
- Global CDN distribution
- Automatic image optimization
- Gzip compression
- HTTP/2 and HTTP/3

---

## 📊 Monitor Your App

### View Analytics
1. Go to Vercel Dashboard
2. Select your project
3. Click "Analytics" tab
4. See: traffic, performance, errors

### Check Logs
```bash
# Real-time logs
vercel logs --follow

# Or in dashboard:
# Deployments → [Latest] → Functions → Logs
```

---

## 🎯 Next Steps

After deployment:

1. **Share Your Game**
   - Post on social media
   - Share with friends
   - Get feedback

2. **Monitor Performance**
   - Check Vercel analytics
   - Watch for errors
   - Track usage

3. **Iterate**
   - Push updates to GitHub
   - Vercel auto-deploys
   - Test new features

---

## 📞 Need Help?

- **Full Guide**: See `VERCEL-DEPLOYMENT.md`
- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: support@vercel.com

---

**Your game is 5 minutes away from being live! 🚀**

Go to: https://vercel.com/new and click Import!
