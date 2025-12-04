/**
 * Analytics API
 * GET /api/analytics - Get analytics data
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse } from '@/lib/errors';
import { startOfDay, subDays, format } from 'date-fns';

/**
 * GET /api/analytics - Get analytics
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const days = parseInt(searchParams.get('days') || '30');
    const postId = searchParams.get('postId');

    const startDate = startOfDay(subDays(new Date(), days));

    // Build where clause
    const where: any = {
      userId: user.id,
      date: {
        gte: startDate,
      },
    };

    if (postId) {
      where.postId = postId;
    }

    // Get analytics data
    const [analytics, posts, totalEngagement] = await Promise.all([
      // Daily aggregated analytics
      prisma.analytics.groupBy({
        by: ['date'],
        where,
        _sum: {
          likes: true,
          comments: true,
          shares: true,
          views: true,
          clicks: true,
        },
        orderBy: {
          date: 'asc',
        },
      }),

      // Post performance
      prisma.post.findMany({
        where: {
          userId: user.id,
          publishedAt: {
            gte: startDate,
          },
        },
        select: {
          id: true,
          content: true,
          topic: true,
          publishedAt: true,
          likes: true,
          comments: true,
          shares: true,
          views: true,
        },
        orderBy: {
          publishedAt: 'desc',
        },
      }),

      // Total engagement
      prisma.post.aggregate({
        where: {
          userId: user.id,
          publishedAt: {
            gte: startDate,
          },
        },
        _sum: {
          likes: true,
          comments: true,
          shares: true,
          views: true,
        },
        _count: true,
      }),
    ]);

    // Calculate engagement rate
    const totalViews = totalEngagement._sum.views || 0;
    const totalInteractions =
      (totalEngagement._sum.likes || 0) +
      (totalEngagement._sum.comments || 0) +
      (totalEngagement._sum.shares || 0);

    const engagementRate = totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0;

    // Format timeline data
    const timeline = analytics.map((item) => ({
      date: format(item.date, 'yyyy-MM-dd'),
      likes: item._sum.likes || 0,
      comments: item._sum.comments || 0,
      shares: item._sum.shares || 0,
      views: item._sum.views || 0,
      clicks: item._sum.clicks || 0,
    }));

    // Calculate top performing posts
    const topPosts = posts
      .map((post) => ({
        ...post,
        totalEngagement: post.likes + post.comments + post.shares,
        engagementRate:
          post.views > 0
            ? ((post.likes + post.comments + post.shares) / post.views) * 100
            : 0,
      }))
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 10);

    return NextResponse.json({
      summary: {
        totalPosts: totalEngagement._count,
        totalLikes: totalEngagement._sum.likes || 0,
        totalComments: totalEngagement._sum.comments || 0,
        totalShares: totalEngagement._sum.shares || 0,
        totalViews: totalEngagement._sum.views || 0,
        engagementRate: parseFloat(engagementRate.toFixed(2)),
      },
      timeline,
      topPosts,
      period: {
        days,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
      },
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode,
    });
  }
}
