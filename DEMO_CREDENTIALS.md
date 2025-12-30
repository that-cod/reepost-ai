# 🔐 Demo User Credentials

## Test Account Access

You can now log in to the Reepost.ai dashboard with the following credentials:

### Login Information
- **Email:** `demo@reepost.ai`
- **Password:** `password123`
- **Login URL:** [http://localhost:3005/auth/signin](http://localhost:3005/auth/signin)

### Account Details
- **Name:** Demo User
- **Plan:** PRO (Full access to all features)
- **User ID:** cmje0355a0000o9ek3hfami1j
- **Default Tone:** Professional
- **Default Intensity:** Medium

---

## What You Can Do

Once logged in, you'll have access to:

### 1. 🚀 AI Post Generation
- Generate LinkedIn posts with AI
- Choose from 8+ voice tones (Professional, Casual, Bold, etc.)
- Customize post length and intensity
- Use GPT-4 Turbo for content creation

### 2. 📅 Content Scheduling
- Schedule posts for optimal times
- View calendar of upcoming posts
- Bulk schedule multiple posts
- Auto-publish to LinkedIn (when configured)

### 3. 📊 Analytics Dashboard
- Track post performance
- View engagement metrics (likes, comments, shares)
- Monitor audience growth
- Analyze engagement rates

### 4. 📁 Document Upload
- Convert PDFs to LinkedIn posts
- Extract insights from Word documents
- Transform presentations into content

### 5. 🔥 Trending Feed
- Browse viral LinkedIn posts
- Repurpose winning content
- Filter by industry and topic
- One-click content inspiration

### 6. ⚙️ Settings & Preferences
- Customize your voice and tone
- Set default posting schedule
- Configure LinkedIn integration
- Manage notifications

---

## Creating More Users

If you need to create additional test users, run:

\`\`\`bash
npx tsx create-demo-user.ts
\`\`\`

Or use the full seed script to create users with sample posts:

\`\`\`bash
npm run db:seed
\`\`\`

---

## Troubleshooting

### Can't log in?
1. Make sure the dev server is running: `npm run dev`
2. Check that the database is connected
3. Verify credentials are correct (email: demo@reepost.ai, password: password123)

### Need to reset password?
Run the create-demo-user script again - it will update the existing user:
\`\`\`bash
npx tsx create-demo-user.ts
\`\`\`

### Database issues?
Push schema again:
\`\`\`bash
npx prisma db push
\`\`\`

---

## Security Note

⚠️ **Important:** This is a development/demo account. In production:
- Never use simple passwords like "password123"
- Always hash passwords with bcrypt (already implemented)
- Enable email verification
- Set up 2FA for admin accounts
- Use environment variables for sensitive data

---

## Next Steps

1. **Test the Landing Page:** Visit [http://localhost:3005](http://localhost:3005)
2. **Log In:** Use the credentials above
3. **Generate a Post:** Try the AI post generator
4. **Schedule Content:** Test the content calendar
5. **View Analytics:** Check the dashboard metrics
6. **Customize Settings:** Adjust your preferences

---

**Happy Testing! 🎉**
