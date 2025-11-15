import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createEmbedding } from '@/lib/embedding';
import { searchSimilarPosts } from '@/lib/vector-search';
import { extractPostPatterns, generateStyleGuide } from '@/lib/pattern-extraction';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/generate
 * Generate a LinkedIn post using RAG from viral posts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, tone, category, length } = body;

    // Validate input
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    console.log(`Generating post for topic: "${topic}"`);

    // Step 1: Create embedding from user topic
    console.log('Creating query embedding...');
    const queryEmbedding = await createEmbedding(topic);

    // Step 2: Perform vector search for similar viral posts
    console.log('Searching for similar viral posts...');
    const similarPosts = await searchSimilarPosts(queryEmbedding, {
      limit: 10,
      minSimilarity: 0.6,
      tone: tone || undefined,
      category: category || undefined,
    });

    if (similarPosts.length === 0) {
      // Fallback: get diverse top posts if no similar ones found
      console.log('No similar posts found, using top diverse posts...');
      const { getTopDiversePosts } = await import('@/lib/vector-search');
      const diversePosts = await getTopDiversePosts(10);
      similarPosts.push(...diversePosts);
    }

    console.log(`Found ${similarPosts.length} reference posts`);

    // Step 3: Extract patterns from similar posts
    console.log('Extracting patterns...');
    const patterns = extractPostPatterns(similarPosts);
    const styleGuide = generateStyleGuide(patterns);

    // Step 4: Build RAG-enhanced prompt
    const examplePosts = similarPosts
      .slice(0, 3)
      .map((p, i) => `Example ${i + 1} (Score: ${p.viralScore}):\n${p.text}`)
      .join('\n\n---\n\n');

    const prompt = `You are an expert LinkedIn content creator. Generate a high-performing LinkedIn post based on the following:

**Topic:** ${topic}

**Desired Tone:** ${tone || 'professional yet engaging'}
**Desired Category:** ${category || 'general professional content'}
**Target Length:** ${length || 'medium (200-400 words)'}

${styleGuide}

**Reference Examples from Top-Performing Posts:**

${examplePosts}

**Instructions:**
1. Create an original post that captures the essence of the topic
2. Follow the writing patterns and structure from the examples
3. Match the desired tone and category
4. Use hooks similar to: ${patterns.commonHooks.join(', ')}
5. ${patterns.usesEmojis ? 'Include strategic emoji use' : 'Keep it professional without emojis'}
6. ${patterns.hasCTA > 50 ? 'Include a clear call-to-action' : 'Keep it conversational'}
7. Aim for approximately ${patterns.avgLength} characters
8. Use ${patterns.avgParagraphs} paragraphs with clear spacing

Generate only the post content, without any meta-commentary or labels.`;

    // Step 5: Call OpenAI to generate the post
    console.log('Generating post with AI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional LinkedIn content creator who writes viral posts.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    const generatedPost = completion.choices[0].message.content?.trim() || '';

    if (!generatedPost) {
      throw new Error('No content generated');
    }

    // Step 6: Save generation log
    console.log('Saving generation log...');
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
      console.error('Failed to save generation log:', logError);
      // Continue even if logging fails
    }

    console.log('Post generated successfully');

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

  } catch (error) {
    console.error('Error generating post:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
