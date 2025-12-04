/**
 * Publish Post to LinkedIn
 * POST /api/posts/[id]/publish
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, getLinkedInToken } from '@/lib/middleware/auth';
import { formatErrorResponse, NotFoundError, AuthorizationError } from '@/lib/errors';
import { publishToLinkedIn } from '@/lib/linkedin';
import { PostStatus } from '@prisma/client';
import logger from '@/lib/logger';
import { checkRateLimit, publishRateLimiter } from '@/lib/ratelimit';

/**
 * POST /api/posts/[id]/publish
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    // Check rate limit
    await checkRateLimit(`publish:${user.id}`, publishRateLimiter);

    // Get post
    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    if (post.userId !== user.id) {
      throw new AuthorizationError();
    }

    // Get LinkedIn token and user URN
    const linkedInToken = await getLinkedInToken();
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { linkedInUrn: true },
    });

    if (!dbUser?.linkedInUrn) {
      throw new Error('LinkedIn connection required');
    }

    // Publish to LinkedIn
    const linkedInPostId = await publishToLinkedIn({
      accessToken: linkedInToken,
      personUrn: dbUser.linkedInUrn,
      content: post.content,
      mediaUrls: post.mediaUrls,
    });

    // Update post status
    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
        linkedInPostId,
      },
    });

    // Log analytics
    await prisma.analytics.create({
      data: {
        userId: user.id,
        postId: post.id,
        eventType: 'POST_PUBLISHED',
        date: new Date(),
      },
    });

    logger.info('Post published to LinkedIn', {
      postId: post.id,
      linkedInPostId,
      userId: user.id,
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    // Update post status to failed
    try {
      await prisma.post.update({
        where: { id: params.id },
        data: { status: PostStatus.FAILED },
      });
    } catch (updateError) {
      // Ignore update error
    }

    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode,
    });
  }
}
