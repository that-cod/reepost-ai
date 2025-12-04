/**
 * Saved Post API - Individual Operations
 * DELETE /api/saved/[id] - Unsave a post
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse, NotFoundError, AuthorizationError } from '@/lib/errors';

/**
 * DELETE /api/saved/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const savedPost = await prisma.savedPost.findUnique({
      where: { id: params.id },
    });

    if (!savedPost) {
      throw new NotFoundError('Saved post');
    }

    if (savedPost.userId !== user.id) {
      throw new AuthorizationError();
    }

    await prisma.savedPost.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode,
    });
  }
}
