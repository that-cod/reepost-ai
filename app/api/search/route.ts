/**
 * Semantic Search API using pgvector
 * POST /api/search - Search posts by semantic similarity
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse } from '@/lib/errors';
import { generateEmbedding } from '@/lib/ai';

const searchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  limit: z.number().min(1).max(50).default(10),
  threshold: z.number().min(0).max(1).default(0.7), // Cosine similarity threshold
});

/**
 * POST /api/search - Semantic search
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = searchSchema.parse(body);

    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(data.query);

    // Perform vector similarity search using pgvector
    // Using cosine similarity: 1 - (a <=> b)
    const results = await prisma.$queryRaw<
      Array<{
        id: string;
        content: string;
        topic: string | null;
        tone: string;
        intensity: string;
        status: string;
        publishedAt: Date | null;
        likes: number;
        comments: number;
        shares: number;
        views: number;
        mediaUrls: string[];
        createdAt: Date;
        similarity: number;
      }>
    >`
      SELECT
        id,
        content,
        topic,
        tone,
        intensity,
        status,
        "publishedAt",
        likes,
        comments,
        shares,
        views,
        "mediaUrls",
        "createdAt",
        1 - (embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector) as similarity
      FROM "Post"
      WHERE
        "userId" = ${user.id}
        AND embedding IS NOT NULL
        AND 1 - (embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector) > ${data.threshold}
      ORDER BY similarity DESC
      LIMIT ${data.limit}
    `;

    return NextResponse.json({
      query: data.query,
      results,
      total: results.length,
    });
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
