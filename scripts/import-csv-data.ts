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

async function importCSVData() {
    console.log('🚀 Starting CSV import...\n');

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

    // Track statistics
    let creatorsCreated = 0;
    let creatorsUpdated = 0;
    let postsCreated = 0;
    let postsSkipped = 0;
    let errors = 0;

    // Group posts by author to optimize creator creation
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

    let processedAuthors = 0;

    // Process each author and their posts
    for (const [authorUrl, authorPosts] of postsByAuthor) {
        processedAuthors++;
        const firstPost = authorPosts[0];

        try {
            // Upsert creator
            const creator = await prisma.trendingCreator.upsert({
                where: { linkedinUrl: authorUrl },
                update: {
                    name: firstPost.author_name,
                    username: firstPost.author_username || null,
                    headline: firstPost.author_headline || null,
                    updatedAt: new Date(),
                },
                create: {
                    name: firstPost.author_name,
                    username: firstPost.author_username || null,
                    headline: firstPost.author_headline || null,
                    linkedinUrl: authorUrl,
                    followerCount: 0, // Not in CSV, default to 0
                    isFollowing: false,
                },
            });

            const isNewCreator = creator.createdAt.getTime() === creator.updatedAt.getTime();
            if (isNewCreator) {
                creatorsCreated++;
            } else {
                creatorsUpdated++;
            }

            // Import all posts for this creator
            for (const post of authorPosts) {
                try {
                    // Check if post already exists
                    const existingPost = await prisma.trendingPost.findUnique({
                        where: { linkedInPostId: post.post_id },
                    });

                    if (existingPost) {
                        postsSkipped++;
                        continue;
                    }

                    // Calculate outlier index (normalize engagement score to 1-100)
                    const outlierIndex = Math.round((parseInt(post.engagement_score) / maxEngagement) * 100);

                    // Create post
                    await prisma.trendingPost.create({
                        data: {
                            creatorId: creator.id,
                            content: post.content,
                            linkedInPostId: post.post_id,
                            postUrl: post.post_url,
                            postType: post.post_type || null,
                            mediaType: mapMediaType(post.media_type),
                            likes: parseInt(post.likes) || 0,
                            comments: parseInt(post.comments) || 0,
                            reposts: parseInt(post.reposts) || 0,
                            views: 0, // Not in CSV
                            outlierIndex: outlierIndex,
                            wordCount: parseInt(post.word_count) || null,
                            hasQuestion: parseBoolean(post.has_question),
                            hasCallToAction: parseBoolean(post.has_cta),
                            postedHour: parseInt(post.posted_hour) || null,
                            postedDayOfWeek: post.posted_day_of_week || null,
                            publishedDate: new Date(post.posted_date_iso),
                            keywords: splitHashtags(post.hashtags),
                        },
                    });

                    postsCreated++;
                } catch (postError) {
                    console.error(`❌ Error creating post ${post.post_id}:`, postError);
                    errors++;
                }
            }

            // Progress update every 10 authors
            if (processedAuthors % 10 === 0) {
                console.log(`⏳ Progress: ${processedAuthors}/${postsByAuthor.size} authors processed...`);
            }
        } catch (authorError) {
            console.error(`❌ Error processing author ${firstPost.author_name}:`, authorError);
            errors++;
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Import completed!\n');
    console.log('📊 STATISTICS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👥 Creators created:  ${creatorsCreated}`);
    console.log(`👥 Creators updated:  ${creatorsUpdated}`);
    console.log(`📝 Posts created:     ${postsCreated}`);
    console.log(`⏭️  Posts skipped:     ${postsSkipped}`);
    console.log(`❌ Errors:            ${errors}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run the import
importCSVData()
    .then(() => {
        console.log('🎉 Import process finished successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Fatal error during import:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
