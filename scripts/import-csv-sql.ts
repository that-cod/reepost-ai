import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface CSVRow {
    post_id: string;
    content: string;
    author_name: string;
    author_username: string;
    author_headline: string;
    author_profile_url: string;
    likes: string;
    comments: string;
    reposts: string;
    engagement_score: string;
    word_count: string;
    hashtags: string;
    has_question: string;
    has_cta: string;
    posted_date_iso: string;
    posted_day_of_week: string;
    posted_hour: string;
    post_url: string;
    post_type: string;
    media_type: string;
}

type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'NONE';

function mapMediaType(type: string | null | undefined): MediaType {
    if (!type || type === '') return 'NONE';
    const normalized = type.toLowerCase();
    if (normalized === 'image' || normalized === 'images') return 'IMAGE';
    if (normalized === 'video') return 'VIDEO';
    if (normalized === 'document') return 'DOCUMENT';
    return 'NONE';
}

function parseBoolean(value: string): boolean {
    return value?.toLowerCase() === 'true';
}

function splitHashtags(hashtags: string): string[] {
    if (!hashtags || hashtags === '') return [];
    return hashtags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
}

function escapeString(str: string): string {
    if (!str) return '';
    return str.replace(/'/g, "''");
}

async function importWithSQL() {
    console.log('🚀 Starting SQL-based batch CSV import...\n');

    const csvContent = fs.readFileSync('./ALL_CLEANED_MERGED.csv', 'utf-8');
    const records: CSVRow[] = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });

    console.log(`📊 Total records to import: ${records.length}\n`);

    const maxEngagement = Math.max(...records.map(r => parseInt(r.engagement_score)));
    console.log(`📈 Max engagement score: ${maxEngagement}\n`);

    // Group posts by author
    const postsByAuthor = new Map<string, CSVRow[]>();
    records.forEach(record => {
        const authorUrl = record.author_profile_url;
        if (!postsByAuthor.has(authorUrl)) {
            postsByAuthor.set(authorUrl, []);
        }
        postsByAuthor.get(authorUrl)!.push(record);
    });

    console.log(`👥 Unique authors: ${postsByAuthor.size}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Insert creators using raw SQL
    console.log('📝 Step 1/2: Inserting creators...\n');

    let creatorCount = 0;
    for (const [authorUrl, posts] of postsByAuthor) {
        const firstPost = posts[0];

        await prisma.$executeRawUnsafe(`
      INSERT INTO "TrendingCreator" (
        "id", "name", "username", "headline", "linkedinUrl", 
        "followerCount", "isFollowing", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        '${escapeString(firstPost.author_name)}',
        ${firstPost.author_username ? `'${escapeString(firstPost.author_username)}'` : 'NULL'},
        ${firstPost.author_headline ? `'${escapeString(firstPost.author_headline)}'` : 'NULL'},
        '${escapeString(authorUrl)}',
        0,
        false,
        NOW(),
        NOW()
      )
      ON CONFLICT ("linkedinUrl") DO NOTHING
    `);

        creatorCount++;
        if (creatorCount % 50 === 0) {
            console.log(`   Processed ${creatorCount}/${postsByAuthor.size} creators...`);
        }
    }

    console.log(`✅ Creators inserted: ${creatorCount}\n`);

    // Get creator ID map
    console.log('📝 Step 2/2: Inserting posts in batches...\n');

    const creators: any[] = await prisma.$queryRaw`
    SELECT "id", "linkedinUrl" FROM "TrendingCreator"
  `;

    const creatorIdMap = new Map<string, string>();
    creators.forEach((c: any) => {
        if (c.linkedinUrl) {
            creatorIdMap.set(c.linkedinUrl, c.id);
        }
    });

    // Insert posts in batches
    const BATCH_SIZE = 100;
    let totalInserted = 0;
    let batchNum = 0;

    const postsToInsert = records.filter(r => creatorIdMap.has(r.author_profile_url));

    for (let i = 0; i < postsToInsert.length; i += BATCH_SIZE) {
        batchNum++;
        const batch = postsToInsert.slice(i, i + BATCH_SIZE);

        const values = batch.map(post => {
            const creatorId = creatorIdMap.get(post.author_profile_url)!;
            const outlierIndex = Math.round((parseInt(post.engagement_score) / maxEngagement) * 100);
            const keywords = splitHashtags(post.hashtags);
            const keywordsArray = keywords.length > 0 ? `ARRAY['${keywords.join("','")}']` : 'ARRAY[]::text[]';

            return `(
        gen_random_uuid(),
        '${creatorId}',
        '${escapeString(post.content)}',
        ${post.post_id ? `'${post.post_id}'` : 'NULL'},
        ${post.post_url ? `'${escapeString(post.post_url)}'` : 'NULL'},
        ${post.post_type ? `'${post.post_type}'` : 'NULL'},
        '${mapMediaType(post.media_type)}',
        ${parseInt(post.likes) || 0},
        ${parseInt(post.comments) || 0},
        ${parseInt(post.reposts) || 0},
        0,
        ${outlierIndex},
        ${parseInt(post.word_count) || 'NULL'},
        ${parseBoolean(post.has_question)},
        ${parseBoolean(post.has_cta)},
        ${parseInt(post.posted_hour) || 'NULL'},
        ${post.posted_day_of_week ? `'${post.posted_day_of_week}'` : 'NULL'},
        '${post.posted_date_iso}',
        NOW(),
        NOW(),
        ${keywordsArray}
      )`;
        }).join(',\n');

        await prisma.$executeRawUnsafe(`
      INSERT INTO "TrendingPost" (
        "id", "creatorId", "content", "linkedInPostId", "postUrl", "postType",
        "mediaType", "likes", "comments", "reposts", "views", "outlierIndex",
        "wordCount", "hasQuestion", "hasCallToAction", "postedHour", 
        "postedDayOfWeek", "publishedDate", "createdAt", "updatedAt", "keywords"
      ) VALUES ${values}
      ON CONFLICT ("linkedInPostId") DO NOTHING
    `);

        totalInserted += batch.length;
        console.log(`✓ Batch ${batchNum}: Inserted ${batch.length} posts (Total: ${totalInserted}/${postsToInsert.length})`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ SQL import completed!\n');
    console.log('📊 STATISTICS:');
    console.log(`   Creators: ${creatorCount}`);
    console.log(`   Posts: ${totalInserted}`);
    console.log(`   Batches: ${batchNum}\n`);
}

importWithSQL()
    .then(() => {
        console.log('🎉 Import finished!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
