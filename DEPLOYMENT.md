# LifeDesk AI — Production Deployment Guide

This guide outlines the end-to-end steps to deploy LifeDesk AI from your **GitHub repository to a live production website** with automatic continuous deployment on push to `main`.

---

## 📋 Architecture & Deployment Options

LifeDesk AI can be deployed under two architectures:

| Architecture | Description | Recommended Platforms |
| :--- | :--- | :--- |
| **Unified Full-Stack (Server + SPA)** | Node.js Express server (`server.ts`) hosting static Vite assets and serving private AI endpoints. | **Render**, **Railway**, **Google Cloud Run**, **DigitalOcean App Platform**, **Fly.io** |
| **Static Single-Page App (SPA) + Cloud Supabase** | High-speed static web app talking directly to Supabase Auth & PostgreSQL with Row Level Security. AI proxy deployed as serverless function or container. | **Vercel**, **Netlify**, **GitHub Pages** |

---

## 🚀 Option 1: GitHub Actions → Automatic Live Website Deployment

A pre-configured GitHub Actions workflow is located at `.github/workflows/deploy.yml`.

### Step-by-Step Setup:

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of LifeDesk AI"
   git remote add origin https://github.com/<your-username>/lifedesk-ai.git
   git branch -M main
   git push -u origin main
   ```

2. **Configure GitHub Repository Secrets**:
   Go to your GitHub repository > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`).
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anonymous Public Key.
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `RENDER_DEPLOY_HOOK_URL`: (Optional) Deploy hook webhook URL from Render.

3. **Enable GitHub Pages for the Live Website**:
   - Go to your repository > **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
   - Push any commit to `main`, and the GitHub Actions workflow will automatically build and publish your live website to `https://<your-username>.github.io/lifedesk-ai/`!

---

## ⚡ Option 2: Deploy to Vercel (Recommended for Frontend)

Vercel provides instant worldwide CDN distribution, zero-config Vite deployments, and automatic preview links on every pull request.

1. Sign up or log into [Vercel](https://vercel.com).
2. Click **Add New** > **Project** and import your GitHub repository (`lifedesk-ai`).
3. The included `vercel.json` will automatically configure the Vite framework and SPA rewrite rules.
4. Add the following **Environment Variables**:
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-anon-key`
   - `GEMINI_API_KEY`: `your-gemini-api-key`
5. Click **Deploy**.
6. **Automatic Continuous Deployment**: Every push to `main` will automatically trigger a production build and update your live URL.

---

## 🌐 Option 3: Deploy to Render (Unified Container Deployment)

Render allows you to run the complete Node.js Express server + React frontend as a unified production service.

1. Log into [Render](https://render.com).
2. Click **New +** > **Blueprint** and connect your GitHub repository.
3. Render will detect `render.yaml` and configure the service automatically:
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
4. In the Environment Variables section, enter:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: `your-gemini-api-key`
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-anon-key`
5. Click **Apply**.
6. Render will generate a live URL: `https://lifedesk-ai.onrender.com`.

---

## 🐳 Option 4: Deploy using Docker & Google Cloud Run

LifeDesk AI includes a multi-stage, rootless, production-hardened `Dockerfile`.

### Local Docker Build & Test:
```bash
# Build the Docker image
docker build -t lifedesk-ai .

# Run the container locally
docker run -p 3000:3000 \
  -e GEMINI_API_KEY="your-gemini-key" \
  -e VITE_SUPABASE_URL="https://your-project.supabase.co" \
  -e VITE_SUPABASE_ANON_KEY="your-anon-key" \
  lifedesk-ai
```

### Deploy to Google Cloud Run:
```bash
# Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID

# Build and submit container image
gcloud builds submit --tag gcr.io/YOUR_GCP_PROJECT_ID/lifedesk-ai

# Deploy to Cloud Run
gcloud run deploy lifedesk-ai \
  --image gcr.io/YOUR_GCP_PROJECT_ID/lifedesk-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your-key",VITE_SUPABASE_URL="your-url",VITE_SUPABASE_ANON_KEY="your-key"
```

---

## 🔐 Production Environment Variables Matrix

| Variable Name | Environment | Required | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Production / All | Yes | Set to `production` for optimized asset serving and caching. |
| `GEMINI_API_KEY` | Server-Only | Yes | Google Gemini API key for AI assistant and intelligence features. |
| `VITE_SUPABASE_URL` | Frontend & Server | Optional | Supabase PostgreSQL project URL. |
| `VITE_SUPABASE_ANON_KEY` | Frontend & Server | Optional | Supabase public anonymous client API key. |
| `PORT` | Container Runtime | No (defaults to 3000) | Port for the Express server to listen on. |

> ⚠️ **Security Guarantee**: Never commit your `.env` file to source control. LifeDesk AI’s `.gitignore` excludes `.env`, `.env.local`, and all private credentials.

---

## ✅ Post-Deployment Verification Checklist

Once deployed to your live website:
1. Open your live website URL in an incognito browser window.
2. Verify the Login page displays cleanly with responsive mobile styling.
3. Test authentication:
   - Click **"Continue as Demo User"** or register a new Supabase user.
4. Verify task creation, note addition, expense logging, and document viewer.
5. In the **AI Assistant**, ask:
   - *"Who developed LifeDesk AI?"* (Confirm verified creator profile card displays for Vasu Desalla).
   - *"What tasks do I have today?"* (Confirm database-aware response).
6. Verify browser DevTools console has zero errors or leaked secrets.
