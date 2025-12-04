/**
 * Posts API - List and Create
 * GET /api/posts - List user's posts
 * POST /api/posts - Create new post
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse, ValidationError } from '@/lib/errors';
import { checkRateLimit, aiRateLimiter } from '@/lib/ratelimit';
import { generatePost, generateEmbedding } from '@/lib/ai';
import { PostStatus, Tone, Intensity } from '@prisma/client';
import logger from '@/lib/logger';

/**
 * GET /api/posts - List posts
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get('status') as PostStatus | null;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = { userId: user.id };
    if (status) {
      where.status = status;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          content: true,
          topic: true,
          tone: true,
          intensity: true,
          status: true,
          scheduledFor: true,
          publishedAt: true,
          likes: true,
          comments: true,
          shares: true,
          views: true,
          mediaUrls: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      total,
      limit,
      offset,
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode,
    });
  }
}

const createPostSchema = z.object({
  // Either provide content directly or generate it
  content: z.string().optional(),

  // For AI generation
  topic: z.string().optional(),
  tone: z.nativeEnum(Tone).optional(),
  intensity: z.nativeEnum(Intensity).optional(),
  context: z.string().optional(),
  aiProvider: z.enum(['openai', 'anthropic']).optional(),

  // Scheduling
  scheduledFor: z.string().datetime().optional(),

  // Media
  mediaUrls: z.array(z.string().url()).optional(),
});

/**
 * POST /api/posts - Create post
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    // Validate input
    const data = createPostSchema.parse(body);

    let content = data.content;
    let aiModel: string | undefined;
    let aiProvider: string | undefined;
    let embedding: number[] | undefined;

    // Generate content if needed
    if (!content) {
      if (!data.topic) {
        throw new ValidationError('Either content or topic is required');
      }

      // Check rate limit for AI generation
      await checkRateLimit(`ai:${user.id}`, aiRateLimiter);

      const result = await generatePost({
        topic: data.topic,
        tone: data.tone || Tone.PROFESSIONAL,
        intensity: data.intensity || Intensity.MEDIUM,
        context: data.context,
        provider: data.aiProvider,
      });

      content = result.content;
      aiModel = result.model;
      aiProvider = result.provider;

      // Generate embedding for semantic search
      embedding = await generateEmbedding(content);
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content: content!,
        topic: data.topic,
        tone: data.tone || Tone.PROFESSIONAL,
        intensity: data.intensity || Intensity.MEDIUM,
        aiModel: aiModel,
        generatedFrom: data.context,
        embeddingModel: embedding ? 'text-embedding-3-small' : undefined,
        embedding: embedding ? `[${embedding.join(',')}]` : undefined,
        status: data.scheduledFor ? PostStatus.SCHEDULED : PostStatus.DRAFT,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        mediaUrls: data.mediaUrls || [],
      },
    });

    // Log analytics
    await prisma.analytics.create({
      data: {
        userId: user.id,
        postId: post.id,
        eventType: 'POST_CREATED',
        date: new Date(),
      },
    });

    logger.info('Post created', { postId: post.id, userId: user.id });

    return NextResponse.json(post, { status: 201 });
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
