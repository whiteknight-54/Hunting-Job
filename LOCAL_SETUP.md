# 🚀 Local Development Setup Guide

Quick guide to run the Resume Generator project locally on your machine.

## ✅ Prerequisites Check

Before starting, ensure you have:

- ✅ **Node.js 20.x or higher** (You have: v24.11.1 ✓)
- ✅ **npm** package manager (included with Node.js)
- ✅ **API Keys** (Anthropic and/or OpenAI)

## 📦 Step 1: Install Dependencies

If you haven't installed dependencies yet:

```bash
npm install
```

**Note:** You may see a warning about Node version (24.11.1 vs 20.x), but it will work fine.

## 🔑 Step 2: Configure Environment Variables

Create or update `.env.local` file in the project root:

```env
# Required: At least one AI provider API key
# You only need ANTHROPIC_API_KEY for default usage (Claude)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: Only needed if you want to use OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Override default models
ANTHROPIC_MODEL=claude-haiku-4-5-20251001
OPENAI_MODEL=gpt-5.2-chat-latest
```

**Important:**
- Replace `your_anthropic_api_key_here` with your actual API key
- At minimum, you need `ANTHROPIC_API_KEY` to run the app
- The `.env.local` file is already in `.gitignore` (won't be committed)

## 🏃 Step 3: Start Development Server

Run the development server:

```bash
npm run dev
```

You should see output like:
```
> resume-generator@1.0.0 dev
> next dev

   ▲ Next.js 14.1.0
   - Local:        http://localhost:3000
   - Ready in 2.5s
```

## 🌐 Step 4: Access the Application

Open your browser and navigate to:

**http://localhost:3000**

## 🧪 Step 5: Test the Application

1. **Enter a Profile ID:**
   - Try: `bv`, `cc`, `jm`, `kg`, `lm`, or `pv`
   - These are the available profile slugs

2. **On the Profile Page:**
   - You'll see profile information
   - Enter a job description in the textarea
   - Optionally add a company name
   - Click "Generate Resume PDF"

3. **Wait for Generation:**
   - The AI will process your request (30-60 seconds)
   - PDF will download automatically when ready

## 📝 Available Profile IDs

Based on `lib/profile-template-mapping.js`:

| Profile ID | Name | Template |
|------------|------|----------|
| `bv` | Boris_Varbanov | Resume-Tech-Teal |
| `cc` | Christian_Carrasco | Resume-Modern-Green |
| `jm` | Jose_Martin | Resume-Corporate-Slate |
| `kg` | Kyle_Garcia | Resume-Creative-Burgundy |
| `lm` | Lucas_Moura | Resume-Executive-Navy |
| `pv` | Pavlo_Vorchylo | Resume-Classic-Charcoal |

## 🛠️ Available Scripts

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm run start
```

## 🐛 Troubleshooting

### Port 3000 Already in Use

If you see "Port 3000 is already in use":

```bash
# Option 1: Use a different port
npm run dev -- -p 3001

# Option 2: Kill the process using port 3000
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### API Key Not Working

1. **Check `.env.local` file exists** in project root
2. **Verify API key is correct** (no extra spaces)
3. **Restart dev server** after changing `.env.local`
4. **Check API key has credits** in Anthropic/OpenAI dashboard

### Module Not Found Errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Windows PowerShell:**
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Windows PowerShell:**
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

## 📊 Development Tips

### Hot Reload
- Next.js automatically reloads when you save files
- Changes to `pages/` and `lib/` will hot reload
- Changes to `.env.local` require server restart

### Viewing Logs
- Server logs appear in the terminal
- API route logs show AI processing
- Check browser console for client-side errors

### Testing Different Profiles
- Each profile has a different template
- Test with different job descriptions
- Compare generated PDFs

## 🔒 Security Notes

- ✅ `.env.local` is in `.gitignore` (won't be committed)
- ✅ Never commit API keys to Git
- ✅ Use different keys for dev/prod if possible

## 📚 Next Steps

- Read the [README.md](./README.md) for full documentation
- Check [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for deployment guide
- Explore the codebase structure in `lib/` and `pages/`

## 🆘 Need Help?

Common issues:
- **"API key not configured"** → Check `.env.local` file
- **"Profile not found"** → Use valid profile ID (bv, cc, jm, kg, lm, pv)
- **"PDF generation failed"** → Check API key and credits
- **"Port in use"** → Use different port or kill existing process

---

**Happy coding! 🎉**
