# Backend Quick Start Guide

Get your EasyGen backend up and running in 10 minutes.

## Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)
- API keys ready (OpenAI, Stripe, etc.)

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

**Minimal required variables to start:**

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"

# OpenAI (or Anthropic)
OPENAI_API_KEY="sk-..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### 3. Database Setup

```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run prisma:generate
```

**Enable pgvector in Supabase:**

Go to SQL Editor and run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 4. Create Storage Bucket

In Supabase Dashboard:
1. Go to Storage
2. Create bucket: `easygen-uploads`
3. Set permissions as needed

### 5. Seed Database (Optional)

```bash
npm run db:seed
```

This creates a demo user:
- Email: `demo@easygen.com`
- Password: `password123`

### 6. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## 🧪 Test the API

### Sign Up

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Generate Content

First, sign in to get a session token, then:

```bash
curl -X POST http://localhost:3000/api/posts/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "topic": "AI and productivity",
    "tone": "PROFESSIONAL",
    "intensity": "MEDIUM"
  }'
```

## ⚙️ Optional Integrations

### LinkedIn OAuth

1. Create app at [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Add redirect URL: `http://localhost:3000/api/auth/callback/linkedin`
3. Add to `.env`:
```env
LINKEDIN_CLIENT_ID="..."
LINKEDIN_CLIENT_SECRET="..."
```

### Stripe Billing

1. Get API keys from [Stripe Dashboard](https://dashboard.stripe.com)
2. Create products and prices
3. Add to `.env`:
```env
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # After setting up webhook
```

### Anthropic (Claude)

```env
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
DEFAULT_AI_PROVIDER="anthropic"
```

## 📚 Useful Commands

```bash
# Database
npm run db:push          # Push schema changes
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed with sample data
npm run db:reset         # Reset database

# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Prisma
npm run prisma:generate  # Generate Prisma client
```

## 🔍 Check Everything Works

1. **Database**: Visit http://localhost:5555 after running `npm run db:studio`
2. **API**: Try signup endpoint
3. **AI**: Generate a post
4. **Storage**: Upload a file

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Prisma Client Not Generated
```bash
npm run prisma:generate
```

### Database Connection Failed
- Check DATABASE_URL is correct
- Ensure database exists
- For Supabase, use connection pooling URL

### Rate Limiting Errors
- Check Upstash Redis credentials
- Or disable rate limiting temporarily for testing

## 📖 Next Steps

1. **Read Full Documentation**: See [BACKEND_README.md](./BACKEND_README.md)
2. **Set Up Production**: Deploy to Vercel
3. **Configure Webhooks**: Stripe webhook endpoint
4. **Set Up Monitoring**: Check logs in `logs/` directory

## 🆘 Need Help?

- Check error logs: `logs/error.log`
- Review Prisma logs in console
- Verify all environment variables
- Check database connection

---

Ready to build? Start with `npm run dev` 🚀
