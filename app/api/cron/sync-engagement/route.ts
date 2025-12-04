/**
 * Sync LinkedIn Engagement Cron Job
 * Vercel Cron - Runs every hour
 * POST /api/cron/sync-engagement
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyCronSecret } from '@/lib/middleware/auth';
import { formatErrorResponse } from '@/lib/errors';
import { getPostAnalytics } from '@/lib/linkedin';
import { PostStatus } from '@prisma/client';
import logger from '@/lib/logger';

/**
 * POST /api/cron/sync-engagement - Sync engagement metrics
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    verifyCronSecret(req);

    // Find published posts from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const publishedPosts = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        publishedAt: {
          gte: thirtyDaysAgo,
        },
        linkedInPostId: {
          not: null,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            settings: {
              select: {
                autoSyncEngagement: true,
              },
            },
            accounts: {
              where: {
                provider: 'linkedin',
              },
              select: {
                access_token: true,
              },
            },
          },
        },
      },
      take: 100, // Process max 100 posts per run
    });

    const results = {
      total: publishedPosts.length,
      synced: 0,
      failed: 0,
      skipped: 0,
    };

    for (const post of publishedPosts) {
      try {
        // Skip if auto-sync disabled
        if (post.user.settings?.autoSyncEngagement === false) {
          results.skipped++;
          continue;
        }

        const linkedInAccount = post.user.accounts.find(
          (acc) => acc.provider === 'linkedin'
        );

        if (!linkedInAccount?.access_token || !post.linkedInPostId) {
          results.skipped++;
          continue;
        }

        // Get analytics from LinkedIn
        const analytics = await getPostAnalytics(
          linkedInAccount.access_token,
          post.linkedInPostId
        );

        // Update post metrics
        await prisma.post.update({
          where: { id: post.id },
          data: {
            likes: analytics.likes,
            comments: analytics.comments,
            shares: analytics.shares,
            views: analytics.views,
          },
        });

        // Update analytics record
        await prisma.analytics.upsert({
          where: {
            userId_postId_date: {
              userId: post.userId,
              postId: post.id,
              date: new Date(),
            },
          },
          create: {
            userId: post.userId,
            postId: post.id,
            eventType: 'POST_ENGAGEMENT',
            date: new Date(),
            likes: analytics.likes,
            comments: analytics.comments,
            shares: analytics.shares,
            views: analytics.views,
            engagementRate:
              analytics.views > 0
                ? ((analytics.likes + analytics.comments + analytics.shares) /
                    analytics.views) *
                  100
                : 0,
          },
          update: {
            likes: analytics.likes,
            comments: analytics.comments,
            shares: analytics.shares,
            views: analytics.views,
            engagementRate:
              analytics.views > 0
                ? ((analytics.likes + analytics.comments + analytics.shares) /
                    analytics.views) *
                  100
                : 0,
          },
        });

        results.synced++;
      } catch (error: any) {
        results.failed++;
        logger.error('Failed to sync engagement', error, {
          postId: post.id,
        });
      }
    }

    logger.info('Engagement sync cron completed', results);

    return NextResponse.json(results);
  } catch (error) {
    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode,
    });
  }
}

// Allow GET for Vercel cron
export async function GET(req: NextRequest) {
  return POST(req);
}
