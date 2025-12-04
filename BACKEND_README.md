# EasyGen SaaS Backend Documentation

Complete backend implementation for the EasyGen LinkedIn content generation platform.

## 🏗️ Architecture Overview

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase PostgreSQL with pgvector
- **ORM**: Prisma
- **Authentication**: NextAuth.js with LinkedIn OAuth
- **AI Providers**: OpenAI & Anthropic (Claude)
- **Payments**: Stripe
- **Storage**: Supabase Storage
- **Rate Limiting**: Upstash Redis
- **Cron Jobs**: Vercel Cron
- **Logging**: Winston

### Project Structure

```
├── app/
│   └── api/
│       ├── auth/              # Authentication routes
│       │   ├── [...nextauth]/ # NextAuth handler
│       │   └── signup/        # User registration
│       ├── posts/             # Post management
│       │   ├── route.ts       # List & create posts
│       │   ├── [id]/          # Individual post operations
│       │   ├── generate/      # AI generation
│       │   └── [id]/publish/  # LinkedIn publishing
│       ├── saved/             # Saved posts
│       ├── upload/            # File uploads
│       ├── trending/          # Trending feed
│       ├── search/            # Semantic search
│       ├── analytics/         # Analytics & metrics
│       ├── settings/          # User settings
│       ├── billing/           # Stripe integration
│       │   ├── checkout/      # Checkout sessions
│       │   ├── portal/        # Customer portal
│       │   └── subscription/  # Subscription management
│       ├── webhooks/          # External webhooks
│       │   └── stripe/        # Stripe webhooks
│       └── cron/              # Scheduled jobs
│           ├── publish/       # Auto-publish posts
│           └── sync-engagement/ # Sync LinkedIn metrics
├── lib/
│   ├── ai/                    # AI integrations
│   │   ├── openai.ts         # OpenAI client
│   │   ├── anthropic.ts      # Anthropic client
│   │   └── index.ts          # AI provider aggregator
│   ├── extractors/           # Text extraction
│   │   ├── pdf.ts           # PDF extraction
│   │   ├── document.ts      # DOCX extraction
│   │   └── index.ts         # Aggregator
│   ├── middleware/          # Middleware functions
│   │   └── auth.ts         # Auth helpers
│   ├── prisma.ts           # Prisma client
│   ├── logger.ts           # Winston logger
│   ├── errors.ts           # Error classes
│   ├── ratelimit.ts        # Rate limiting
│   ├── supabase.ts         # Supabase client
│   ├── stripe.ts           # Stripe client
│   ├── linkedin.ts         # LinkedIn API
│   └── auth.ts             # NextAuth config
├── prisma/
│   └── schema.prisma       # Database schema
├── middleware.ts           # Next.js middleware
├── vercel.json            # Vercel cron configuration
└── .env.example          # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Supabase account
- LinkedIn Developer App
- OpenAI API key (or Anthropic)
- Stripe account
- Upstash Redis account

### Installation

1. **Clone and install dependencies**:

```bash
npm install
```

2. **Set up environment variables**:

```bash
cp .env.example .env
```

Fill in all required environment variables in `.env`.

3. **Set up the database**:

```bash
# Push schema to database
npx prisma db push

# Or create a migration
npx prisma migrate dev --name init

# Enable pgvector extension manually in Supabase SQL editor
CREATE EXTENSION IF NOT EXISTS vector;

# Generate Prisma client
npx prisma generate
```

4. **Create Supabase Storage bucket**:

In Supabase dashboard:
- Go to Storage
- Create a new bucket named `easygen-uploads`
- Set it to public or private based on your needs

5. **Set up Stripe products**:

Create products and prices in Stripe dashboard for:
- Starter Plan
- Pro Plan
- Enterprise Plan

Add the price IDs to your `.env` file.

6. **Configure LinkedIn OAuth**:

- Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
- Create a new app
- Add redirect URL: `{YOUR_APP_URL}/api/auth/callback/linkedin`
- Request access to `w_member_social` scope
- Add client ID and secret to `.env`

7. **Run the development server**:

```bash
npm run dev
```

## 📡 API Documentation

### Authentication

#### Sign Up
```
POST /api/auth/signup
Body: { email, password, name }
Response: { user, message }
```

#### Sign In
```
POST /api/auth/signin
Uses NextAuth - redirect to sign in page
```

#### LinkedIn OAuth
```
GET /api/auth/signin/linkedin
Initiates LinkedIn OAuth flow
```

### Posts

#### List Posts
```
GET /api/posts?status={status}&limit={limit}&offset={offset}
Headers: Authorization: Bearer {token}
Response: { posts[], total, limit, offset }
```

#### Create Post
```
POST /api/posts
Headers: Authorization: Bearer {token}
Body: {
  content?: string,
  topic?: string,
  tone?: Tone,
  intensity?: Intensity,
  context?: string,
  scheduledFor?: string (ISO date),
  mediaUrls?: string[]
}
Response: Post object
```

#### Get Post
```
GET /api/posts/{id}
Headers: Authorization: Bearer {token}
Response: Post object
```

#### Update Post
```
PATCH /api/posts/{id}
Headers: Authorization: Bearer {token}
Body: { content?, tone?, intensity?, status?, scheduledFor?, mediaUrls? }
Response: Post object
```

#### Delete Post
```
DELETE /api/posts/{id}
Headers: Authorization: Bearer {token}
Response: { success: true }
```

#### Publish to LinkedIn
```
POST /api/posts/{id}/publish
Headers: Authorization: Bearer {token}
Response: Updated post with linkedInPostId
```

#### Generate Content
```
POST /api/posts/generate
Headers: Authorization: Bearer {token}
Body: {
  topic: string,
  tone?: Tone,
  intensity?: Intensity,
  context?: string,
  aiProvider?: 'openai' | 'anthropic',
  fileUrl?: string
}
Response: { content, provider, model, topic, tone, intensity }
```

### Saved Posts

#### List Saved Posts
```
GET /api/saved?limit={limit}&offset={offset}
Headers: Authorization: Bearer {token}
Response: { savedPosts[], total, limit, offset }
```

#### Save Post
```
POST /api/saved
Headers: Authorization: Bearer {token}
Body: { postId: string }
Response: SavedPost object
```

#### Unsave Post
```
DELETE /api/saved/{id}
Headers: Authorization: Bearer {token}
Response: { success: true }
```

### File Upload

#### Upload File
```
POST /api/upload
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data
Body: FormData with 'file', 'folder', 'extractText'
Response: { url, extractedText?, fileName, fileSize, fileType }
```

### Trending Feed

#### Get Trending Posts
```
GET /api/trending?timeframe={24h|7d|30d}&limit={limit}&offset={offset}
Headers: Authorization: Bearer {token}
Response: { posts[], total, limit, offset, timeframe }
```

### Semantic Search

#### Search Posts
```
POST /api/search
Headers: Authorization: Bearer {token}
Body: {
  query: string,
  limit?: number (1-50, default 10),
  threshold?: number (0-1, default 0.7)
}
Response: { query, results[], total }
```

### Analytics

#### Get Analytics
```
GET /api/analytics?days={days}&postId={postId}
Headers: Authorization: Bearer {token}
Response: {
  summary: { totalPosts, totalLikes, totalComments, totalShares, totalViews, engagementRate },
  timeline: Array<{ date, likes, comments, shares, views, clicks }>,
  topPosts: Array<Post with engagement metrics>,
  period: { days, startDate, endDate }
}
```

### Settings

#### Get Settings
```
GET /api/settings
Headers: Authorization: Bearer {token}
Response: Settings object
```

#### Update Settings
```
PATCH /api/settings
Headers: Authorization: Bearer {token}
Body: {
  autoPublish?: boolean,
  defaultScheduleTime?: string (HH:mm),
  preferredAiProvider?: 'openai' | 'anthropic',
  defaultTone?: Tone,
  defaultIntensity?: Intensity,
  emailNotifications?: boolean,
  publishNotifications?: boolean,
  engagementNotifications?: boolean,
  autoSyncEngagement?: boolean,
  syncFrequency?: number (minutes)
}
Response: Settings object
```

### Billing

#### Create Checkout Session
```
POST /api/billing/checkout
Headers: Authorization: Bearer {token}
Body: {
  priceId: string,
  successUrl?: string,
  cancelUrl?: string
}
Response: { url, sessionId }
```

#### Access Customer Portal
```
POST /api/billing/portal
Headers: Authorization: Bearer {token}
Body: { returnUrl?: string }
Response: { url }
```

#### Get Subscription
```
GET /api/billing/subscription
Headers: Authorization: Bearer {token}
Response: { plan, subscriptionId, priceId, currentPeriodEnd, isActive }
```

#### Cancel Subscription
```
DELETE /api/billing/subscription
Headers: Authorization: Bearer {token}
Response: { success, cancelAtPeriodEnd, currentPeriodEnd }
```

### Webhooks

#### Stripe Webhook
```
POST /api/webhooks/stripe
Headers: stripe-signature
Body: Stripe event payload
```

### Cron Jobs

#### Auto-Publish (Every 5 minutes)
```
POST /api/cron/publish
Headers: Authorization: Bearer {CRON_SECRET}
```

#### Sync Engagement (Every hour)
```
POST /api/cron/sync-engagement
Headers: Authorization: Bearer {CRON_SECRET}
```

## 🔐 Security Features

### Authentication
- NextAuth.js with JWT sessions
- LinkedIn OAuth integration
- Bcrypt password hashing
- Session management

### Rate Limiting
- Global: 100 requests/minute
- AI Generation: 20 requests/hour
- Publishing: 10 posts/day
- Implemented with Upstash Redis

### Error Handling
- Custom error classes
- Centralized error formatting
- Proper HTTP status codes
- Error logging

### Authorization
- Middleware-based auth checks
- Resource ownership verification
- Plan-based feature access
- Cron job secret verification

## 📊 Database Schema

### Core Models

- **User**: User accounts and auth
- **Account**: OAuth accounts (NextAuth)
- **Session**: User sessions (NextAuth)
- **Post**: LinkedIn posts with embeddings
- **SavedPost**: User's saved posts
- **Analytics**: Engagement metrics
- **Settings**: User preferences
- **Subscription**: Stripe subscriptions
- **Usage**: Usage tracking
- **AuditLog**: Security audit trail

### pgvector Integration

Posts include vector embeddings (1536 dimensions) for semantic search:

```sql
embedding vector(1536)
```

Cosine similarity search:
```sql
SELECT *, 1 - (embedding <=> query_embedding) as similarity
FROM Post
WHERE 1 - (embedding <=> query_embedding) > threshold
ORDER BY similarity DESC
```

## 🤖 AI Integration

### Supported Providers

1. **OpenAI**
   - Text generation: GPT-4 Turbo
   - Embeddings: text-embedding-3-small
   - Vision: GPT-4 Vision

2. **Anthropic**
   - Text generation: Claude 3.5 Sonnet
   - Vision: Claude 3.5 Sonnet

### Text Extraction

Supports multiple file types:
- **PDF**: pdf-parse
- **DOCX**: mammoth
- **Images**: AI vision (GPT-4 Vision or Claude)

## 💳 Stripe Integration

### Features
- Subscription checkout
- Customer portal
- Webhook handling
- Plan management
- Usage tracking

### Webhook Events Handled
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

## 📝 Logging

Winston logger with multiple transports:
- Console (development)
- File: `logs/error.log`
- File: `logs/combined.log`

Log levels:
- `error`: Critical errors
- `warn`: Warnings
- `info`: General information
- `debug`: Debugging information

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables

Required for production:
- All database credentials
- API keys (OpenAI, Anthropic, Stripe, etc.)
- NextAuth secret and URL
- LinkedIn OAuth credentials
- Upstash Redis credentials
- Supabase credentials
- Cron secret

### Database Migration

```bash
# Production migration
npx prisma migrate deploy
```

### Post-Deployment

1. Enable pgvector extension in database
2. Create Supabase storage bucket
3. Configure Stripe webhooks
4. Set up LinkedIn OAuth redirect URLs
5. Test cron jobs

## 🧪 Testing

### API Testing with cURL

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"Test User"}'

# Generate post
curl -X POST http://localhost:3000/api/posts/generate \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"topic":"AI in healthcare","tone":"PROFESSIONAL","intensity":"MEDIUM"}'

# Create post
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"topic":"Test","content":"My test post"}'
```

## 📈 Monitoring

### Key Metrics to Monitor

- API response times
- Error rates
- Rate limit hits
- AI API costs
- Database query performance
- Cron job success rates
- Stripe webhook delivery

### Logging

All operations are logged with Winston:
- API requests
- Database operations
- AI API calls
- Security events
- Errors and exceptions

## 🔧 Maintenance

### Regular Tasks

1. **Monitor logs**: Check `logs/` directory
2. **Database backups**: Use Supabase automated backups
3. **Review analytics**: Check usage patterns
4. **Update dependencies**: Regular security updates
5. **Monitor costs**: Track AI API usage

### Troubleshooting

#### Prisma Issues
```bash
npx prisma generate
npx prisma db push
```

#### Rate Limiting
Check Upstash Redis dashboard for limits and usage

#### Failed Cron Jobs
Check Vercel logs for cron execution

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com)

## 🤝 Support

For issues or questions:
1. Check the documentation above
2. Review error logs in `logs/`
3. Check Vercel deployment logs
4. Review database logs in Supabase

---

Built with ❤️ using Next.js 15 and TypeScript
