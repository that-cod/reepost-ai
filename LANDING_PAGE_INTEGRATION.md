# Landing Page Integration Guide

This guide explains how to integrate the RepostAI landing page with the main application using the subdomain architecture.

## Architecture Overview

- **Landing Page**: `https://repostai.io` (Marketing site)
- **Main Application**: `https://app.repostai.io` (Platform/Dashboard)

The landing page serves as the public-facing marketing site, while the main application runs on the `app` subdomain for the actual platform functionality.

## Prerequisites

- Access to repostai.io domain DNS settings
- Vercel account with deployment permissions
- Both repositories accessible: 
  - Landing page: `https://github.com/that-cod/RepostAI_landing`
  - Main app: `https://github.com/that-cod/reepost-ai`

## Step 1: Deploy Landing Page to Vercel

### 1.1 Import Landing Page Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import `that-cod/RepostAI_landing` repository
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 1.2 Configure Root Domain

1. In the Vercel project settings, go to **Domains**
2. Add custom domain: `repostai.io`
3. Vercel will provide DNS configuration instructions
4. Add the domain (Vercel will automatically handle www redirect)

### 1.3 Environment Variables (if needed)

If your landing page uses any environment variables:
- Go to **Settings → Environment Variables**
- Add any required variables

## Step 2: Update Main App for Subdomain

### 2.1 Update Vercel Domain Settings

1. Go to main app's Vercel project settings
2. Navigate to **Domains** section
3. **Remove** `repostai.io` if it's currently assigned
4. **Add** new domain: `app.repostai.io`
5. Vercel will provide DNS configuration

### 2.2 Update Environment Variables

In the main app's Vercel settings (**Settings → Environment Variables**), update:

```
NEXTAUTH_URL=https://app.repostai.io
NEXT_PUBLIC_APP_URL=https://app.repostai.io
```

### 2.3 Redeploy Main Application

After updating environment variables:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **"Redeploy"** to apply new environment variables

## Step 3: Configure DNS Records

Go to your domain registrar (where repostai.io is registered) and configure DNS:

### For Landing Page (repostai.io)

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### For Main App (app.repostai.io)

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 3600
```

> [!IMPORTANT]
> DNS changes can take up to 48 hours to propagate, but usually complete within a few hours.

## Step 4: Update Landing Page Button

In the landing page repository, ensure the "Try Generator For Free" button redirects to the main app:

### For HTML/JSX:

```jsx
<a href="https://app.repostai.io" className="cta-button">
  Try Generator For Free
</a>
```

### For React Router (if using):

```jsx
<a href="https://app.repostai.io" target="_self">
  Try Generator For Free
</a>
```

> [!NOTE]
> Use a standard `<a>` tag with full URL instead of React Router's `<Link>` since we're navigating to a different domain.

## Step 5: Verification

### 5.1 Check DNS Propagation

```bash
# Check root domain
dig repostai.io

# Check app subdomain
dig app.repostai.io

# Check from different DNS servers
nslookup repostai.io 8.8.8.8
nslookup app.repostai.io 8.8.8.8
```

### 5.2 Test Landing Page

1. Open `https://repostai.io` in browser
2. Verify landing page loads correctly
3. Check SSL certificate is valid (green lock icon)
4. Test all landing page features
5. Click "Try Generator For Free" button
6. Verify redirect to `https://app.repostai.io`

### 5.3 Test Main Application

1. Open `https://app.repostai.io` directly
2. Verify main app loads correctly
3. Test authentication flow
4. Verify all features work
5. Check that sessions persist correctly

### 5.4 Cross-Browser Testing

Test on multiple browsers:
- Chrome/Chromium
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Landing Page Not Loading

1. **Check DNS**: Use `dig repostai.io` to verify DNS is pointing to Vercel
2. **Check Vercel**: Ensure domain is properly configured in Vercel dashboard
3. **Clear cache**: Try incognito/private mode to bypass cache
4. **Wait for DNS**: DNS propagation can take time

### Main App Not Loading on Subdomain

1. **Verify CNAME**: Check `app.repostai.io` CNAME record exists
2. **Check Vercel**: Ensure `app.repostai.io` is added in Vercel domains
3. **Environment variables**: Verify `NEXTAUTH_URL` is updated
4. **Redeploy**: Trigger a new deployment to apply changes

### SSL Certificate Issues

1. **Wait for provisioning**: Vercel automatically provisions SSL certificates, but it can take a few minutes
2. **Verify domain**: Ensure domain is properly verified in Vercel
3. **Check DNS**: Incorrect DNS can prevent SSL certificate issuance

### Button Redirect Not Working

1. **Hard-code URL**: Ensure button uses full URL `https://app.repostai.io`
2. **Check link**: Use browser DevTools to inspect the actual href
3. **Test in incognito**: Bypass any cached redirects

### Authentication Issues After Domain Change

1. **Clear cookies**: Old domain cookies may interfere
2. **Update OAuth**: If using OAuth (LinkedIn, etc.), update redirect URLs in provider settings:
   - Old: `https://repostai.io/api/auth/callback/linkedin`
   - New: `https://app.repostai.io/api/auth/callback/linkedin`
3. **Check NEXTAUTH_URL**: Ensure it's set to `https://app.repostai.io`

## OAuth Provider Updates

If your app uses OAuth authentication (LinkedIn, Google, etc.), you need to update redirect URLs:

### LinkedIn

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Select your app
3. Go to **Auth** tab
4. Update **Redirect URLs**:
   - Remove: `https://repostai.io/api/auth/callback/linkedin`
   - Add: `https://app.repostai.io/api/auth/callback/linkedin`

### Google OAuth (if applicable)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services → Credentials**
3. Update **Authorized redirect URIs**
4. Add: `https://app.repostai.io/api/auth/callback/google`

## Monitoring

After deployment, monitor:

1. **Vercel Analytics**: Track page views and performance for both projects
2. **Error logs**: Check Vercel logs for any runtime errors
3. **Uptime**: Set up uptime monitoring (UptimeRobot, Pingdom)
4. **User feedback**: Monitor user reports for any issues

## Future Considerations

### Email Links

If you send emails with links, ensure they point to correct domains:
- Marketing emails → `https://repostai.io`
- App notifications → `https://app.repostai.io`

### SEO

- Update sitemap for landing page
- Submit `repostai.io` to Google Search Console
- Set up proper meta tags for both domains
- Implement canonical URLs

### Analytics

Configure Google Analytics or other tracking:
- Landing page: Track marketing funnel
- Main app: Track user behavior and feature usage
- Set up goal tracking for "Try Generator For Free" button clicks

## Quick Reference

| Purpose | Domain | Repository | Vercel Project |
|---------|--------|------------|----------------|
| Landing Page | `repostai.io` | `that-cod/RepostAI_landing` | RepostAI Landing |
| Main App | `app.repostai.io` | `that-cod/reepost-ai` | RepostAI App |

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Review DNS configuration
3. Test in incognito mode
4. Check browser console for errors

---

**Deployment Date**: December 2025  
**Last Updated**: 2025-12-18
