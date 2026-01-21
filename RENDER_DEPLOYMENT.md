# 🚀 Render.com Deployment Guide

Complete step-by-step guide to deploy your Resume Generator application to Render.com.

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ A GitHub account with your code pushed to a repository
2. ✅ A Render.com account (free tier available)
3. ✅ API keys ready (Anthropic and/or OpenAI)

---

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Remove deprecated generate_2.js for Render deployment"
   git push origin main
   ```

2. **Verify these files exist:**
   - ✅ `package.json` (with build scripts)
   - ✅ `render.yaml` (Render configuration - already exists)
   - ✅ `.gitignore` (to exclude sensitive files)
   - ✅ No `generate_2.js` in `pages/api/` (removed to fix build)

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended for easy integration)
4. Authorize Render to access your GitHub repositories

### Step 3: Create New Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub account if not already connected
3. Find and select your `Hunting-Job` repository
4. Click **"Connect"**

### Step 4: Configure Service Settings

Render will auto-detect settings from `render.yaml`, but verify:

**Name:** `resume-tailor` (or your preferred name)

**Region:** `Oregon` (or closest to your users)

**Branch:** `main` (or your default branch)

**Root Directory:** Leave empty (default: root)

**Runtime:** `Node` (auto-detected)

**Build Command:** `npm install && npm run build`

**Start Command:** `npm start`

**Node Version:** `20.x` (auto-detected from package.json)

### Step 5: Add Environment Variables

**⚠️ CRITICAL:** Add these environment variables in Render dashboard:

1. Click **"Environment"** tab
2. Click **"Add Environment Variable"** for each:

   ```
   Key: ANTHROPIC_API_KEY
   Value: [Your Anthropic API Key]
   ```

   ```
   Key: OPENAI_API_KEY
   Value: [Your OpenAI API Key] (Optional - only if using OpenAI)
   ```

   ```
   Key: ANTHROPIC_MODEL
   Value: claude-haiku-4-5-20251001 (Optional - uses default if not set)
   ```

   ```
   Key: OPENAI_MODEL
   Value: gpt-5.2-chat-latest (Optional - uses default if not set)
   ```

   ```
   Key: NODE_ENV
   Value: production
   ```

### Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build the application
   - Start the service
3. Wait for deployment to complete (usually 5-10 minutes)
4. Once deployed, you'll get a URL like: `https://resume-tailor.onrender.com`

### Step 7: Verify Deployment

1. Visit your deployment URL
2. Test the application:
   - Enter a profile ID (e.g., "bv", "cc", "jm")
   - Enter a job description
   - Enter a role name (required)
   - Generate a resume PDF
3. Check Render logs if there are any errors

---

## 🔧 Configuration Details

### render.yaml Explained

Your `render.yaml` file contains:

```yaml
services:
  - type: web
    name: resume-tailor
    env: node
    region: oregon
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: 20.11.0
      - key: ANTHROPIC_API_KEY
        sync: false  # Requires manual input
      - key: ANTHROPIC_MODEL
        value: claude-3-5-sonnet-20241022
      - key: NODE_ENV
        value: production
```

**Key Settings:**
- `type: web` - Web service (not static site)
- `env: node` - Node.js runtime
- `region` - Deployment region
- `buildCommand` - Command to build the app
- `startCommand` - Command to start the app
- `envVars` - Environment variables (some require manual input)

**Note:** Variables with `sync: false` must be manually entered in Render dashboard.

### Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Yes* | Anthropic API key for Claude | `sk-ant-...` |
| `OPENAI_API_KEY` | No | OpenAI API key (if using OpenAI) | `sk-...` |
| `ANTHROPIC_MODEL` | No | Claude model override | `claude-haiku-4-5-20251001` |
| `OPENAI_MODEL` | No | OpenAI model override | `gpt-5.2-chat-latest` |
| `NODE_ENV` | No | Environment mode | `production` |
| `NODE_VERSION` | No | Node.js version | `20.11.0` |

*At least one AI provider key is required

---

## 🚨 Troubleshooting

### Build Fails - Module Not Found

**Error: "Module not found: Can't resolve '@sparticuz/chromium'"**
- ✅ **FIXED:** Removed deprecated `generate_2.js` file
- If you see similar errors, check for unused files in `pages/api/`

**Error: "Module not found: [package]"**
- Solution: Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

### Build Timeout

**Error: "Build timeout"**
- Solution: Render free tier has 45-minute build timeout
- Upgrade to paid plan for longer builds
- Optimize build process if possible

### Runtime Errors

**Error: "API key not configured"**
- Solution: Verify environment variables are set in Render dashboard
- Ensure `ANTHROPIC_API_KEY` is set (not just in render.yaml)
- Redeploy after adding variables

**Error: "PDF generation failed"**
- Solution: Check Render service logs
- Verify API keys are valid
- Check if AI provider is accessible
- Verify API credits/balance

### Service Won't Start

**Error: "Service failed to start"**
- Solution: Check `startCommand` in render.yaml
- Verify `npm start` works locally
- Check Node.js version matches (20.x)

### Slow Cold Starts

**Issue: "First request takes 30+ seconds"**
- Solution: This is normal for Render free tier
- Free tier services "spin down" after 15 minutes of inactivity
- Upgrade to paid plan for always-on services

---

## 📊 Post-Deployment Checklist

After successful deployment:

- [ ] ✅ Application loads at Render URL
- [ ] ✅ Profile selection works
- [ ] ✅ Job description input works
- [ ] ✅ Role name input works (required)
- [ ] ✅ PDF generation completes successfully
- [ ] ✅ Environment variables are set correctly
- [ ] ✅ Custom domain configured (optional)
- [ ] ✅ Service is running (not sleeping)

---

## 🌐 Custom Domain Setup (Optional)

1. Go to your service in Render dashboard
2. Click **"Settings"** → **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter your domain name
5. Follow DNS configuration instructions
6. Wait for SSL certificate (automatic, ~5 minutes)

---

## 🔄 Continuous Deployment

Render automatically deploys when you push to:

- **`main` branch** → Production deployment
- **Other branches** → Can be configured for preview deployments

### Manual Deployment

To trigger a manual deployment:

1. Render Dashboard → Your Service → **"Manual Deploy"**
2. Select branch and commit
3. Click **"Deploy Latest Commit"**

Or use Render CLI:
```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# Deploy
render deploy
```

---

## 📈 Monitoring & Logs

### View Logs

1. Render Dashboard → Your Service
2. Click **"Logs"** tab
3. View real-time logs:
   - Build logs (during deployment)
   - Runtime logs (after deployment)
   - API route logs

### Function Logs

API routes log to Render service logs:
- Check for AI API errors
- Monitor response times
- Debug PDF generation issues

---

## 💰 Render Pricing

**Free Tier:**
- ✅ 750 hours/month (enough for most projects)
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL certificates
- ⚠️ Services spin down after 15 min inactivity (cold starts)
- ⚠️ 45-minute build timeout

**Starter Plan ($7/month):**
- ✅ Everything in Free
- ✅ Always-on services (no cold starts)
- ✅ Unlimited bandwidth
- ✅ Better performance

**Professional Plan ($25/month):**
- ✅ Everything in Starter
- ✅ Priority support
- ✅ Advanced monitoring
- ✅ Custom build environments

---

## 🔐 Security Best Practices

1. **Never commit API keys:**
   - ✅ Use `.gitignore` to exclude `.env.local`
   - ✅ Only set keys in Render dashboard

2. **Use environment variables:**
   - ✅ Never hardcode secrets
   - ✅ Use different keys for dev/prod

3. **Enable Render Security:**
   - ✅ Automatic HTTPS (SSL)
   - ✅ DDoS protection (included)

---

## 📝 Quick Reference Commands

```bash
# Check if build works locally
npm run build

# Test production build locally
npm run build
npm start

# View Render service logs (via dashboard)
# Render Dashboard → Service → Logs tab
```

---

## 🆘 Need Help?

- **Render Documentation:** [render.com/docs](https://render.com/docs)
- **Render Support:** [render.com/support](https://render.com/support)
- **Next.js on Render:** [render.com/docs/deploy-nextjs](https://render.com/docs/deploy-nextjs)

---

## ✅ Deployment Checklist

Before deploying, ensure:

- [ ] Code is pushed to Git repository
- [ ] `package.json` has correct scripts
- [ ] `render.yaml` is configured
- [ ] `.gitignore` excludes sensitive files
- [ ] `generate_2.js` is removed (deprecated file)
- [ ] Environment variables are ready
- [ ] API keys are valid and active
- [ ] Local build works (`npm run build`)

---

## 🔧 What Was Fixed

The original build error was caused by:
- ❌ `generate_2.js` importing packages not in dependencies:
  - `@sparticuz/chromium`
  - `puppeteer-core`
  - `handlebars`

**Solution:**
- ✅ Removed deprecated `generate_2.js` file
- ✅ Updated README to remove reference
- ✅ Main generation endpoint (`generate.js`) uses React PDF (no issues)

---

**🎉 Congratulations!** Your Resume Generator is now live on Render.com!

Your deployment URL will be: `https://your-service-name.onrender.com`
