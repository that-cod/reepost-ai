# 🗄️ Database Migration Guide - Trending & Creators Features

## ✅ Current Status

The Prisma schema has been **updated** with all necessary fields:

### TrendingCreator Model
- ✅ id, name, image, bio
- ✅ occupation, location, industry
- ✅ **linkedinUrl** (NEW - added)
- ✅ **location** (NEW - added)
- ✅ **industry** (NEW - added)
- ✅ followerCount, isFollowing
- ✅ Timestamps (createdAt, updatedAt)

### TrendingPost Model  
- ✅ id, creatorId, content
- ✅ mediaUrl, mediaType (IMAGE, VIDEO, DOCUMENT, NONE)
- ✅ Engagement: likes, comments, reposts, views
- ✅ outlierIndex (1-100 virality score)
- ✅ publishedDate
- ✅ keywords (array for filtering)
- ✅ Timestamps

---

## 🚀 Steps to Enable Database

### 1. Push Schema to Database

```bash
npx prisma db push
```

This will:
- Add the 3 new fields to `TrendingCreator` table
- Create indexes for better query performance
- **No data will be lost** (additive changes only)

### 2. Generate Prisma Client

```bash
npx prisma generate
```

This updates the Prisma client with the new fields.

### 3. Seed the Database

Run the seed script to add sample data:

```bash
npx tsx scripts/seed-trending.ts
```

This will create:
- 6 creators with complete profiles
- 18-30 trending posts
- Realistic engagement metrics
- Proper relationships

### 4. Switch to Database APIs

**Option A: Rename Files (Recommended)**

Replace mock data APIs with database versions:

```bash
# Backup current mock APIs
mv app/api/trending/posts/route.ts app/api/trending/posts/route-mock.ts
mv app/api/creators/list/route.ts app/api/creators/list/route-mock.ts

# Activate database APIs
mv app/api/trending/posts/route-db.ts app/api/trending/posts/route.ts
mv app/api/creators/list/route-db.ts app/api/creators/list/route.ts
```

**Option B: Manual Copy**

Or manually copy the database code from `route-db.ts` files to `route.ts` files.

---

## 📊 Database API Features

### Trending Posts API (`route-db.ts`)

**Query Capabilities:**
- ✅ Full Prisma integration
- ✅ Optimized queries with indexes
- ✅ Efficient filtering and pagination
- ✅ Includes creator data in response
- ✅ Keyword exclusion using array operations
- ✅ Date range filtering
- ✅ Engagement metric ranges

**Performance:**
- Uses Prisma's query optimization
- Indexed fields for fast filtering
- Parallel queries for count and data
- Efficient pagination

### Creators List API (`route-db.ts`)

**Query Capabilities:**
- ✅ Fetches all creators from database
- ✅ Includes post count for each creator
- ✅ Ordered by follower count
- ✅ All new fields included

---

## 🎯 What You Get

### After Migration:

**Trending Page:**
- Real posts from database
- Persistent data across sessions
- Can add/edit posts via database
- Filters work on real data

**Creators Page:**
- Real creator profiles
- Persistent follow status
- Can add new creators
- LinkedIn URLs saved in DB

**Engagement Page:**
- Shows creators from database
- Follow status persists
- All data linked properly

---

## 🧪 Testing the Migration

### 1. Verify Database Connection

```bash
npx prisma studio
```

Opens GUI to view database tables.

### 2. Check Tables Exist

You should see:
- `TrendingCreator` table
- `TrendingPost` table
- Proper relationships

### 3. Test APIs

**Trending Posts:**
```
GET http://localhost:3000/api/trending/posts
```

**Creators List:**
```
GET http://localhost:3000/api/creators/list
```

Both should return data from database.

### 4. Test UI

Visit these pages and verify data loads:
- http://localhost:3000/trending
- http://localhost:3000/creators
- http://localhost:3000/engagement

---

## 📝 Schema Changes Summary

### Fields Added to TrendingCreator:

```prisma
location       String?    // e.g., "Tel Aviv District, Israel"
industry       String?    // e.g., "Computer Software"
linkedinUrl    String?    // e.g., "https://www.linkedin.com/in/rubenhassid/"
```

### Why These Fields:

- **location**: Displayed in creator cards with map icon
- **industry**: Shown with briefcase icon
- **linkedinUrl**: Powers "Open Recent Activity" buttons on engagement page

---

## 🔄 Rollback Plan

If you want to revert to mock data:

```bash
# Restore mock APIs
mv app/api/trending/posts/route-mock.ts app/api/trending/posts/route.ts
mv app/api/creators/list/route-mock.ts app/api/creators/list/route.ts
```

The schema changes are **non-destructive** and won't affect anything else.

---

## ⚡ Quick Start Commands

Run these in order:

```bash
# 1. Update database schema
npx prisma db push

# 2. Generate client
npx prisma generate

# 3. Seed data
npx tsx scripts/seed-trending.ts

# 4. Switch to database APIs (choose one method above)

# 5. Restart dev server
# (Or it will auto-restart)
```

---

## ✅ Verification Checklist

After migration, verify:

- [ ] Database tables created successfully
- [ ] Seed script ran without errors
- [ ] Trending page loads posts from DB
- [ ] Creators page shows DB data
- [ ] Engagement page displays followed creators
- [ ] All filters work correctly
- [ ] Search functionality works
- [ ] Follow/unfollow persists in DB

---

## 🆘 Troubleshooting

### "Cannot find module '@/lib/prisma'"

Create the prisma client instance:

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### "Database connection failed"

Check your `.env` file has valid `DATABASE_URL`.

### "No posts showing"

Run the seed script to add sample data.

---

## 📌 Notes

- Mock data APIs are saved as `route-mock.ts` (backup)
- Database APIs are in `route-db.ts` (ready to use)
- Schema is backwards compatible
- All existing posts will remain intact
- The UI doesn't need any changes

**Ready to migrate when you are!** 🚀
