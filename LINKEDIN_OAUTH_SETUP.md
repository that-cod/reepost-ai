# LinkedIn OAuth Setup Guide

## Issue
The "Continue with LinkedIn" button requires LinkedIn OAuth credentials to function.

## Quick Fix Options

### Option 1: Disable LinkedIn Sign-In (Recommended for now)
Add this to your `.env` file:
```bash
NEXT_PUBLIC_LINKEDIN_ENABLED=false
```
This will hide the LinkedIn button and users can sign in with email/password only.

### Option 2: Set Up LinkedIn OAuth (For production)

#### Step 1: Create LinkedIn App
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in app details:
   - App name: Reepost.ai
   - LinkedIn Page: Your company page
   - App logo: Upload your logo
4. Click "Create app"

#### Step 2: Configure OAuth Settings
1. Go to "Auth" tab
2. Add redirect URLs:
   - Development: `http://localhost:3000/api/auth/callback/linkedin`
   - Production: `https://yourdomain.com/api/auth/callback/linkedin`
3. Under "OAuth 2.0 scopes", request:
   - `openid`
   - `profile`
   - `email`

#### Step 3: Get Credentials
1. Go to "Auth" tab
2. Copy "Client ID"
3. Copy "Client Secret"

#### Step 4: Add to .env
```bash
LINKEDIN_CLIENT_ID="your-client-id-here"
LINKEDIN_CLIENT_SECRET="your-client-secret-here"
```

#### Step 5: Restart Server
```bash
npm run dev
```

## What Was Fixed

### 1. Auth Configuration (`lib/auth.ts`)
- LinkedIn provider now only loads if credentials are present
- Prevents runtime errors when credentials are missing
- Uses conditional spread operator to include/exclude provider

### 2. Sign-In Page (`app/auth/signin/page.tsx`)
- Added proper error handling with toast notifications
- LinkedIn button hidden if `NEXT_PUBLIC_LINKEDIN_ENABLED=false`
- Better user feedback for OAuth errors

### 3. Error Messages
- "LinkedIn sign-in is not configured" - when credentials missing
- "Failed to sign in with LinkedIn" - for other OAuth errors
- "An error occurred during LinkedIn sign-in" - for unexpected errors

## Testing

1. **Without credentials**: Button should be hidden or show error message
2. **With credentials**: Should redirect to LinkedIn OAuth flow
3. **After OAuth**: Should redirect back and create/sign in user

## Troubleshooting

### Error: "LinkedIn sign-in is not configured"
- LinkedIn credentials not set in `.env`
- Solution: Add credentials or disable LinkedIn sign-in

### Error: "redirect_uri_mismatch"
- Redirect URL in LinkedIn app doesn't match
- Solution: Add `http://localhost:3000/api/auth/callback/linkedin` to LinkedIn app

### Error: "invalid_client"
- Client ID or Secret is incorrect
- Solution: Double-check credentials from LinkedIn Developer Portal
