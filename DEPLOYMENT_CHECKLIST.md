# Landing Page Integration - Quick Deployment Checklist

Use this checklist to deploy your landing page integration step-by-step.

## Pre-Deployment

### Landing Page Repository Updates

- [ ] Add `vercel.json` configuration file to `RepostAI_landing` repository
  - Copy from [LANDING_PAGE_VERCEL_CONFIG.md](file:///Users/maheshyadav/EasyGen_Claude/easygen-claude/LANDING_PAGE_VERCEL_CONFIG.md)
  
- [ ] Update CTA button to redirect to `https://app.repostai.io`
  ```jsx
  <a href="https://app.repostai.io" className="cta-button">
    Try Generator For Free
  </a>
  ```

- [ ] Commit and push changes to GitHub
  ```bash
  git add .
  git commit -m "Add Vercel config and update CTA for app subdomain"
  git push origin main
  ```

### Main App Repository (Already Done ✅)

- [x] Updated `next.config.mjs` with redirect configuration
- [x] Updated `.env.example` with subdomain examples
- [x] Created integration documentation

## Deployment Steps

### Step 1: Deploy Landing Page to Vercel

- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Click "Add New Project"
- [ ] Import `that-cod/RepostAI_landing` repository
- [ ] Configure build settings:
  - Framework: Vite (auto-detected)
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete

### Step 2: Configure Landing Page Domain

- [ ] In landing page Vercel project, go to **Settings → Domains**
- [ ] Click "Add Domain"
- [ ] Enter: `repostai.io`
- [ ] Click "Add"
- [ ] Note the DNS configuration provided by Vercel

### Step 3: Update Main App Domain

- [ ] Go to main app's Vercel project settings
- [ ] Navigate to **Settings → Domains**
- [ ] **Remove** `repostai.io` (if currently assigned)
- [ ] Click "Add Domain"
- [ ] Enter: `app.repostai.io`
- [ ] Click "Add"
- [ ] Note the DNS configuration

### Step 4: Update Main App Environment Variables

- [ ] In main app Vercel project, go to **Settings → Environment Variables**
- [ ] Update or add these variables for **Production** environment:
  ```
  NEXTAUTH_URL=https://app.repostai.io
  APP_URL=https://app.repostai.io
  ```
- [ ] Click "Save"

### Step 5: Update OAuth Redirect URLs

#### LinkedIn OAuth

- [ ] Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
- [ ] Select your app
- [ ] Navigate to **Auth** tab
- [ ] In **Redirect URLs**, add:
  ```
  https://app.repostai.io/api/auth/callback/linkedin
  ```
- [ ] Remove old URL if it was using root domain
- [ ] Click "Update"

#### Other OAuth Providers (if applicable)

- [ ] Google: Update redirect URI to `https://app.repostai.io/api/auth/callback/google`
- [ ] GitHub: Update redirect URI to `https://app.repostai.io/api/auth/callback/github`

### Step 6: Configure DNS Records

Go to your domain registrar (where repostai.io is managed):

#### Root Domain (for Landing Page)

- [ ] Add/Update A Record:
  ```
  Type: A
  Name: @ (or leave blank for root)
  Value: 76.76.21.21
  TTL: 3600
  ```

- [ ] Add/Update CNAME Record for www:
  ```
  Type: CNAME
  Name: www
  Value: cname.vercel-dns.com
  TTL: 3600
  ```

#### App Subdomain (for Main App)

- [ ] Add CNAME Record:
  ```
  Type: CNAME
  Name: app
  Value: cname.vercel-dns.com
  TTL: 3600
  ```

### Step 7: Redeploy Main Application

- [ ] Go to main app's Vercel project
- [ ] Navigate to **Deployments** tab
- [ ] Click on latest deployment
- [ ] Click "Redeploy" to apply environment variable changes

### Step 8: Wait for DNS Propagation

- [ ] Wait 5-10 minutes (can take up to 48 hours but usually faster)
- [ ] Check DNS propagation:
  ```bash
  dig repostai.io
  dig app.repostai.io
  ```

## Verification

### Landing Page Tests

- [ ] Open `https://repostai.io` in browser
- [ ] Verify page loads correctly
- [ ] Check SSL certificate (green lock icon)
- [ ] Test all navigation and links
- [ ] Click "Try Generator For Free" button
- [ ] Verify redirect to `https://app.repostai.io`

### Main App Tests

- [ ] Open `https://app.repostai.io` directly
- [ ] Verify app loads correctly
- [ ] Check SSL certificate
- [ ] Test login/signup functionality
- [ ] Verify OAuth authentication (LinkedIn)
- [ ] Check that all features work
- [ ] Test creating a post
- [ ] Verify dashboard functionality

### Cross-Browser Testing

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Additional Checks

- [ ] Test forgot password flow
- [ ] Verify email links (if applicable)
- [ ] Check analytics tracking
- [ ] Monitor Vercel logs for errors
- [ ] Test API endpoints
- [ ] Verify cron jobs still running

## Troubleshooting

### If Landing Page Doesn't Load

1. Check DNS: `dig repostai.io`
2. Verify domain in Vercel dashboard
3. Clear browser cache / try incognito
4. Check Vercel deployment logs

### If Main App Doesn't Load

1. Check DNS: `dig app.repostai.io`
2. Verify environment variables updated
3. Confirm OAuth redirect URLs updated
4. Check Vercel deployment logs

### If Authentication Fails

1. Clear cookies and try again
2. Verify `NEXTAUTH_URL=https://app.repostai.io`
3. Check OAuth redirect URLs in provider settings
4. Verify SSL certificates are valid

## Post-Deployment

### Monitoring Setup

- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure error tracking (Sentry)
- [ ] Enable Vercel Analytics for both projects
- [ ] Set up alerts for downtime

### Documentation Updates

- [ ] Update README with new domain structure
- [ ] Document deployment process for team
- [ ] Update any internal documentation

### Marketing

- [ ] Announce new landing page
- [ ] Update social media links
- [ ] Update email signatures
- [ ] Update marketing materials

## Support Resources

- **Integration Guide**: [LANDING_PAGE_INTEGRATION.md](file:///Users/maheshyadav/EasyGen_Claude/easygen-claude/LANDING_PAGE_INTEGRATION.md)
- **Vercel Config**: [LANDING_PAGE_VERCEL_CONFIG.md](file:///Users/maheshyadav/EasyGen_Claude/easygen-claude/LANDING_PAGE_VERCEL_CONFIG.md)
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

**Deployment Date**: _________________  
**Deployed By**: _________________  
**Notes**: _________________
