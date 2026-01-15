# Deployment Guide - Film For You

## 🎯 Quick Fix for DEPLOYMENT_NOT_FOUND Error

### Root Cause
The error occurred because Vercel couldn't determine which part of your monorepo to deploy. Your project has:
- Next.js app at the **root** (`src/`, `next.config.mjs`)
- Backend services in `apps/backend` and `apps/mcp-server`
- No explicit Vercel configuration

### Solution
I've created `vercel.json` and `.vercelignore` to guide Vercel to deploy only the frontend.

---

## 📦 Deployment Steps

### 1. Deploy Frontend to Vercel

#### Option A: Via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository: `dhanushsakthi/Film_For_You`
4. Vercel will auto-detect Next.js settings
5. **Set Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = Your backend URL (see step 2)
6. Click **Deploy**

#### Option B: Via Vercel CLI
```bash
npm i -g vercel
cd d:\Film_For_You
vercel
```

### 2. Deploy Backend (Choose One)

#### Option A: Railway
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Select `apps/backend` as root directory
4. Set environment variables:
   - `MONGODB_URI`
   - `TMDB_API_KEY`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `PORT=5000`
5. Deploy and copy the public URL

#### Option B: Render
1. Go to [render.com](https://render.com)
2. New Web Service → Connect GitHub repo
3. Root Directory: `apps/backend`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add environment variables (same as above)

### 3. Update Frontend Environment Variable
1. Go back to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Set `NEXT_PUBLIC_API_URL` to your backend URL (from step 2)
3. Redeploy the frontend

---

## 🔧 Environment Variables Reference

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Backend (Railway/Render)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/film_for_you
TMDB_API_KEY=your_tmdb_api_key
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

---

## ✅ Verification

After deployment:
1. Visit your Vercel URL (e.g., `https://film-for-you.vercel.app`)
2. You should see the app load directly (no login required)
3. Test AI search to verify backend connection
4. Check browser console for any API errors

---

## 🚨 Common Issues

### Issue: Still getting 404
**Fix**: Make sure you're deploying from the `main` branch with the latest commits

### Issue: API calls failing
**Fix**: Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel and includes `https://`

### Issue: Build fails on Vercel
**Fix**: Check build logs. Usually missing dependencies or TypeScript errors

---

## 📚 Understanding the Fix

### What was wrong?
- Vercel couldn't determine the deployment target in a monorepo
- No configuration file to specify build settings
- Backend code was being included in frontend deployment

### What we fixed?
- Created `vercel.json` to explicitly define the Next.js build
- Created `.vercelignore` to exclude backend services
- Separated frontend and backend deployments

### Mental Model
Think of Vercel as a **frontend-only** platform. For full-stack apps:
- Deploy frontend (Next.js) → Vercel
- Deploy backend (Express) → Railway/Render/etc.
- Connect them via environment variables

### Warning Signs for Future
- 404 errors on Vercel usually mean configuration issues
- Always check Vercel build logs for specific errors
- Monorepos need explicit configuration (`vercel.json`)
