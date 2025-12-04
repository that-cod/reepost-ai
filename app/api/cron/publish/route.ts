/**
 * Auto-Publish Cron Job
 * Vercel Cron - Runs every 5 minutes
 * POST /api/cron/publish
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyCronSecret } from '@/lib/middleware/auth';
import { formatErrorResponse } from '@/lib/errors';
import { publishToLinkedIn } from '@/lib/linkedin';
import { PostStatus } from '@prisma/client';
import logger from '@/lib/logger';

/**
 * POST /api/cron/publish - Auto-publish scheduled posts
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    verifyCronSecret(req);

    const now = new Date();

    // Find posts scheduled for publishing
    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: PostStatus.SCHEDULED,
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            linkedInUrn: true,
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
      take: 50, // Process max 50 posts per run
    });

    const results = {
      total: scheduledPosts.length,
      published: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const post of scheduledPosts) {
      try {
        // Check if user has LinkedIn connection
        const linkedInAccount = post.user.accounts.find(
          (acc) => acc.provider === 'linkedin'
        );

        if (!linkedInAccount?.access_token || !post.user.linkedInUrn) {
          throw new Error('LinkedIn connection required');
        }

        // Publish to LinkedIn
        const linkedInPostId = await publishToLinkedIn({
          accessToken: linkedInAccount.access_token,
          personUrn: post.user.linkedInUrn,
          content: post.content,
          mediaUrls: post.mediaUrls,
        });

        // Update post status
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: PostStatus.PUBLISHED,
            publishedAt: new Date(),
            linkedInPostId,
          },
        });

        // Log analytics
        await prisma.analytics.create({
          data: {
            userId: post.userId,
            postId: post.id,
            eventType: 'POST_PUBLISHED',
            date: new Date(),
          },
        });

        results.published++;

        logger.info('Auto-published post', {
          postId: post.id,
          userId: post.userId,
          linkedInPostId,
        });
      } catch (error: any) {
        // Mark as failed
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: PostStatus.FAILED,
          },
        });

        results.failed++;
        results.errors.push({
          postId: post.id,
          error: error.message,
        });

        logger.error('Failed to auto-publish post', error, {
          postId: post.id,
          userId: post.userId,
        });
      }
    }

    logger.info('Auto-publish cron completed', results);

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
