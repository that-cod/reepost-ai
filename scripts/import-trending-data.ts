/**
 * Import Script: Trending Posts & Creators Data
 *
 * This script imports data from ALL_CLEANED_MERGED.csv into the database
 * Creates TrendingCreator and TrendingPost records
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

// Map media types from CSV to database enum
function mapMediaType(mediaType: string): 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'NONE' {
  const normalized = mediaType?.toLowerCase() || 'none';
  if (normalized === 'image') return 'IMAGE';
  if (normalized === 'video') return 'VIDEO';
  if (normalized === 'document') return 'DOCUMENT';
  return 'NONE';
}

// Parse boolean values
function parseBoolean(value: string): boolean {
  return value?.toLowerCase() === 'true';
}

// Calculate outlier index (virality score) based on engagement
function calculateOutlierIndex(likes: number, comments: number, reposts: number): number {
  // Simple formula: normalize engagement to 0-100 scale
  // Higher weights for comments and reposts as they indicate stronger engagement
  const score = (likes * 1) + (comments * 3) + (reposts * 5);

  // Normalize to 0-100 scale (using logarithmic scale for better distribution)
  const normalized = Math.min(100, Math.round((Math.log10(score + 1) / Math.log10(10000)) * 100));

  return Math.max(0, normalized);
}

// Extract keywords from content
function extractKeywords(content: string, hashtags: string): string[] {
  const keywords: string[] = [];

  // Add hashtags if present
  if (hashtags) {
    const hashtagArray = hashtags.split(',').map(tag => tag.trim()).filter(Boolean);
    keywords.push(...hashtagArray);
  }

  // Extract keywords from content (simple approach)
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);

  const words = content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4 && !commonWords.has(word));

  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  // Get top 5 most frequent words
  const topWords = Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  keywords.push(...topWords);

  // Return unique keywords, max 10
  return Array.from(new Set(keywords)).slice(0, 10);
}

async function importData() {
  try {
    console.log('🚀 Starting data import...\n');

    // Read CSV file
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

    // Track statistics
    let creatorsCreated = 0;
    let creatorsUpdated = 0;
    let postsCreated = 0;
    let postsSkipped = 0;
    let errors = 0;

    // Create a map to track unique creators
    const creatorMap = new Map<string, string>(); // profileUrl -> creatorId

    console.log('📝 Processing records...\n');

    for (let i = 0; i < records.length; i++) {
      const row = records[i];

      try {
        // Progress indicator
        if ((i + 1) % 100 === 0) {
          console.log(`Progress: ${i + 1}/${records.length} (${Math.round(((i + 1) / records.length) * 100)}%)`);
        }

        // Skip if essential data is missing
        if (!row.post_id || !row.content || !row.author_name) {
          postsSkipped++;
          continue;
        }

        // Get or create creator
        let creatorId: string;

        if (creatorMap.has(row.author_profile_url)) {
          creatorId = creatorMap.get(row.author_profile_url)!;
        } else {
          // Try to find existing creator
          let creator = await prisma.trendingCreator.findUnique({
            where: { linkedinUrl: row.author_profile_url || undefined },
          });

          if (creator) {
            creatorId = creator.id;
            creatorsUpdated++;
          } else {
            // Create new creator
            creator = await prisma.trendingCreator.create({
              data: {
                name: row.author_name,
                username: row.author_username || null,
                headline: row.author_headline || null,
                linkedinUrl: row.author_profile_url || null,
                followerCount: 0, // Not in CSV, default to 0
                isFollowing: false,
              },
            });
            creatorId = creator.id;
            creatorsCreated++;
          }

          creatorMap.set(row.author_profile_url, creatorId);
        }

        // Parse engagement metrics
        const likes = parseInt(row.likes) || 0;
        const comments = parseInt(row.comments) || 0;
        const reposts = parseInt(row.reposts) || 0;
        const views = 0; // Not in CSV
        const wordCount = parseInt(row.word_count) || null;
        const postedHour = parseInt(row.posted_hour) || null;

        // Calculate outlier index
        const outlierIndex = calculateOutlierIndex(likes, comments, reposts);

        // Extract keywords
        const keywords = extractKeywords(row.content, row.hashtags);

        // Parse date
        let publishedDate = new Date();
        if (row.posted_date_iso) {
          try {
            publishedDate = new Date(row.posted_date_iso);
          } catch (e) {
            // Use current date if parsing fails
          }
        }

        // Check if post already exists
        const existingPost = await prisma.trendingPost.findUnique({
          where: { linkedInPostId: row.post_id },
        });

        if (existingPost) {
          postsSkipped++;
          continue;
        }

        // Create trending post
        await prisma.trendingPost.create({
          data: {
            creatorId,
            content: row.content,
            linkedInPostId: row.post_id,
            postUrl: row.post_url || null,
            postType: row.post_type || null,
            mediaType: mapMediaType(row.media_type),
            likes,
            comments,
            reposts,
            views,
            outlierIndex,
            wordCount,
            hasQuestion: parseBoolean(row.has_question),
            hasCallToAction: parseBoolean(row.has_cta),
            postedHour,
            postedDayOfWeek: row.posted_day_of_week || null,
            publishedDate,
            keywords,
          },
        });

        postsCreated++;

      } catch (error) {
        errors++;
        console.error(`Error processing row ${i + 1}:`, error);
        // Continue with next row
      }
    }

    console.log('\n✅ Import completed!\n');
    console.log('📊 Statistics:');
    console.log(`   • Creators created: ${creatorsCreated}`);
    console.log(`   • Creators updated: ${creatorsUpdated}`);
    console.log(`   • Posts created: ${postsCreated}`);
    console.log(`   • Posts skipped: ${postsSkipped}`);
    console.log(`   • Errors: ${errors}`);
    console.log(`   • Total processed: ${records.length}\n`);

  } catch (error) {
    console.error('❌ Fatal error during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importData()
  .then(() => {
    console.log('🎉 Import script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import script failed:', error);
    process.exit(1);
  });
