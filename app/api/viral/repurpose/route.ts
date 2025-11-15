import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { extractPostPatterns } from '@/lib/pattern-extraction';
import { ViralPostResult } from '@/lib/vector-search';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/viral/repurpose
 * Repurpose a viral post into a new version with similar style
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, newTopic } = body;

    // Validate input
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    console.log(`Repurposing post: ${postId}`);

    // Step 1: Fetch the viral post
    const result = await prisma.$queryRaw<any[]>`
      SELECT
        id::text,
        text,
        author,
        category,
        tone,
        hook_style as "hookStyle",
        viral_score as "viralScore"
      FROM viral_posts
      WHERE id = ${postId}::uuid
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Viral post not found' },
        { status: 404 }
      );
    }

    const viralPost = result[0];

    // Step 2: Extract patterns from this specific post
    console.log('Analyzing post structure...');
    const postAsResult: ViralPostResult = {
      ...viralPost,
      similarity: 1.0,
    };

    // Get similar posts to extract broader patterns
    const similarPostsQuery = await prisma.$queryRaw<any[]>`
      SELECT
        id::text,
        text,
        author,
        category,
        tone,
        hook_style as "hookStyle",
        viral_score as "viralScore"
      FROM viral_posts
      WHERE category = ${viralPost.category}
        AND tone = ${viralPost.tone}
        AND id != ${postId}::uuid
      ORDER BY viral_score DESC
      LIMIT 5
    `;

    const analysisSet = [postAsResult, ...similarPostsQuery.map(p => ({ ...p, similarity: 0.9 }))];
    const patterns = extractPostPatterns(analysisSet);

    // Step 3: Analyze the original post structure
    const lines = viralPost.text.split('\n').filter((l: string) => l.trim());
    const firstLine = lines[0] || '';
    const hasList = /^[•\-\d][\.\)]/m.test(viralPost.text);
    const hasEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(viralPost.text);
    const hasQuestion = viralPost.text.includes('?');

    // Step 4: Build repurposing prompt
    const prompt = `You are repurposing a viral LinkedIn post. Your task is to create a COMPLETELY NEW post that:
1. Uses the SAME writing style, tone, and structure
2. Covers ${newTopic ? `a NEW topic: "${newTopic}"` : 'a related but different angle'}
3. Is NOT a copy or paraphrase - it must be original content

**Original Post to Learn From:**
---
${viralPost.text}
---

**Key Characteristics to Match:**
- Tone: ${viralPost.tone}
- Category: ${viralPost.category}
- Hook Style: ${viralPost.hookStyle}
- Viral Score: ${viralPost.viralScore}/10
- Length: ${viralPost.text.length} characters
- Paragraphs: ${lines.length}
- Opening style: "${firstLine.substring(0, 50)}..."
${hasEmojis ? '- Uses emojis strategically' : '- Professional, no emojis'}
${hasQuestion ? '- Includes rhetorical questions' : '- Statements-based'}
${hasList ? '- Uses bullet points or lists' : '- Narrative flow'}

**Your Instructions:**
1. Create a brand new post about ${newTopic || 'a related topic'}
2. Match the exact tone, style, and structure
3. Use a similar hook style: ${viralPost.hookStyle}
4. Keep the same paragraph count (${lines.length} paragraphs)
5. Aim for ~${viralPost.text.length} characters
6. ${hasEmojis ? 'Include emojis where appropriate' : 'Keep it professional'}
7. ${hasQuestion ? 'Include a rhetorical question' : 'Use strong statements'}
8. DO NOT copy any phrases verbatim - this must be 100% original

Generate ONLY the new post content, without any labels or meta-commentary.`;

    // Step 5: Generate repurposed content
    console.log('Generating repurposed content...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at repurposing viral LinkedIn content while maintaining style and structure but creating completely original content.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.85,
      max_tokens: 800,
    });

    const repurposedPost = completion.choices[0].message.content?.trim() || '';

    if (!repurposedPost) {
      throw new Error('No content generated');
    }

    console.log('Repurposing complete');

    // Return repurposed content with analysis
    return NextResponse.json({
      success: true,
      repurposedPost,
      original: {
        id: viralPost.id,
        preview: viralPost.text.substring(0, 100) + '...',
        viralScore: viralPost.viralScore,
        tone: viralPost.tone,
        category: viralPost.category,
        hookStyle: viralPost.hookStyle,
      },
      analysis: {
        originalLength: viralPost.text.length,
        newLength: repurposedPost.length,
        paragraphsMatched: lines.length,
        stylePatterns: {
          hasEmojis,
          hasQuestion,
          hasList,
          hookStyle: viralPost.hookStyle,
        },
      },
    });

  } catch (error) {
    console.error('Error repurposing post:', error);

    return NextResponse.json(
      {
        error: 'Failed to repurpose post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
