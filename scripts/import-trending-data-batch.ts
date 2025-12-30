/**
 * Import Script: Trending Posts & Creators Data (Optimized Batch Version)
 *
 * This script imports data from ALL_CLEANED_MERGED.csv into the database
 * Uses batch operations for better performance
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
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

function mapMediaType(mediaType: string): 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'NONE' {
  const normalized = mediaType?.toLowerCase() || 'none';
  if (normalized === 'image') return 'IMAGE';
  if (normalized === 'video') return 'VIDEO';
  if (normalized === 'document') return 'DOCUMENT';
  return 'NONE';
}

function parseBoolean(value: string): boolean {
  return value?.toLowerCase() === 'true';
}

function calculateOutlierIndex(likes: number, comments: number, reposts: number): number {
  const score = (likes * 1) + (comments * 3) + (reposts * 5);
  const normalized = Math.min(100, Math.round((Math.log10(score + 1) / Math.log10(10000)) * 100));
  return Math.max(0, normalized);
}

function extractKeywords(content: string, hashtags: string): string[] {
  const keywords: string[] = [];

  if (hashtags) {
    const hashtagArray = hashtags.split(',').map(tag => tag.trim()).filter(Boolean);
    keywords.push(...hashtagArray);
  }

  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);

  const words = content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4 && !commonWords.has(word));

  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  const topWords = Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  keywords.push(...topWords);
  return Array.from(new Set(keywords)).slice(0, 10);
}

async function importData() {
  try {
    console.log('🚀 Starting optimized batch import...\n');

    const csvPath = path.join(process.cwd(), 'ALL_CLEANED_MERGED.csv');
    console.log(`📂 Reading CSV file: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at ${csvPath}`);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as CSVRow[];

    console.log(`✅ Parsed ${records.length} rows from CSV\n`);

    // Step 1: Extract unique creators
    console.log('📊 Step 1: Processing creators...');
    const uniqueCreators = new Map<string, {
      name: string;
      username: string | null;
      headline: string | null;
      linkedinUrl: string | null;
    }>();

    records.forEach(row => {
      if (row.author_profile_url && !uniqueCreators.has(row.author_profile_url)) {
        uniqueCreators.set(row.author_profile_url, {
          name: row.author_name,
          username: row.author_username || null,
          headline: row.author_headline || null,
          linkedinUrl: row.author_profile_url || null,
        });
      }
    });

    console.log(`   Found ${uniqueCreators.size} unique creators`);

    // Step 2: Batch insert creators (with skip duplicates)
    console.log('   Inserting creators into database...');
    const creatorData = Array.from(uniqueCreators.values()).map(creator => ({
      name: creator.name,
      username: creator.username,
      headline: creator.headline,
      linkedinUrl: creator.linkedinUrl,
      followerCount: 0,
      isFollowing: false,
    }));

    // Insert creators in batches
    const CREATOR_BATCH_SIZE = 100;
    let creatorsInserted = 0;

    for (let i = 0; i < creatorData.length; i += CREATOR_BATCH_SIZE) {
      const batch = creatorData.slice(i, i + CREATOR_BATCH_SIZE);

      for (const creator of batch) {
        try {
          await prisma.trendingCreator.upsert({
            where: { linkedinUrl: creator.linkedinUrl || '' },
            update: {},
            create: creator,
          });
          creatorsInserted++;
        } catch (error) {
          // Skip duplicates
        }
      }

      console.log(`   Progress: ${Math.min(i + CREATOR_BATCH_SIZE, creatorData.length)}/${creatorData.length} creators`);
    }

    console.log(`✅ Inserted ${creatorsInserted} creators\n`);

    // Step 3: Fetch all creators to build ID map
    console.log('📊 Step 2: Building creator ID map...');
    const allCreators = await prisma.trendingCreator.findMany({
      select: {
        id: true,
        linkedinUrl: true,
      },
    });

    const creatorIdMap = new Map<string, string>();
    allCreators.forEach(creator => {
      if (creator.linkedinUrl) {
        creatorIdMap.set(creator.linkedinUrl, creator.id);
      }
    });

    console.log(`   Mapped ${creatorIdMap.size} creators\n`);

    // Step 4: Prepare posts data
    console.log('📊 Step 3: Processing posts...');
    const postsToInsert = [];

    for (const row of records) {
      if (!row.post_id || !row.content || !row.author_name) {
        continue;
      }

      const creatorId = creatorIdMap.get(row.author_profile_url);
      if (!creatorId) {
        continue;
      }

      const likes = parseInt(row.likes) || 0;
      const comments = parseInt(row.comments) || 0;
      const reposts = parseInt(row.reposts) || 0;
      const outlierIndex = calculateOutlierIndex(likes, comments, reposts);
      const keywords = extractKeywords(row.content, row.hashtags);

      let publishedDate = new Date();
      if (row.posted_date_iso) {
        try {
          publishedDate = new Date(row.posted_date_iso);
        } catch (e) {
          // Use current date
        }
      }

      postsToInsert.push({
        creatorId,
        content: row.content,
        linkedInPostId: row.post_id,
        postUrl: row.post_url || null,
        postType: row.post_type || null,
        mediaType: mapMediaType(row.media_type),
        likes,
        comments,
        reposts,
        views: 0,
        outlierIndex,
        wordCount: parseInt(row.word_count) || null,
        hasQuestion: parseBoolean(row.has_question),
        hasCallToAction: parseBoolean(row.has_cta),
        postedHour: parseInt(row.posted_hour) || null,
        postedDayOfWeek: row.posted_day_of_week || null,
        publishedDate,
        keywords,
      });
    }

    console.log(`   Prepared ${postsToInsert.length} posts for insertion\n`);

    // Step 5: Batch insert posts
    console.log('📊 Step 4: Inserting posts into database...');
    const POST_BATCH_SIZE = 50;
    let postsInserted = 0;
    let postsSkipped = 0;

    for (let i = 0; i < postsToInsert.length; i += POST_BATCH_SIZE) {
      const batch = postsToInsert.slice(i, i + POST_BATCH_SIZE);

      for (const post of batch) {
        try {
          await prisma.trendingPost.create({
            data: post,
          });
          postsInserted++;
        } catch (error) {
          // Skip duplicates or errors
          postsSkipped++;
        }
      }

      console.log(`   Progress: ${Math.min(i + POST_BATCH_SIZE, postsToInsert.length)}/${postsToInsert.length} posts`);
    }

    console.log('\n✅ Import completed!\n');
    console.log('📊 Final Statistics:');
    console.log(`   • Creators inserted: ${creatorsInserted}`);
    console.log(`   • Posts inserted: ${postsInserted}`);
    console.log(`   • Posts skipped: ${postsSkipped}`);
    console.log(`   • Total records processed: ${records.length}\n`);

  } catch (error) {
    console.error('❌ Fatal error during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importData()
  .then(() => {
    console.log('🎉 Import script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import script failed:', error);
    process.exit(1);
  });
