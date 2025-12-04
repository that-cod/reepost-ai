import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Stats response type
 */
interface ViralStats {
  totalPosts: number;
  postsByCategory: Record<string, number>;
  postsByTone: Record<string, number>;
  postsByHookStyle: Record<string, number>;
  avgViralScore: number;
  topPosts: Array<{
    id: string;
    preview: string;
    category: string;
    tone: string;
    viralScore: number;
  }>;
  recentUploads: Array<{
    date: string;
    count: number;
  }>;
}

/**
 * GET /api/viral/stats
 * Get statistics about viral posts in the database
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching viral post statistics...');

    // Total posts count
    const totalResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM viral_posts
    `;
    const totalPosts = Number(totalResult[0].count);

    // Posts by category
    const categoryResults = await prisma.$queryRaw<Array<{ category: string; count: bigint }>>`
      SELECT category, COUNT(*) as count
      FROM viral_posts
      GROUP BY category
      ORDER BY count DESC
    `;
    const postsByCategory: Record<string, number> = {};
    categoryResults.forEach(row => {
      postsByCategory[row.category] = Number(row.count);
    });

    // Posts by tone
    const toneResults = await prisma.$queryRaw<Array<{ tone: string; count: bigint }>>`
      SELECT tone, COUNT(*) as count
      FROM viral_posts
      GROUP BY tone
      ORDER BY count DESC
    `;
    const postsByTone: Record<string, number> = {};
    toneResults.forEach(row => {
      postsByTone[row.tone] = Number(row.count);
    });

    // Posts by hook style
    const hookResults = await prisma.$queryRaw<Array<{ hook_style: string; count: bigint }>>`
      SELECT hook_style, COUNT(*) as count
      FROM viral_posts
      GROUP BY hook_style
      ORDER BY count DESC
    `;
    const postsByHookStyle: Record<string, number> = {};
    hookResults.forEach(row => {
      postsByHookStyle[row.hook_style] = Number(row.count);
    });

    // Average viral score
    const avgResult = await prisma.$queryRaw<Array<{ avg: number | null }>>`
      SELECT AVG(viral_score) as avg
      FROM viral_posts
    `;
    const avgViralScore = avgResult[0].avg ? Number(avgResult[0].avg.toFixed(2)) : 0;

    // Top performing posts
    const topPostsResults = await prisma.$queryRaw<Array<{
      id: string;
      text: string;
      category: string;
      tone: string;
      viral_score: number;
    }>>`
      SELECT
        id::text,
        text,
        category,
        tone,
        viral_score
      FROM viral_posts
      ORDER BY viral_score DESC
      LIMIT 10
    `;
    const topPosts = topPostsResults.map(post => ({
      id: post.id,
      preview: post.text.substring(0, 100) + (post.text.length > 100 ? '...' : ''),
      category: post.category,
      tone: post.tone,
      viralScore: post.viral_score,
    }));

    // Recent uploads (last 7 days)
    const recentResults = await prisma.$queryRaw<Array<{
      upload_date: Date;
      count: bigint;
    }>>`
      SELECT
        DATE(created_at) as upload_date,
        COUNT(*) as count
      FROM viral_posts
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY upload_date DESC
    `;
    const recentUploads = recentResults.map(row => ({
      date: row.upload_date.toISOString().split('T')[0],
      count: Number(row.count),
    }));

    const stats: ViralStats = {
      totalPosts,
      postsByCategory,
      postsByTone,
      postsByHookStyle,
      avgViralScore,
      topPosts,
      recentUploads,
    };

    console.log(`Stats retrieved: ${totalPosts} total posts`);

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('Error fetching viral post stats:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
