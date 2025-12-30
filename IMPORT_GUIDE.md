# CSV Import Guide

This guide will help you import the LinkedIn posts CSV data into your database.

## Prerequisites

1. ✅ CSV file (`ALL_CLEANED_MERGED.csv`) in the project root
2. ✅ Database connection configured in `.env`
3. ✅ `csv-parse` package installed (already done)

## Step-by-Step Import Process

### Step 1: Ensure Database is Connected

First, make sure your database connection is working:

```bash
npx prisma db push
```

This will sync your Prisma schema with the database. If you see errors, check your `.env` file for correct `DATABASE_URL`.

### Step 2: Generate Prisma Client

Generate the Prisma client with the updated schema:

```bash
npx prisma generate
```

### Step 3: Run the Import Script

Import all 11,442 posts from the CSV:

```bash
npm run import-csv
```

**This will:**
- ✅ Read the CSV file
- ✅ Create/update 236 unique creators
- ✅ Import all 11,442 posts
- ✅ Normalize engagement scores (0-100 scale)
- ✅ Parse media types and hashtags
- ✅ Handle duplicates automatically

**Expected time:** 2-5 minutes

### Step 4: Verify Import

Check the import success in your terminal. You should see:

```
🎉 Import process finished successfully!

📊 STATISTICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 Creators created:  236
👥 Creators updated:  0
📝 Posts created:     11,442
⏭️  Posts skipped:     0
❌ Errors:            0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 5: View in Database

Open Prisma Studio to view the imported data:

```bash
npm run db:studio
```

Navigate to:
- `TrendingCreator` - See all 236 LinkedIn creators
- `TrendingPost` - See all 11,442 posts with full analytics

### Step 6: Access Engagement Tab

Visit the engagement tab in your application:

```
http://localhost:3000/engagement
```

You should see all the imported posts with:
- 🎯 Advanced filters (media type, day, post type, questions, CTAs)
- 📊 Engagement metrics and stats
- 🔥 Virality scores
- 🔗 Direct links to LinkedIn posts

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
1. Check your `.env` file has correct `DATABASE_URL`
2. Ensure your database server is running
3. Test connection: `npx prisma db push`

### Issue: "csv-parse module not found"

**Solution:**
```bash
npm install csv-parse
```

### Issue: "Duplicate key error"

**Solution:**
The script handles duplicates automatically. If you see this error:
1. Some posts may already be in the database
2. The script will skip duplicates and continue
3. Check the final statistics for `Posts skipped` count

### Issue: "Prisma client not generated"

**Solution:**
```bash
npx prisma generate
```

### Issue: "Schema out of sync"

**Solution:**
```bash
npx prisma db push
npx prisma generate
```

## Data Imported

### From CSV to Database

The import maps all these fields:

**TrendingCreator:**
- name, username, headline
- linkedinUrl (unique identifier)
- followerCount (default: 0)

**TrendingPost:**
- content, postType, mediaType
- likes, comments, reposts
- outlierIndex (normalized 0-100)
- wordCount, hasQuestion, hasCallToAction
- postedHour, postedDayOfWeek
- publishedDate, keywords (hashtags)
- linkedInPostId, postUrl

## Re-running the Import

If you need to re-import:

1. **Clear existing data** (optional):
```bash
# This will delete ALL trending posts and creators
npx prisma studio
# Manually delete records, OR use SQL:
# DELETE FROM "TrendingPost";
# DELETE FROM "TrendingCreator";
```

2. **Run import again**:
```bash
npm run import-csv
```

The script automatically handles duplicates, so you can run it multiple times safely.

## Performance Notes

- **CSV Size:** 19 MB, 11,442 records
- **Import Time:** ~2-5 minutes
- **Database Operations:** ~12,000 inserts/upserts
- **Memory Usage:** ~100-200 MB

## Schema Changes

If you made custom schema changes, update:

1. `prisma/schema.prisma` - Your database schema
2. `scripts/import-csv-data.ts` - The import logic
3. Run: `npx prisma db push && npx prisma generate`

## What's Next?

After import, you can:

1. **View Posts:** Go to `/engagement` page
2. **Filter & Analyze:** Use advanced filters
3. **Study Patterns:** See what content performs best
4. **Generate Content:** Use insights to create your own posts

## Support

If you encounter issues:

1. Check the console output for detailed error messages
2. Verify your CSV file is in the correct location
3. Ensure database connection is working
4. Check Prisma schema matches the import script

---

**Ready to import?** Run: `npm run import-csv`
