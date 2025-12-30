# Alternative Migration Method

Since `npx prisma db push` is having connection issues, you can run the migration manually using one of these methods:

## Option 1: Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste the migration:**
   - Open `migration_add_trending_fields.sql`
   - Copy all the SQL
   - Paste into the SQL Editor

4. **Run the migration:**
   - Click "Run" button
   - You should see success messages

5. **Verify:**
   - You should see confirmation that columns and indexes were added

## Option 2: Prisma Studio with Direct Connection

1. **Try connecting with Prisma Studio:**
   ```bash
   npx prisma studio
   ```

2. If this works, the database connection is fine, and you can try:
   ```bash
   npx prisma db push --accept-data-loss
   ```

## Option 3: psql Command Line

If you have PostgreSQL client installed:

```bash
psql "YOUR_DATABASE_URL" -f migration_add_trending_fields.sql
```

Replace `YOUR_DATABASE_URL` with your actual connection string from `.env`

## After Running the Migration

Once the migration is successful:

1. **Generate Prisma Client** (already done ✅):
   ```bash
   npx prisma generate
   ```

2. **Import the CSV data:**
   ```bash
   npm run import-csv
   ```

3. **View results:**
   - Visit: http://localhost:3000/engagement

## Troubleshooting Connection Issues

If you're having database connection issues:

### Check 1: Database URL Format
Your DATABASE_URL should look like:
```
postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### Check 2: IP Allowlist
- Go to Supabase Dashboard → Settings → Database
- Check if IP allowlist is blocking your connection
- Add your IP or disable the allowlist temporarily

### Check 3: Password
- Ensure your database password is correct
- Check for special characters that might need URL encoding

### Check 4: Try DIRECT_URL
If you have both `DATABASE_URL` (pooler) and `DIRECT_URL` (direct):
- The migration needs `DIRECT_URL`
- Make sure it's set in your `.env`

## What the Migration Does

The SQL file will:

✅ Add `username` to TrendingCreator  
✅ Add `headline` to TrendingCreator  
✅ Add `linkedInPostId` to TrendingPost  
✅ Add `postUrl` to TrendingPost  
✅ Add `postType` to TrendingPost  
✅ Add `wordCount` to TrendingPost  
✅ Add `hasQuestion` to TrendingPost  
✅ Add `hasCallToAction` to TrendingPost  
✅ Add `postedHour` to TrendingPost  
✅ Add `postedDayOfWeek` to TrendingPost  
✅ Create 6 new indexes for performance  
✅ Add unique constraints  

**Total:** 10 new columns, 6 new indexes

## Next Steps

After the migration works:

1. ✅ Prisma Client generated (already done)
2. ⏳ Run import: `npm run import-csv`
3. 🎉 View data: http://localhost:3000/engagement

---

**Need Help?**

The migration SQL is safe to run multiple times - it uses `IF NOT EXISTS` checks to avoid errors if columns already exist.
