# CSV to Database Schema Mapping Analysis

## Summary
**Status:** ✅ **READY** - CSV has excellent data quality and coverage!

The CSV contains comprehensive LinkedIn post data including:
- ✅ All post URLs (100% coverage)
- ✅ All author profile URLs (100% coverage)  
- ✅ Complete engagement metrics
- ✅ Content analysis fields (questions, CTAs, word count)
- ✅ Timing data (day of week, hour)
- ✅ Media type classification

**Target Table:** `TrendingPost` + `TrendingCreator` (just need minor schema updates)

---

## CSV Schema (ALL_CLEANED_MERGED.csv)

| CSV Column | Data Type | Coverage | Description |
|------------|-----------|----------|-------------|
| post_id | Integer | 100% | LinkedIn post ID |
| content | Text | 100% | Post content/text |
| author_name | Text | 100% | Creator's name |
| author_username | Text | 96.01% | LinkedIn username |
| author_headline | Text | 100% | Creator's headline/bio |
| author_profile_url | Text | 100% | LinkedIn profile URL |
| likes | Integer | 100% | Number of likes |
| comments | Integer | 100% | Number of comments |
| reposts | Integer | 100% | Number of reposts/shares |
| engagement_score | Integer | 100% | Total engagement metric |
| word_count | Integer | 100% | Word count of content |
| hashtags | Text | 13.99% | Hashtags used (comma-separated) |
| has_question | Boolean | 100% | Whether post contains questions |
| has_cta | Boolean | 100% | Whether post has CTA |
| posted_date_iso | Text/Date | 100% | ISO date string |
| posted_day_of_week | Text | 100% | Day name (e.g., "Monday") |
| posted_hour | Integer | 100% | Hour of day (0-23) |
| post_url | Text | 100% | LinkedIn post URL |
| post_type | Text | 100% | Type: regular, repost, quote |
| media_type | Text | 71.22% | Type: image, video, images, or null |

---

## Target Database Schema

### Option 1: **TrendingPost + TrendingCreator** (RECOMMENDED)

This is the correct approach for storing reference/viral LinkedIn posts from other creators.

#### TrendingCreator Table
```prisma
model TrendingCreator {
  id             String    @id @default(cuid())
  name           String
  image          String?
  bio            String?   @db.Text
  occupation     String?
  location       String?
  industry       String?
  linkedinUrl    String?
  followerCount  Int       @default(0)
  isFollowing    Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  trendingPosts  TrendingPost[]
}
```

#### TrendingPost Table
```prisma
model TrendingPost {
  id                String          @id @default(cuid())
  creatorId         String
  content           String          @db.Text
  mediaUrl          String?
  mediaType         MediaType       @default(IMAGE)
  
  // Engagement metrics
  likes             Int             @default(0)
  comments          Int             @default(0)
  reposts           Int             @default(0)
  views             Int             @default(0)
  
  // Outlier index (1-100 scale)
  outlierIndex      Int             @default(50)
  
  publishedDate     DateTime        @default(now())
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  keywords          String[]        @default([])
  
  creator           TrendingCreator @relation(...)
}
```

### Option 2: **ViralPost** (Alternative for RAG system)

The schema also has a `ViralPost` table that could be used:

```prisma
model ViralPost {
  id                    String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  post_id               String    @unique @db.VarChar(255)
  content               String
  embedding             Unsupported("vector")?
  author_name           String?   @db.VarChar(255)
  author_profile_url    String?
  author_follower_count Int?
  likes                 Int?      @default(0)
  comments              Int?      @default(0)
  reposts               Int?      @default(0)
  engagement_score      Int?      @default(0)
  tone_detected         String?   @db.VarChar(50)
  topic_category        String?   @db.VarChar(100)
  posted_date           DateTime? @db.Timestamptz(6)
  post_url              String?
  createdAt             DateTime? @default(now())
}
```

---

## Field Mapping

### CSV → TrendingPost + TrendingCreator

| CSV Field | Database Table | Database Field | Transformation Required |
|-----------|---------------|----------------|------------------------|
| **Author Fields (→ TrendingCreator)** |
| author_name | TrendingCreator | name | ✅ Direct mapping |
| author_headline | TrendingCreator | bio | ✅ Direct mapping |
| author_profile_url | TrendingCreator | linkedinUrl | ✅ Direct mapping (100% coverage) |
| author_username | TrendingCreator | *(new field needed)* | ✅ Already in CSV (96% coverage) |
| *(not in CSV)* | TrendingCreator | followerCount | Default: 0 (need to scrape/estimate) |
| *(not in CSV)* | TrendingCreator | isFollowing | Default: false |
| *(not in CSV)* | TrendingCreator | location | null |
| *(not in CSV)* | TrendingCreator | industry | null |
| *(not in CSV)* | TrendingCreator | image | null (can scrape from LinkedIn) |
| **Post Fields (→ TrendingPost)** |
| content | TrendingPost | content | ✅ Direct mapping |
| likes | TrendingPost | likes | ✅ Direct mapping |
| comments | TrendingPost | comments | ✅ Direct mapping |
| reposts | TrendingPost | reposts | ✅ Direct mapping |
| posted_date_iso | TrendingPost | publishedDate | Parse ISO date string |
| media_type | TrendingPost | mediaType | Map: image→IMAGE, video→VIDEO, images→IMAGE, null→NONE |
| post_url | TrendingPost | *(new field needed)* | ✅ **Already in CSV (100% coverage!)** - Need to add field to schema |
| post_id | TrendingPost | linkedInPostId | ✅ **Already in CSV (100% coverage!)** - Need to add field to schema |
| engagement_score | TrendingPost | outlierIndex | Scale to 1-100 (current range / max * 100) |
| hashtags | TrendingPost | keywords | Split comma-separated hashtags into array |
| word_count | TrendingPost | *(new field needed)* | ✅ Already in CSV - preserve for analytics |
| has_question | TrendingPost | *(new field needed)* | ✅ Already in CSV - preserve for analytics |
| has_cta | TrendingPost | *(new field needed)* | ✅ Already in CSV - preserve for analytics |
| posted_hour | TrendingPost | *(new field needed)* | ✅ Already in CSV - preserve for timing analysis |
| posted_day_of_week | TrendingPost | *(new field needed)* | ✅ Already in CSV - preserve for timing analysis |
| *(not used)* | TrendingPost | views | Default: 0 (not in CSV) |
| *(not used)* | TrendingPost | mediaUrl | null (no actual media URLs in CSV, only types) |
| post_type | - | - | ✅ In CSV (regular/repost/quote) - good for filtering |

### CSV → ViralPost (Alternative)

| CSV Field | ViralPost Field | Transformation |
|-----------|----------------|----------------|
| post_id | post_id | Direct mapping (as string) |
| content | content | Direct mapping |
| author_name | author_name | Direct mapping |
| author_profile_url | author_profile_url | Direct mapping |
| likes | likes | Direct mapping |
| comments | comments | Direct mapping |
| reposts | reposts | Direct mapping |
| engagement_score | engagement_score | Direct mapping |
| posted_date_iso | posted_date | Parse to DateTime |
| post_url | post_url | Direct mapping |
| *(not in CSV)* | author_follower_count | null or estimate |
| *(not in CSV)* | tone_detected | null or analyze |
| *(not in CSV)* | topic_category | null or analyze |
| *(not in CSV)* | embedding | null (generate later) |

---

## Schema Gaps & Required Changes

### Missing Fields in Database

1. **TrendingPost needs:**
   - `postUrl` (String?) - To store the LinkedIn post URL
   - `linkedInPostId` (String?) - To store the original LinkedIn post ID
   - `wordCount` (Int?) - Optional analytics field
   - `hasQuestion` (Boolean?) - Content analysis field
   - `hasCallToAction` (Boolean?) - Content analysis field
   - `postedHour` (Int?) - Time analysis (0-23)
   - `postedDayOfWeek` (String?) - Day analysis

2. **TrendingCreator needs:**
   - `username` (String?) - LinkedIn username
   - `headline` (String?) - Author headline (separate from bio)

### Missing Fields in CSV

1. **For TrendingPost:**
   - `views` - Not captured in CSV (will default to 0)
   - `mediaUrl` - No actual media URLs, only type indicator
   - Individual media file URLs

2. **For TrendingCreator:**
   - `followerCount` - Critical for engagement analysis
   - `location` - Profile information
   - `industry` - Categorization
   - `image` - Profile picture URL
   - `occupation` - Job title

---

## Data Quality Issues

### Issues to Address:

1. **Missing Data:**
   - 4% missing author usernames
   - 29% missing media type (likely text-only posts)
   - 86% missing hashtags

2. **Data Type Conversions:**
   - `posted_date_iso` needs parsing from string to DateTime
   - `media_type` needs enum mapping (IMAGE, VIDEO, NONE)
   - `hashtags` needs splitting from comma-separated string to array

3. **Engagement Score Normalization:**
   - Current range: 75 - 195,821
   - TrendingPost.outlierIndex expects: 1-100
   - **Suggested formula:** `(engagement_score / max_engagement_score) * 100`

4. **Media Type Mapping:**
   - CSV values: "image", "video", "images", null
   - Database enum: IMAGE, VIDEO, DOCUMENT, NONE
   - Map "images" → IMAGE, null → NONE

---

## Import Strategy

### Recommended Approach: TrendingPost + TrendingCreator

```typescript
// Pseudo-code for import process
for each row in CSV:
  1. Check if TrendingCreator exists (by linkedinUrl or name)
     - If not, create new TrendingCreator
     - Fields: name, bio (from headline), linkedinUrl
  
  2. Create TrendingPost
     - creatorId: Link to TrendingCreator.id
     - content, likes, comments, reposts
     - publishedDate: Parse posted_date_iso
     - mediaType: Map media_type value
     - keywords: Split hashtags into array
     - outlierIndex: Calculate from engagement_score
  
  3. Skip duplicates (check by post content + creator)
```

### Import Script Structure

```javascript
import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse';
import fs from 'fs';

const prisma = new PrismaClient();

async function importCSV() {
  const records = await parseCSV('ALL_CLEANED_MERGED.csv');
  
  // Calculate max engagement for normalization
  const maxEngagement = Math.max(...records.map(r => r.engagement_score));
  
  for (const record of records) {
    // 1. Upsert Creator
    const creator = await prisma.trendingCreator.upsert({
      where: { linkedinUrl: record.author_profile_url },
      update: {},
      create: {
        name: record.author_name,
        bio: record.author_headline,
        linkedinUrl: record.author_profile_url,
        followerCount: 0, // Not in CSV
      }
    });
    
    // 2. Create Post
    await prisma.trendingPost.create({
      data: {
        creatorId: creator.id,
        content: record.content,
        likes: record.likes,
        comments: record.comments,
        reposts: record.reposts,
        views: 0, // Not in CSV
        publishedDate: new Date(record.posted_date_iso),
        mediaType: mapMediaType(record.media_type),
        keywords: record.hashtags ? record.hashtags.split(',') : [],
        outlierIndex: Math.round((record.engagement_score / maxEngagement) * 100),
      }
    });
  }
}

function mapMediaType(type: string | null): MediaType {
  if (!type) return 'NONE';
  if (type === 'image' || type === 'images') return 'IMAGE';
  if (type === 'video') return 'VIDEO';
  return 'NONE';
}
```

---

## Recommended Database Schema Updates

To fully support this CSV data, update the Prisma schema:

```prisma
model TrendingCreator {
  id             String    @id @default(cuid())
  name           String
  username       String?   // ADD THIS - LinkedIn username
  headline       String?   // ADD THIS - Author headline
  image          String?
  bio            String?   @db.Text
  occupation     String?
  location       String?
  industry       String?
  linkedinUrl    String?   @unique // ADD UNIQUE constraint
  followerCount  Int       @default(0)
  isFollowing    Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  trendingPosts  TrendingPost[]
  
  @@index([linkedinUrl]) // ADD INDEX
}

model TrendingPost {
  id                String          @id @default(cuid())
  creatorId         String
  content           String          @db.Text
  
  // LinkedIn metadata - ADD THESE
  linkedInPostId    String?         @unique
  postUrl           String?
  
  // Media
  mediaUrl          String?
  mediaType         MediaType       @default(NONE) // Changed default
  
  // Engagement metrics
  likes             Int             @default(0)
  comments          Int             @default(0)
  reposts           Int             @default(0)
  views             Int             @default(0)
  
  // Virality & Analytics - ADD THESE
  outlierIndex      Int             @default(50)
  wordCount         Int?
  hasQuestion       Boolean?
  hasCallToAction   Boolean?
  
  // Timing - ADD THESE
  postedHour        Int?            // 0-23
  postedDayOfWeek   String?         // "Monday", "Tuesday", etc.
  
  publishedDate     DateTime        @default(now())
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  keywords          String[]        @default([])
  
  creator           TrendingCreator @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  
  @@index([creatorId])
  @@index([publishedDate])
  @@index([outlierIndex])
  @@index([likes])
  @@index([linkedInPostId]) // ADD INDEX
  @@index([postedDayOfWeek]) // ADD INDEX
}
```

---

## Action Items

### To make the CSV ready for the engagement tab:

- [ ] **Update Prisma Schema** with missing fields
- [ ] **Run migration**: `npx prisma migrate dev --name add_trending_post_fields`
- [ ] **Create import script** (see template above)
- [ ] **Test with small batch** (first 100 rows)
- [ ] **Import full dataset** (11,442 posts)
- [ ] **Update engagement page** to query TrendingPost instead of mocked data
- [ ] **Add filters** for day of week, media type, engagement level

### Alternative Quick Solution (No Schema Changes):

Use the existing **ViralPost** table which already has most fields:
- Matches: post_id, content, author_name, author_profile_url, likes, comments, reposts, engagement_score, posted_date, post_url
- Missing: Just need to map CSV media_type and hashtags appropriately
- This is the fastest path if you don't want to modify the schema

---

## Conclusion

**Answer: ✅ The CSV is READY and has excellent data quality!**

### What the CSV Has (Great Coverage):
- ✅ **Post URLs** - 100% coverage (every post has LinkedIn URL)
- ✅ **Author Profile URLs** - 100% coverage (every author has profile URL)
- ✅ **Author Usernames** - 96% coverage
- ✅ **Engagement Metrics** - 100% (likes, comments, reposts, scores)
- ✅ **Content Analysis** - 100% (word count, has_question, has_cta)
- ✅ **Timing Data** - 100% (dates, day of week, hour)
- ✅ **Media Types** - 71% coverage (rest are text-only)
- ✅ **Post Types** - 100% (regular, repost, quote)

### What's Missing (Minor):
- ⚠️ Follower counts (can estimate or set to 0)
- ⚠️ Profile images (can scrape later)
- ⚠️ Actual media file URLs (have types only)
- ⚠️ View counts (not tracked)

### Next Steps:

1. **Schema Updates Needed:** Add fields to `TrendingPost` for better data preservation
   - `postUrl`, `linkedInPostId`, `wordCount`, `hasQuestion`, `hasCallToAction`, `postedHour`, `postedDayOfWeek`, `postType`
   
2. **Schema Updates for** `TrendingCreator`
   - `username`, `headline` (separate from bio)

3. **Import Process:** 
   - Parse 11,442 posts
   - Deduplicate 236 unique creators
   - Map media types to enum
   - Normalize engagement scores
   - Split hashtags into arrays

4. **Estimated Import Time:** ~2-5 minutes for full dataset

**Recommended Next Step:** I can create the import script now that will:
1. Update the Prisma schema with the needed fields
2. Import all 11,442 posts with proper relationships
3. Handle duplicates and data normalization
4. Preserve all the valuable analytics fields from your CSV

Would you like me to proceed with creating the schema updates and import script?
