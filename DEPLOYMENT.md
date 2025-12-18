# Deployment Guide

Complete guide to deploying your EasyGen platform to production.

## 🚀 Quick Deploy to Vercel (Recommended)

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above
2. Connect your GitHub repository
3. Configure environment variables
4. Click "Deploy"

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Variables (Vercel)

Go to Project Settings → Environment Variables:

```env
# Required for production
NODE_ENV=production

# Optional (for future features)
OPENAI_API_KEY=your_openai_key
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://yourdomain.com
```

## 🐳 Docker Deployment

### Create Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    restart: unless-stopped
```

### Build and Run

```bash
# Build image
docker build -t easygen-platform .

# Run container
docker run -p 3000:3000 easygen-platform

# Or use docker-compose
docker-compose up -d
```

## ☁️ AWS Deployment

### Using AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Click "New App" → "Host web app"
   - Connect GitHub repository

2. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment Variables**
   - Add in "Environment variables" section

### Using EC2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone your-repo-url
cd easygen-claude

# Install dependencies
npm install

# Build
npm run build

# Install PM2
sudo npm install -g pm2

# Start with PM2
pm2 start npm --name "easygen" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🌐 Netlify Deployment

### netlify.toml

Create this file in your project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"

# Essential Next.js Runtime Plugin
[[plugins]]
  package = "@netlify/plugin-nextjs"

# Handle client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false

# API routes
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

**Important**: Make sure to install the plugin:
```bash
npm install -D @netlify/plugin-nextjs
```

### Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

## 🔧 Environment Configuration

### Production .env

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication (if implemented)
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=https://yourdomain.com

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Storage (if needed)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket

# Email (if needed)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-key

# Monitoring
SENTRY_DSN=https://...
NEXT_PUBLIC_ANALYTICS_ID=your-id
```

### Generating Secrets

```bash
# Generate random secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🗄️ Database Setup

### PostgreSQL (Recommended)

#### Using Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string
3. Run migrations:

```bash
# Install Prisma (if using)
npm install -D prisma
npx prisma init

# Create schema in prisma/schema.prisma
# Then migrate
npx prisma migrate dev
npx prisma generate
```

#### Using PlanetScale

```bash
# Create database
pscale database create easygen

# Create branch
pscale branch create easygen main

# Get connection string
pscale connect easygen main --port 3309
```

### MongoDB Atlas

1. Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get connection string
3. Add to environment variables

## 🔒 Security Checklist

### Pre-deployment

- [ ] Remove console.log statements
- [ ] Set secure environment variables
- [ ] Enable HTTPS/SSL
- [ ] Set up CORS properly
- [ ] Add rate limiting
- [ ] Configure CSP headers
- [ ] Set secure cookies
- [ ] Add CSRF protection
- [ ] Sanitize user inputs
- [ ] Enable security headers

### next.config.mjs Security Headers

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};
```

## 📊 Monitoring Setup

### Sentry

```bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

### Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## 🚦 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🔄 Backup Strategy

### Database Backups

```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql

# Automated daily backups (cron)
0 2 * * * pg_dump $DATABASE_URL > /backups/$(date +\%Y\%m\%d).sql
```

### Code Backups

- Use Git for version control
- Push to multiple remotes
- Tag releases: `git tag v1.0.0`

## 📈 Performance Optimization

### Build Optimization

```javascript
// next.config.mjs
const nextConfig = {
  output: 'standalone',
  compress: true,
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  swcMinify: true,
};
```

### CDN Configuration

1. **Images**: Use Cloudinary or Vercel Image Optimization
2. **Static Assets**: Serve from CDN
3. **Fonts**: Self-host or use Vercel's font optimization

## 🧪 Pre-Production Testing

### Checklist

- [ ] All pages load correctly
- [ ] Forms submit properly
- [ ] API endpoints respond
- [ ] Authentication works
- [ ] Mobile responsive
- [ ] Browser compatibility
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] SSL certificate valid
- [ ] Environment variables set

### Testing Commands

```bash
# Build test
npm run build
npm start

# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:3000

# Check bundle size
npm run build -- --analyze
```

## 🎯 Post-Deployment

### Monitoring Checklist

- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure error tracking (Sentry)
- [ ] Enable performance monitoring
- [ ] Set up log aggregation
- [ ] Configure alerts
- [ ] Monitor API usage
- [ ] Track user analytics
- [ ] Set up status page

### DNS Configuration

```
A     @              your-server-ip
CNAME www            yourdomain.com
CNAME api            api.yourdomain.com
```

### SSL Certificate

```bash
# Using Certbot (Let's Encrypt)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 🆘 Troubleshooting

### Build Failures

```bash
# Clear cache
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Memory Issues

```javascript
// next.config.mjs
const nextConfig = {
  experimental: {
    workerThreads: false,
    cpus: 1
  }
};
```

### Database Connection

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
# Increase max connections if needed
```

## 📞 Support

For deployment issues:
1. Check [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
2. Review Vercel/provider documentation
3. Check GitHub Discussions
4. Create an issue in the repository

---

Your EasyGen platform is now ready for production deployment! 🎉
