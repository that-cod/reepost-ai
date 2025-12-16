import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createEmbedding } from '@/lib/embedding';
import { searchSimilarPosts } from '@/lib/vector-search';
import { extractPostPatterns, generateStyleGuide } from '@/lib/pattern-extraction';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { checkRateLimit, aiRateLimiter } from '@/lib/ratelimit';
import { formatErrorResponse } from '@/lib/errors';
import logger from '@/lib/logger';
import OpenAI from 'openai';

// Lazy-initialized OpenAI client
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

const generateSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  tone: z.string().optional(),
  category: z.string().optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
});

/**
 * POST /api/generate
 * Generate a LinkedIn post using RAG from viral posts
 */
export async function POST(request: NextRequest) {
  let user;
  let topic;
  try {
    user = await requireAuth();

    // Check rate limit
    await checkRateLimit(`ai:${user.id}`, aiRateLimiter);

    const body = await request.json();
    const data = generateSchema.parse(body);
    topic = data.topic; // Assign topic here for logging in catch block

    // Fetch user settings to use as defaults
    let userSettings = await prisma.settings.findUnique({
      where: { userId: user.id },
    });

    // Create default settings if not exists
    if (!userSettings) {
      userSettings = await prisma.settings.create({
        data: { userId: user.id },
      });
    }

    // Use user settings as defaults if not provided in request
    const tone = data.tone || userSettings.defaultTone;
    const category = data.category;
    // Map contentLength string to length enum
    const lengthMap: Record<string, 'short' | 'medium' | 'long'> = {
      'short': 'short',
      'SHORT': 'short',
      'medium': 'medium',
      'MEDIUM': 'medium',
      'long': 'long',
      'LONG': 'long',
    };
    const length = data.length || (lengthMap[userSettings.contentLength] || 'medium');

    logger.info('Generating post with user preferences', {
      userId: user.id,
      topic,
      tone,
      length,
      fromSettings: !data.tone || !data.length
    });

    // Step 1: Create embedding from user topic
    logger.info('Creating query embedding...');
    const queryEmbedding = await createEmbedding(topic);

    // Step 2: Perform vector search for similar viral posts
    logger.info('Searching for similar viral posts...');
    const similarPosts = await searchSimilarPosts(queryEmbedding, {
      limit: 10,
      minSimilarity: 0.6,
      tone: tone || undefined,
      category: category || undefined,
    });

    if (similarPosts.length === 0) {
      // Fallback: get diverse top posts if no similar ones found
      logger.info('No similar posts found, using top diverse posts...');
      const { getTopDiversePosts } = await import('@/lib/vector-search');
      const diversePosts = await getTopDiversePosts(10);
      similarPosts.push(...diversePosts);
    }

    logger.info(`Found ${similarPosts.length} reference posts`);

    // Step 3: Extract patterns from similar posts
    logger.info('Extracting patterns...');
    const patterns = extractPostPatterns(similarPosts);
    const styleGuide = generateStyleGuide(patterns);

    // Step 4: Build RAG-enhanced prompt using LinkedIn-optimized prompts
    const { buildLinkedInPrompt, cleanGeneratedContent } = await import('@/lib/prompts/linkedin');

    const examplePosts = similarPosts
      .slice(0, 3)
      .map((p, i) => `**Example ${i + 1}** (Engagement Score: ${p.viralScore}):\n${p.text}`)
      .join('\n\n---\n\n');

    const { system: systemPrompt, user: userPrompt } = buildLinkedInPrompt({
      topic,
      tone: (tone as any) || 'PROFESSIONAL',
      intensity: (length === 'short' ? 'LOW' : length === 'long' ? 'HIGH' : 'MEDIUM') as any,
      category: category || undefined,
      patterns: {
        avgLength: patterns.avgLength,
        commonHooks: patterns.commonHooks,
        avgViralScore: patterns.avgViralScore,
        usesEmojis: patterns.usesEmojis,
        hasCTA: patterns.hasCTA,
        avgParagraphs: patterns.avgParagraphs,
      },
      examplePosts,
    });

    // Step 5: Call OpenAI to generate the post with enhanced prompts
    logger.info('Generating post with AI...');
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.6, // Lower temperature for more deterministic output that follows rules
      max_tokens: 1000,
      top_p: 0.9, // Slightly lower for more focused output
    });

    const generatedPost = cleanGeneratedContent(completion.choices[0].message.content?.trim() || '');

    if (!generatedPost) {
      throw new Error('No content generated');
    }

    // Step 6: Save generation log
    logger.info('Saving generation log...');
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS generation_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          topic TEXT NOT NULL,
          tone TEXT,
          category TEXT,
          generated_post TEXT NOT NULL,
          reference_post_ids TEXT[],
          avg_similarity REAL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const postIds = similarPosts.map(p => p.id);
      const avgSimilarity = similarPosts.length > 0
        ? similarPosts.reduce((sum, p) => sum + p.similarity, 0) / similarPosts.length
        : 0;

      await prisma.$executeRaw`
        INSERT INTO generation_logs (topic, tone, category, generated_post, reference_post_ids, avg_similarity)
        VALUES (
          ${topic},
          ${tone || null},
          ${category || null},
          ${generatedPost},
          ARRAY[${postIds.join(',')}]::TEXT[],
          ${avgSimilarity}
        )
      `;
    } catch (logError) {
      logger.error('Failed to save generation log', logError as Error);
      // Continue even if logging fails
    }

    logger.info('Post generated successfully', { userId: user.id, topic });

    // Return generated post with metadata
    return NextResponse.json({
      success: true,
      post: generatedPost,
      metadata: {
        topic,
        tone: tone || 'professional',
        category: category || 'general',
        referencePosts: similarPosts.length,
        avgSimilarity: similarPosts.length > 0
          ? (similarPosts.reduce((sum, p) => sum + p.similarity, 0) / similarPosts.length).toFixed(2)
          : 0,
        patterns: {
          avgLength: patterns.avgLength,
          commonHooks: patterns.commonHooks,
          avgViralScore: patterns.avgViralScore.toFixed(1),
        },
      },
    });

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

    logger.error('Error generating post', error as Error, { topic });

    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode,
    });
  }
}
