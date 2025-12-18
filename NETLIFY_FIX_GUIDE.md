# Netlify Deployment Fix Guide

## Problem
Your Next.js app on Netlify only shows the home page, and all other pages redirect to localhost.

## Root Cause
Next.js apps require special handling for:
- Client-side routing (React Router)
- Server-side rendering (SSR)
- API routes
- Dynamic routes

Without the `@netlify/plugin-nextjs` plugin, Netlify treats your app as a static site, which breaks routing.

## Solution Applied

### 1. Created `netlify.toml` Configuration
✅ Added the essential `@netlify/plugin-nextjs` plugin
✅ Configured proper redirects for client-side routing
✅ Set up API route handling
✅ Added security headers

### 2. Installed Required Plugin
✅ Installed `@netlify/plugin-nextjs` as a dev dependency

## How to Redeploy to Netlify

### Option 1: Using Git Push (Recommended)

If your Netlify site is connected to your GitHub/GitLab repository:

```bash
# 1. Stage all changes
git add .

# 2. Commit the changes
git commit -m "Fix Netlify deployment with proper Next.js configuration"

# 3. Push to your repository
git push origin main
```

Netlify will automatically detect the changes and redeploy with the new configuration.

### Option 2: Using Netlify CLI

```bash
# 1. Install Netlify CLI if you haven't
npm install -g netlify-cli

# 2. Login to Netlify
netlify login

# 3. Deploy to production
netlify deploy --prod
```

### Option 3: Manual Deploy via Netlify Dashboard

1. Go to your Netlify dashboard
2. Select your site
3. Go to "Site configuration" → "Build & deploy"
4. Click "Trigger deploy" → "Clear cache and deploy site"

## What to Check After Deployment

1. **Home Page**: Should load correctly ✅
2. **Other Pages**: Should load without redirecting to localhost ✅
3. **Navigation**: Should work smoothly between pages ✅
4. **API Routes**: Should respond correctly (if you have any) ✅
5. **Direct URL Access**: Typing a page URL directly should work ✅

## Netlify Build Settings

Make sure your Netlify build settings are:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18 (set in netlify.toml)

To verify/update these:
1. Go to your site in Netlify dashboard
2. Navigate to "Site configuration" → "Build & deploy" → "Build settings"

## Environment Variables

Make sure all required environment variables are set in Netlify:

1. Go to "Site configuration" → "Environment variables"
2. Add all variables from your `.env` file:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (should be your Netlify domain)
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
   - Any other API keys or secrets

**Important**: Update `NEXTAUTH_URL` to your Netlify domain (e.g., `https://your-site-name.netlify.app`)

## Troubleshooting

### Issue: Still redirecting to localhost
**Solution**: 
- Clear Netlify cache: "Deploys" → "Trigger deploy" → "Clear cache and deploy site"
- Check that `netlify.toml` is in the root of your repository
- Verify the plugin is installed by checking `package.json`

### Issue: Build fails
**Solution**:
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Try running `npm run build` locally first

### Issue: API routes not working
**Solution**:
- Verify environment variables are set in Netlify
- Check that the API route redirects in `netlify.toml` are correct
- Review function logs in Netlify dashboard

### Issue: 404 on page refresh
**Solution**:
- This should be fixed by the redirects in `netlify.toml`
- If it persists, check that the `[[redirects]]` section is properly formatted

## Additional Resources

- [Netlify Next.js Runtime Docs](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Netlify CLI Documentation](https://docs.netlify.com/cli/get-started/)

## Files Changed

1. ✅ Created `netlify.toml` - Main configuration file
2. ✅ Updated `package.json` - Added @netlify/plugin-nextjs
3. ✅ Updated `DEPLOYMENT.md` - Corrected deployment documentation

---

**Next Step**: Push your changes to Git or deploy using the Netlify CLI!
