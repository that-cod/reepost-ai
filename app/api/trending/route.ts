/**
 * Trending Feed API
 * GET /api/trending - Get trending posts
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse } from '@/lib/errors';
import { PostStatus } from '@prisma/client';

/**
 * Calculate trending score based on engagement and recency
 */
function calculateTrendingScore(post: {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  publishedAt: Date | null;
}): number {
  if (!post.publishedAt) return 0;

  const now = new Date();
  const hoursSincePublished =
    (now.getTime() - post.publishedAt.getTime()) / (1000 * 60 * 60);

  // Decay factor - posts lose relevance over time
  const decayFactor = Math.exp(-hoursSincePublished / 48); // 48 hour half-life

  // Engagement score
  const engagementScore =
    post.likes * 1 + post.comments * 3 + post.shares * 5 + post.views * 0.1;

  return engagementScore * decayFactor;
}

/**
 * GET /api/trending - Get trending posts
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const timeframe = searchParams.get('timeframe') || '7d'; // 24h, 7d, 30d

    // Calculate date threshold
    const now = new Date();
    let dateThreshold = new Date();

    if (timeframe === '24h') {
      dateThreshold.setHours(now.getHours() - 24);
    } else if (timeframe === '7d') {
      dateThreshold.setDate(now.getDate() - 7);
    } else if (timeframe === '30d') {
      dateThreshold.setDate(now.getDate() - 30);
    }

    // Get published posts within timeframe
    const posts = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        publishedAt: {
          gte: dateThreshold,
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit * 2, // Get more to account for filtering
      select: {
        id: true,
        content: true,
        topic: true,
        tone: true,
        intensity: true,
        publishedAt: true,
        likes: true,
        comments: true,
        shares: true,
        views: true,
        mediaUrls: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Calculate trending scores and sort
    const postsWithScores = posts
      .map((post) => ({
        ...post,
        trendingScore: calculateTrendingScore(post),
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(offset, offset + limit);

    return NextResponse.json({
      posts: postsWithScores,
      total: postsWithScores.length,
      limit,
      offset,
      timeframe,
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode,
    });
  }
}
