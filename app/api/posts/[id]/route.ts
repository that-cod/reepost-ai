/**
 * Posts API - Individual Post Operations
 * GET /api/posts/[id] - Get post
 * PATCH /api/posts/[id] - Update post
 * DELETE /api/posts/[id] - Delete post
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse, NotFoundError, AuthorizationError } from '@/lib/errors';
import { PostStatus, Tone, Intensity } from '@prisma/client';
import { generateEmbedding } from '@/lib/ai';
import logger from '@/lib/logger';

/**
 * GET /api/posts/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    if (post.userId !== user.id) {
      throw new AuthorizationError();
    }

    return NextResponse.json(post);
  } catch (error) {
    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode,
    });
  }
}

const updatePostSchema = z.object({
  content: z.string().optional(),
  tone: z.nativeEnum(Tone).optional(),
  intensity: z.nativeEnum(Intensity).optional(),
  status: z.nativeEnum(PostStatus).optional(),
  scheduledFor: z.string().datetime().optional().nullable(),
  mediaUrls: z.array(z.string().url()).optional(),
});

/**
 * PATCH /api/posts/[id]
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    // Validate input
    const data = updatePostSchema.parse(body);

    // Check ownership
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!existingPost) {
      throw new NotFoundError('Post');
    }

    if (existingPost.userId !== user.id) {
      throw new AuthorizationError();
    }

    // Update embedding if content changed
    let embedding: number[] | undefined;
    if (data.content && data.content !== existingPost.content) {
      embedding = await generateEmbedding(data.content);
    }

    // Update post
    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...data,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
        embedding: embedding ? `[${embedding.join(',')}]` : undefined,
        embeddingModel: embedding ? 'text-embedding-3-small' : undefined,
      },
    });

    logger.info('Post updated', { postId: post.id, userId: user.id });

    return NextResponse.json(post);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            message: error.errors[0].message,
            code: 'VALIDATION_ERROR',
            statusCode: 400,
          },
        },
        { status: 400 }
      );
    }

    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode,
    });
  }
}

/**
 * DELETE /api/posts/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    // Check ownership
    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    if (post.userId !== user.id) {
      throw new AuthorizationError();
    }

    // Delete post
    await prisma.post.delete({
      where: { id: params.id },
    });

    logger.info('Post deleted', { postId: params.id, userId: user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode,
    });
  }
}
