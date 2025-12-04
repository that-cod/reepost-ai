/**
 * Generate Post Content
 * POST /api/posts/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse, ValidationError } from '@/lib/errors';
import { checkRateLimit, aiRateLimiter } from '@/lib/ratelimit';
import { generatePost } from '@/lib/ai';
import { extractTextFromFile, extractTextFromUrl } from '@/lib/extractors';
import { Tone, Intensity } from '@prisma/client';

const generateSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  tone: z.nativeEnum(Tone).default(Tone.PROFESSIONAL),
  intensity: z.nativeEnum(Intensity).default(Intensity.MEDIUM),
  context: z.string().optional(),
  aiProvider: z.enum(['openai', 'anthropic']).optional(),

  // File or URL for context extraction
  fileUrl: z.string().url().optional(),
});

/**
 * POST /api/posts/generate
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Check rate limit
    await checkRateLimit(`ai:${user.id}`, aiRateLimiter);

    const body = await req.json();
    const data = generateSchema.parse(body);

    let context = data.context;

    // Extract context from file if provided
    if (data.fileUrl) {
      const extraction = await extractTextFromUrl(data.fileUrl);
      context = extraction.text;
    }

    // Generate post
    const result = await generatePost({
      topic: data.topic,
      tone: data.tone,
      intensity: data.intensity,
      context,
      provider: data.aiProvider,
    });

    return NextResponse.json({
      content: result.content,
      provider: result.provider,
      model: result.model,
      topic: data.topic,
      tone: data.tone,
      intensity: data.intensity,
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
