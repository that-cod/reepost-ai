# Landing Page Vercel Configuration

This document provides the exact configuration needed for deploying the landing page (React + Vite) to Vercel.

## File to Add to Landing Page Repository

Create a `vercel.json` file in the root of the `RepostAI_landing` repository:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Package.json Scripts

Ensure your `package.json` in the landing page repository has these scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Button Update Example

Update the CTA button in your React component to redirect to the main app:

### Example Component Update

```jsx
// In your landing page Hero or CTA component
function CTAButton() {
  return (
    <a 
      href="https://app.repostai.io"
      className="cta-button"
      rel="noopener noreferrer"
    >
      Try Generator For Free
    </a>
  );
}
```

Or for a button element:

```jsx
function CTAButton() {
  const handleClick = () => {
    window.location.href = 'https://app.repostai.io';
  };

  return (
    <button 
      onClick={handleClick}
      className="cta-button"
    >
      Try Generator For Free
    </button>
  );
}
```

## Repository Checklist

Before deploying, ensure your landing page repository has:

- [x] `vercel.json` configuration file
- [x] Updated CTA button to redirect to `https://app.repostai.io`
- [x] Proper `package.json` with build scripts
- [x] All dependencies listed in `package.json`
- [x] `.gitignore` includes `node_modules/` and `dist/`

## Deployment Steps Summary

1. **Add `vercel.json`** to landing page repository (use config above)
2. **Update CTA button** to point to `https://app.repostai.io`
3. **Commit and push** changes to GitHub
4. **Import to Vercel** from dashboard
5. **Add domain** `repostai.io` in Vercel project settings
6. **Configure DNS** as per integration guide
7. **Deploy** and verify

## Testing Locally

Before deploying to Vercel, test locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Visit `http://localhost:5173` (or the port Vite assigns) to test the landing page.

## Environment Variables (if needed)

If your landing page needs environment variables:

1. Create `.env` file locally (add to `.gitignore`)
2. In Vercel dashboard: Settings → Environment Variables
3. Add variables prefixed with `VITE_` for them to be accessible:
   ```
   VITE_API_URL=https://app.repostai.io
   VITE_APP_URL=https://app.repostai.io
   ```

Use in code:
```javascript
const appUrl = import.meta.env.VITE_APP_URL;
```

---

**Note**: Copy the `vercel.json` configuration to your landing page repository and update the CTA button before deploying to Vercel.
