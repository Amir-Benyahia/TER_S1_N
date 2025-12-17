# 🚀 Render Deployment Guide - Pacman Lab (Free Tier)

## Prerequisites
- GitHub account (to push your code)
- Render account (free) - https://render.com
- MongoDB Atlas account (free) - https://www.mongodb.com/cloud/atlas

---

## 📋 Step-by-Step Deployment Process

### **STEP 1: Prepare MongoDB Atlas (Free Tier)**

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free (M0 Sandbox - 512 MB)

2. **Create Database Cluster**
   - Click "Build a Database"
   - Choose **FREE (M0 Sandbox)**
   - Select region closest to your Render region (e.g., Frankfurt)
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Configure Database Access**
   - Go to **Database Access** (left sidebar)
   - Click "Add New Database User"
   - Username: `pacman-admin`
   - Password: Generate a strong password (save it!)
   - Database User Privileges: **Read and write to any database**
   - Click "Add User"

4. **Configure Network Access**
   - Go to **Network Access** (left sidebar)
   - Click "Add IP Address"
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is needed for Render's dynamic IPs
   - Click "Confirm"

5. **Get Connection String**
   - Go to **Database** (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<username>` with `pacman-admin`
   - Replace `<password>` with your actual password
   - Add database name at the end: `/pacman-lab?retryWrites=true&w=majority`
   - **Final format:**
   ```
   mongodb+srv://pacman-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pacman-lab?retryWrites=true&w=majority
   ```
   - **SAVE THIS STRING - You'll need it for Render!**

---

### **STEP 2: Prepare Your Code for Deployment**

1. **Ensure .gitignore is Correct**
   - `.env` should be in `.gitignore`
   - `node_modules/` should be in `.gitignore`
   - `__pycache__/` should be in `.gitignore`

2. **Verify package.json Scripts**
   - ✅ Already configured:
   ```json
   "scripts": {
     "start": "node src/server/index.js"
   }
   ```

3. **Commit All Changes**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

---

### **STEP 3: Create Render Account & Link GitHub**

1. **Sign Up for Render**
   - Go to https://render.com
   - Click "Get Started for Free"
   - Sign up with **GitHub** (recommended)
   - Authorize Render to access your GitHub repositories

2. **Connect GitHub Repository**
   - Render will ask for repository access
   - Grant access to **TER_S1_N** repository

---

### **STEP 4: Create Web Service on Render**

1. **Create New Web Service**
   - From Render Dashboard, click "New +" → "Web Service"
   - Select your **TER_S1_N** repository

2. **Configure Service Settings**
   - **Name:** `pacman-lab` (or any name you prefer)
   - **Region:** Choose closest to you (e.g., Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** Leave empty (root of repo)
   - **Environment:** `Node`
   - **Build Command:**
   ```bash
   npm install && pip install -r requirements.txt
   ```
   - **Start Command:**
   ```bash
   npm start
   ```
   - **Plan:** **Free** (select this!)

3. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable"
   
   Add these variables:
   
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | `mongodb+srv://pacman-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pacman-lab?retryWrites=true&w=majority` |
   | `PYTHON_PATH` | `python3` |
   | `PORT` | `3000` |
   | `CORS_ORIGIN` | `*` |

   **IMPORTANT:** Replace `MONGODB_URI` value with your actual MongoDB Atlas connection string from Step 1!

4. **Create Web Service**
   - Click "Create Web Service"
   - Render will start building and deploying (takes 5-10 minutes)
   - Watch the logs in real-time

---

### **STEP 5: Monitor Deployment**

1. **Check Build Logs**
   - You'll see:
   ```
   ==> Installing dependencies
   ==> Running 'npm install && pip install -r requirements.txt'
   ==> Build successful!
   ==> Starting service with 'npm start'
   ==> Your service is live 🎉
   ```

2. **Wait for "Live" Status**
   - Service status will change to **Live** (green)
   - You'll get a URL like: `https://pacman-lab.onrender.com`

3. **Test Your Application**
   - Click the URL or visit: `https://pacman-lab.onrender.com`
   - Test the API: `https://pacman-lab.onrender.com/api/health`
   - Should return:
   ```json
   {
     "status": "ok",
     "environment": "production",
     "timestamp": "2025-12-16T..."
   }
   ```

---

### **STEP 6: Verify Database Connection**

1. **Check MongoDB Connection**
   - In Render logs, look for:
   ```
   MongoDB connected successfully
   Database: pacman-lab
   ```

2. **If Connection Fails:**
   - Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
   - Verify connection string in Render environment variables
   - Check username/password are correct
   - Ensure database user has proper permissions

---

### **STEP 7: Test Full Application**

1. **Test Frontend**
   - Visit your Render URL
   - Should see the Pacman Lab interface

2. **Test Maze Generation**
   - Generate a new maze
   - Should save to MongoDB Atlas

3. **Test Simulations**
   - Record a trajectory
   - Run a simulation
   - Save results
   - Check if data persists (refresh page)

4. **Test Batch Operations**
   - Create a batch
   - Add simulations
   - View statistics

---

## 🔧 Troubleshooting Common Issues

### **Issue 1: Application Keeps Crashing**
- **Check Render Logs:** Look for error messages
- **Common Cause:** MongoDB connection failed
- **Solution:** Verify `MONGODB_URI` environment variable

### **Issue 2: "Application Failed to Respond"**
- **Check:** PORT environment variable should be set
- **Check:** Health check endpoint `/api/health` is accessible
- **Solution:** Render expects port 3000 by default

### **Issue 3: MongoDB Connection Timeout**
- **Check:** MongoDB Atlas network access (should be 0.0.0.0/0)
- **Check:** Connection string format is correct
- **Check:** Database user has correct permissions

### **Issue 4: Python Dependencies Not Installing**
- **Check:** `requirements.txt` is in root directory
- **Check:** Build command includes `pip install -r requirements.txt`
- **Solution:** Render free tier has Python 3.7+ available

### **Issue 5: Build Takes Too Long / Times Out**
- **Free Tier Limitation:** Builds can take 10-15 minutes
- **Solution:** Wait patiently, Render free tier is slower
- **Check:** No unnecessary dependencies in package.json

---

## 📊 Render Free Tier Limitations

- ✅ **750 hours/month** free (enough for one app)
- ⚠️ **Spins down after 15 min inactivity** (cold start ~30s)
- ⚠️ **Limited to 512 MB RAM**
- ⚠️ **Shared CPU** (slower than paid)
- ✅ **Automatic HTTPS** (free SSL)
- ✅ **Custom domain** supported (free)

**Important:** First request after inactivity will be slow (~30-60 seconds) as service spins up.

---

## 🎯 Post-Deployment Checklist

- [ ] Application accessible at Render URL
- [ ] Health check endpoint responds: `/api/health`
- [ ] MongoDB connection successful (check logs)
- [ ] Maze generation works
- [ ] Trajectory recording works
- [ ] Simulations run and save
- [ ] Batch operations work
- [ ] Performance metrics display correctly
- [ ] No console errors in browser

---

## 🔄 Updating Your Deployment

**Automatic Updates:**
- Push to GitHub `main` branch → Render auto-deploys
- Takes 5-10 minutes per deployment

**Manual Deploy:**
- Go to Render Dashboard
- Click your service
- Click "Manual Deploy" → "Deploy latest commit"

---

## 📱 Custom Domain (Optional)

1. Go to your service in Render Dashboard
2. Click "Settings" → "Custom Domain"
3. Add your domain (e.g., `pacman-lab.yourdomain.com`)
4. Follow DNS configuration instructions
5. Render provides free SSL automatically

---

## 💡 Tips for Best Performance

1. **Minimize Cold Starts:**
   - Keep app "warm" by pinging health endpoint every 10 minutes
   - Use a free uptime monitoring service (e.g., UptimeRobot)

2. **Optimize Startup:**
   - Minimize dependencies in package.json
   - Use `.renderignore` to exclude unnecessary files

3. **Database Optimization:**
   - Create indexes on frequently queried fields
   - Use MongoDB Atlas M0 (free tier) with proper indexes

4. **Monitor Usage:**
   - Check Render Dashboard for usage metrics
   - Monitor MongoDB Atlas metrics

---

## 🆘 Getting Help

- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com
- **MongoDB Docs:** https://www.mongodb.com/docs/atlas/
- **Check Logs:** Always check Render logs for errors

---

## ✅ Success!

Your Pacman Lab is now deployed on Render Free Tier! 🎉

**Your App URL:** `https://pacman-lab.onrender.com` (or your custom URL)

**Share it with:**
- Add link to your README.md
- Share with team members
- Use in presentations
- Include in your portfolio

---

## 📝 Quick Command Reference

```bash
# Push updates to trigger auto-deploy
git add .
git commit -m "Update: description"
git push origin main

# View Render logs
# (Go to Render Dashboard → Your Service → Logs)

# Check MongoDB Atlas connection
# (Go to MongoDB Atlas → Database → Collections)

# Test health endpoint
curl https://pacman-lab.onrender.com/api/health

# Test API endpoints
curl https://pacman-lab.onrender.com/api/mazes
curl https://pacman-lab.onrender.com/api/simulations
```

---

**Deployment Complete! Happy coding! 🚀**
