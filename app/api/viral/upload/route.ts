import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createEmbeddingsBatch } from '@/lib/embedding';

// Type for viral post input
interface ViralPostInput {
  text: string;
  author: string;
  category: string;
  tone: string;
  hookStyle: string;
  viralScore: number;
}

/**
 * POST /api/viral/upload
 * Admin-only route to upload viral posts with embeddings
 */
export async function POST(request: NextRequest) {
  try {
    // Admin authentication check
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin credentials' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const posts: ViralPostInput[] = body.posts;

    if (!Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request - posts array required' },
        { status: 400 }
      );
    }

    // Validate post structure
    for (const post of posts) {
      if (!post.text || !post.author || !post.category || !post.tone || !post.hookStyle) {
        return NextResponse.json(
          { error: 'Invalid post structure - missing required fields' },
          { status: 400 }
        );
      }
    }

    console.log(`Processing ${posts.length} viral posts...`);

    // Extract all text for batch embedding
    const texts = posts.map(p => p.text);

    // Generate embeddings in batches
    console.log('Generating embeddings...');
    const embeddings = await createEmbeddingsBatch(texts, 50);

    if (embeddings.length !== posts.length) {
      throw new Error('Embedding count mismatch');
    }

    // Prepare data for insertion
    const postsWithEmbeddings = posts.map((post, idx) => ({
      text: post.text,
      author: post.author,
      category: post.category,
      tone: post.tone,
      hookStyle: post.hookStyle,
      viralScore: post.viralScore,
      embedding: `[${embeddings[idx].join(',')}]`, // pgvector format
    }));

    // Insert into database using raw SQL for pgvector compatibility
    console.log('Saving to database...');
    let insertedCount = 0;

    for (const post of postsWithEmbeddings) {
      await prisma.$executeRaw`
        INSERT INTO viral_posts (text, author, category, tone, hook_style, viral_score, embedding)
        VALUES (
          ${post.text},
          ${post.author},
          ${post.category},
          ${post.tone},
          ${post.hookStyle},
          ${post.viralScore},
          ${post.embedding}::vector
        )
      `;
      insertedCount++;
    }

    console.log(`Successfully inserted ${insertedCount} posts`);

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${insertedCount} viral posts`,
      count: insertedCount,
    });

  } catch (error) {
    console.error('Error uploading viral posts:', error);

    return NextResponse.json(
      {
        error: 'Failed to upload viral posts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
