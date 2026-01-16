# Deployment Guide - Film For You

## 🚀 Optimized Deployment (Serverless)

We have optimized "Film For You" to run almost entirely on Vercel's free tier by migrating core features (Search, AI, Trending) to **Serverless Functions**.

### Prerequisites
- GitHub Account
- Vercel Account (Free Tier)
- API Keys:
    - `TMDB_API_KEY`: Get from [TheMovieDB](https://www.themoviedb.org/documentation/api)
    - `GEMINI_API_KEY`: Get from [Google AI Studio](https://aistudio.google.com/)

---

## 📦 Deployment Steps

### 1. Deploy Frontend (Web App) to Vercel

This is the only deployment you need for the core discovery and AI features.

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository: `dhanushsakthi/Film_For_You`
4. **Build Settings**: Vercel will auto-detect Next.js.
   - Framework Preset: `Next.js`
   - Root Directory: `./` (leave default)
5. **Environment Variables** (CRITICAL):
   - `TMDB_API_KEY` = `your_tmdb_key_here`
   - `GEMINI_API_KEY` = `your_gemini_key_here`
    - `RAPIDAPI_KEY` = `your_rapidapi_key` (Required for Top Rated movies/TV)
    - `RAPIDAPI_HOST` = `imdb-top-100-movies.p.rapidapi.com`
    - `NEXT_PUBLIC_API_URL` = (Optional, only needed if you deploy a full backend for user profiles)
6. Click **Deploy**

### 🔑 How to Set Environment Variables (Detailed)
If you missed setting them during import, you can add them anytime:
1. Go to your **Vercel Project Dashboard**.
2. Click on the **Settings** tab at the top.
3. Click on **Environment Variables** in the left sidebar.
4. Add the following keys:
   - **Key**: `TMDB_API_KEY` | **Value**: `...` (paste your key) -> Click **Add**
   - **Key**: `GEMINI_API_KEY` | **Value**: `...` (paste your key) -> Click **Add**
    - **Key**: `RAPIDAPI_KEY` | **Value**: `...` (paste your key) -> Click **Add**
    - **Key**: `RAPIDAPI_HOST` | **Value**: `imdb-top-100-movies.p.rapidapi.com` -> Click **Add**
5. **CRITICAL**: Go to the **Deployments** tab and click **Redeploy** (dots menu on the latest deployment) for changes to take effect.


### 2. Verify Functionality
1. Open your Vercel URL (e.g., `https://film-for-you.vercel.app`)
2. **Cinematic Hero**: Should load a random top-rated movie background.
3. **Voice Search**: Click the mic icon and say "Inception". It should show results instantly.
4. **AI Chat**: Type "Suggest me a movie" - it should respond using the serverless AI route.
5. **Providers**: Click the service icons (Netflix/Prime) to filter.

---

## ❓ What about the Backend?

The `apps/backend` folder contains a full Express/MongoDB backend for robust User Profiles (Login, Register, Watchlist History).

**For a demo/portfolio:**
You DO NOT need to deploy the backend. The frontend will work in "Guest Mode" for discovery features.

**If you want full User Persistence:**
1. Deploy `apps/backend` to Railway/Render.
2. Get the Backend URL (e.g., `https://my-backend.railway.app`).
3. Add `NEXT_PUBLIC_API_URL` to your Vercel Environment Variables.
4. Redeploy Vercel.

---

## 🔧 Troubleshooting

### 404 on API Routes (`/api/ai/chat`)
- Ensure you set `GEMINI_API_KEY` in Vercel.
- Check Vercel Function Logs for errors.

### Images not loading
- We use `next/image` with `image.tmdb.org`. If images fail, check if `next.config.mjs` allows this domain (it is pre-configured).

### "Deployment Not Found"
- Fixed by our `vercel.json` which tells Vercel this is a Next.js project.
