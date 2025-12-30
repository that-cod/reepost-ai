/**
 * Saved Posts API
 * GET /api/saved - List saved posts
 * POST /api/saved - Save a post
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse } from '@/lib/errors';

/**
 * GET /api/saved - List saved posts
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [savedPosts, total] = await Promise.all([
      prisma.savedPost.findMany({
        where: { userId: user.id },
        orderBy: { savedAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          Post: {
            select: {
              id: true,
              content: true,
              topic: true,
              tone: true,
              intensity: true,
              status: true,
              publishedAt: true,
              likes: true,
              comments: true,
              shares: true,
              views: true,
              mediaUrls: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.savedPost.count({
        where: { userId: user.id },
      }),
    ]);

    // Transform the data to match frontend expectations (lowercase 'post')
    const transformedPosts = savedPosts.map(sp => ({
      ...sp,
      post: sp.Post, // Rename Post to post
      Post: undefined, // Remove the uppercase version
    }));

    return NextResponse.json({
      savedPosts: transformedPosts,
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

const savePostSchema = z.object({
  postId: z.string(),
});

/**
 * POST /api/saved - Save a post
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = savePostSchema.parse(body);

    // Check if already saved
    const existing = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: data.postId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    // Save post
    const savedPost = await prisma.savedPost.create({
      data: {
        userId: user.id,
        postId: data.postId,
      },
      include: {
        Post: true,
      },
    });

    // Transform to match frontend expectations
    const transformedPost = {
      ...savedPost,
      post: savedPost.Post,
      Post: undefined,
    };

    return NextResponse.json(transformedPost, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            message: error.issues[0].message,
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
