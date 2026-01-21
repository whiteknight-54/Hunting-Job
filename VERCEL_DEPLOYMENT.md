# 🚀 Vercel Deployment Guide

Complete step-by-step guide to deploy your Resume Generator application to Vercel.

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ A GitHub account (or GitLab/Bitbucket)
2. ✅ Your code pushed to a Git repository
3. ✅ Vercel account (free tier is sufficient)
4. ✅ API keys ready (Anthropic and/or OpenAI)

---

## 🎯 Method 1: Deploy via Vercel Dashboard (Recommended for First-Time)

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Ready for Vercel deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/Hunting-Job.git
   git push -u origin main
   ```

2. **Verify these files exist:**
   - ✅ `package.json` (with build scripts)
   - ✅ `vercel.json` (configuration file)
   - ✅ `.gitignore` (to exclude sensitive files)

### Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (recommended for easy integration)
4. Authorize Vercel to access your GitHub repositories

### Step 3: Import Your Project

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find and select your `Hunting-Job` repository
3. Click **"Import"**

### Step 4: Configure Project Settings

Vercel will auto-detect Next.js, but verify these settings:

**Framework Preset:** `Next.js` (auto-detected)

**Root Directory:** `./` (leave as default)

**Build Command:** `npm run build` (auto-detected)

**Output Directory:** `.next` (auto-detected)

**Install Command:** `npm install` (auto-detected)

**Node.js Version:** `20.x` (matches your package.json)

### Step 5: Add Environment Variables

**⚠️ CRITICAL:** Add these environment variables in Vercel dashboard:

1. Click **"Environment Variables"** section
2. Add each variable:

   ```
   Name: ANTHROPIC_API_KEY
   Value: [Your Anthropic API Key]
   Environment: Production, Preview, Development (select all)
   ```

   ```
   Name: OPENAI_API_KEY
   Value: [Your OpenAI API Key] (Optional - only if using OpenAI)
   Environment: Production, Preview, Development (select all)
   ```

   ```
   Name: ANTHROPIC_MODEL
   Value: claude-haiku-4-5-20251001 (Optional - uses default if not set)
   Environment: Production, Preview, Development (select all)
   ```

   ```
   Name: OPENAI_MODEL
   Value: gpt-5.2-chat-latest (Optional - uses default if not set)
   Environment: Production, Preview, Development (select all)
   ```

   ```
   Name: NODE_ENV
   Value: production
   Environment: Production, Preview, Development (select all)
   ```

### Step 6: Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (usually 2-5 minutes)
3. Once deployed, you'll get a URL like: `https://hunting-job-xyz.vercel.app`

### Step 7: Verify Deployment

1. Visit your deployment URL
2. Test the application:
   - Enter a profile ID (e.g., "bv", "cc", "jm")
   - Enter a job description
   - Generate a resume PDF
3. Check Vercel logs if there are any errors

---

## 🎯 Method 2: Deploy via Vercel CLI (For Developers)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Deploy

From your project root directory:

```bash
# Deploy to preview (staging)
vercel

# Deploy to production
vercel --prod
```

### Step 4: Set Environment Variables via CLI

```bash
# Set environment variables
vercel env add ANTHROPIC_API_KEY
# Paste your API key when prompted
# Select: Production, Preview, Development

vercel env add OPENAI_API_KEY
# Paste your OpenAI key (if using)
# Select: Production, Preview, Development

vercel env add NODE_ENV production
# Select: Production, Preview, Development
```

### Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

---

## 🔧 Configuration Details

### vercel.json Explained

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 120
    }
  }
}
```

**Key Settings:**
- `regions`: Deployment region (iad1 = US East)
- `functions.maxDuration`: API route timeout (120 seconds for AI processing)
- `framework`: Auto-detected as Next.js

### Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Yes* | Anthropic API key for Claude | `sk-ant-...` |
| `OPENAI_API_KEY` | No | OpenAI API key (if using OpenAI) | `sk-...` |
| `ANTHROPIC_MODEL` | No | Claude model override | `claude-haiku-4-5-20251001` |
| `OPENAI_MODEL` | No | OpenAI model override | `gpt-5.2-chat-latest` |
| `NODE_ENV` | No | Environment mode | `production` |

*At least one AI provider key is required

---

## 🚨 Troubleshooting

### Build Fails

**Error: "Module not found"**
- Solution: Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Build timeout"**
- Solution: Increase timeout in `vercel.json` or upgrade plan

**Error: "API route timeout"**
- Solution: Already configured to 120s in `vercel.json`
- For longer operations, consider Vercel Pro plan

### Runtime Errors

**Error: "API key not configured"**
- Solution: Verify environment variables are set in Vercel dashboard
- Ensure they're enabled for Production environment
- Redeploy after adding variables

**Error: "PDF generation failed"**
- Solution: Check Vercel function logs
- Verify API keys are valid
- Check if AI provider is accessible

### Deployment Issues

**"Deployment not updating"**
- Solution: Clear Vercel cache or force redeploy
- Check if build is actually running

**"Environment variables not working"**
- Solution: Variables must be set before deployment
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

---

## 📊 Post-Deployment Checklist

After successful deployment:

- [ ] ✅ Application loads at Vercel URL
- [ ] ✅ Profile selection works
- [ ] ✅ Job description input works
- [ ] ✅ PDF generation completes successfully
- [ ] ✅ Environment variables are set correctly
- [ ] ✅ Custom domain configured (optional)
- [ ] ✅ Analytics enabled (optional)

---

## 🌐 Custom Domain Setup (Optional)

1. Go to your project in Vercel dashboard
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic, ~5 minutes)

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to:

- **`main` branch** → Production deployment
- **Other branches** → Preview deployments
- **Pull requests** → Preview deployments with comments

### Manual Deployment

To trigger a manual deployment:

```bash
vercel --prod
```

Or use Vercel dashboard → **"Deployments"** → **"Redeploy"**

---

## 📈 Monitoring & Logs

### View Logs

1. Vercel Dashboard → Your Project → **"Deployments"**
2. Click on a deployment
3. Click **"Functions"** tab to see API route logs
4. Click **"Runtime Logs"** for server-side logs

### Function Logs

API routes log to Vercel's function logs:
- Check for AI API errors
- Monitor response times
- Debug PDF generation issues

---

## 💰 Vercel Pricing

**Free Tier (Hobby):**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ 100 serverless function executions/day
- ✅ Perfect for personal projects

**Pro Tier ($20/month):**
- ✅ Everything in Hobby
- ✅ Unlimited bandwidth
- ✅ Team collaboration
- ✅ Advanced analytics

**Enterprise:**
- Custom pricing
- Dedicated support
- SLA guarantees

---

## 🔐 Security Best Practices

1. **Never commit API keys:**
   - ✅ Use `.gitignore` to exclude `.env.local`
   - ✅ Only set keys in Vercel dashboard

2. **Use environment variables:**
   - ✅ Never hardcode secrets
   - ✅ Use different keys for dev/prod

3. **Enable Vercel Security:**
   - ✅ Enable DDoS protection
   - ✅ Use HTTPS (automatic)

---

## 📝 Quick Reference Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove
```

---

## 🆘 Need Help?

- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Next.js on Vercel:** [vercel.com/docs/frameworks/nextjs](https://vercel.com/docs/frameworks/nextjs)

---

## ✅ Deployment Checklist

Before deploying, ensure:

- [ ] Code is pushed to Git repository
- [ ] `package.json` has correct scripts
- [ ] `vercel.json` is configured
- [ ] `.gitignore` excludes sensitive files
- [ ] Environment variables are ready
- [ ] API keys are valid and active
- [ ] Local build works (`npm run build`)

---

**🎉 Congratulations!** Your Resume Generator is now live on Vercel!

Your deployment URL will be: `https://your-project-name.vercel.app`
