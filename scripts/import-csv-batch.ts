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

async function importCSVDataBatch() {
    console.log('🚀 Starting BATCH CSV import...\n');

    // Read CSV file
    const csvContent = fs.readFileSync('./ALL_CLEANED_MERGED.csv', 'utf-8');

    // Parse CSV
    const records: CSVRow[] = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });

    console.log(`📊 Total records to import: ${records.length}\n`);

    // Calculate max engagement score for normalization
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

    // STEP 1: Batch create all creators
    console.log('📝 Step 1/2: Creating creators...\n');

    const creatorData = Array.from(postsByAuthor.entries()).map(([authorUrl, posts]) => {
        const firstPost = posts[0];
        return {
            name: firstPost.author_name,
            username: firstPost.author_username || null,
            headline: firstPost.author_headline || null,
            linkedinUrl: authorUrl,
            followerCount: 0,
            isFollowing: false,
        };
    });

    // Use createMany with skipDuplicates to avoid conflicts
    const creatorResult = await prisma.trendingCreator.createMany({
        data: creatorData,
        skipDuplicates: true,
    });

    console.log(`✅ Created ${creatorResult.count} new creators\n`);

    // STEP 2: Fetch all creators to get their IDs
    console.log('📝 Step 2/2: Preparing posts for batch insert...\n');

    const allCreators = await prisma.trendingCreator.findMany({
        select: {
            id: true,
            linkedinUrl: true,
        }
    });

    // Create a map of linkedinUrl -> id
    const creatorIdMap = new Map<string, string>();
    allCreators.forEach(creator => {
        if (creator.linkedinUrl) {
            creatorIdMap.set(creator.linkedinUrl, creator.id);
        }
    });

    // STEP 3: Batch create posts in chunks
    console.log('📝 Creating posts in batches...\n');

    const BATCH_SIZE = 500; // Insert 500 posts at a time
    let totalCreated = 0;
    let batchNumber = 0;

    // Prepare all post data
    const allPostData = records
        .filter(record => creatorIdMap.has(record.author_profile_url))
        .map(post => {
            const creatorId = creatorIdMap.get(post.author_profile_url)!;
            const outlierIndex = Math.round((parseInt(post.engagement_score) / maxEngagement) * 100);

            return {
                creatorId,
                content: post.content,
                linkedInPostId: post.post_id,
                postUrl: post.post_url,
                postType: post.post_type || null,
                mediaType: mapMediaType(post.media_type),
                likes: parseInt(post.likes) || 0,
                comments: parseInt(post.comments) || 0,
                reposts: parseInt(post.reposts) || 0,
                views: 0,
                outlierIndex,
                wordCount: parseInt(post.word_count) || null,
                hasQuestion: parseBoolean(post.has_question),
                hasCallToAction: parseBoolean(post.has_cta),
                postedHour: parseInt(post.posted_hour) || null,
                postedDayOfWeek: post.posted_day_of_week || null,
                publishedDate: new Date(post.posted_date_iso),
                keywords: splitHashtags(post.hashtags),
            };
        });

    // Insert in batches
    for (let i = 0; i < allPostData.length; i += BATCH_SIZE) {
        batchNumber++;
        const batch = allPostData.slice(i, i + BATCH_SIZE);

        try {
            const result = await prisma.trendingPost.createMany({
                data: batch,
                skipDuplicates: true,
            });

            totalCreated += result.count;
            console.log(`✓ Batch ${batchNumber}: Created ${result.count} posts (Total: ${totalCreated}/${allPostData.length})`);
        } catch (error) {
            console.error(`❌ Error in batch ${batchNumber}:`, error);
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Batch import completed!\n');
    console.log('📊 FINAL STATISTICS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👥 Creators created:  ${creatorResult.count}`);
    console.log(`📝 Posts created:     ${totalCreated}`);
    console.log(`📦 Batches processed: ${batchNumber}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verify final counts
    const finalCreatorCount = await prisma.trendingCreator.count();
    const finalPostCount = await prisma.trendingPost.count();

    console.log('📊 Database verification:');
    console.log(`   Total creators in DB: ${finalCreatorCount}`);
    console.log(`   Total posts in DB:    ${finalPostCount}\n`);
}

// Run the batch import
importCSVDataBatch()
    .then(() => {
        console.log('🎉 Batch import process finished successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Fatal error during batch import:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
