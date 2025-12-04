import { prisma } from './prisma';

/**
 * Viral post type returned from vector search
 */
export interface ViralPostResult {
  id: string;
  text: string;
  author: string;
  category: string;
  tone: string;
  hookStyle: string;
  viralScore: number;
  similarity: number;
}

/**
 * Search options for vector similarity search
 */
export interface SearchOptions {
  limit?: number;
  minSimilarity?: number;
  category?: string;
  tone?: string;
}

/**
 * Perform vector similarity search using pgvector
 *
 * @param queryEmbedding - The embedding vector to search for (1536 dimensions)
 * @param options - Search options (limit, filters, etc.)
 * @returns Array of similar viral posts with similarity scores
 */
export async function searchSimilarPosts(
  queryEmbedding: number[],
  options: SearchOptions = {}
): Promise<ViralPostResult[]> {
  const {
    limit = 10,
    minSimilarity = 0.7,
    category,
    tone,
  } = options;

  try {
    // Validate embedding
    if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== 1536) {
      throw new Error('Invalid embedding: must be array of 1536 numbers');
    }

    // Convert embedding to pgvector format
    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    // Build query with optional filters
    let whereClause = '';
    const params: any[] = [embeddingStr, limit];

    if (category) {
      whereClause += ' AND category = $3';
      params.push(category);
    }

    if (tone) {
      whereClause += ` AND tone = $${params.length + 1}`;
      params.push(tone);
    }

    // Perform similarity search using cosine distance
    // Note: pgvector uses distance (lower is better), so we convert to similarity
    const query = `
      SELECT
        id::text,
        text,
        author,
        category,
        tone,
        hook_style as "hookStyle",
        viral_score as "viralScore",
        1 - (embedding <=> $1::vector) as similarity
      FROM viral_posts
      WHERE embedding IS NOT NULL
        AND (1 - (embedding <=> $1::vector)) >= ${minSimilarity}
        ${whereClause}
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `;

    const results = await prisma.$queryRawUnsafe<ViralPostResult[]>(query, ...params);

    return results;

  } catch (error) {
    console.error('Error in vector search:', error);
    throw new Error(`Vector search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search for similar posts by text (convenience method)
 * Automatically generates embedding from input text
 */
export async function searchByText(
  text: string,
  options: SearchOptions = {}
): Promise<ViralPostResult[]> {
  const { createEmbedding } = await import('./embedding');

  try {
    const embedding = await createEmbedding(text);
    return await searchSimilarPosts(embedding, options);
  } catch (error) {
    console.error('Error searching by text:', error);
    throw new Error(`Text search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get diverse viral posts (varied categories/tones) for inspiration
 */
export async function getTopDiversePosts(limit: number = 20): Promise<ViralPostResult[]> {
  try {
    const query = `
      WITH ranked_posts AS (
        SELECT
          id::text,
          text,
          author,
          category,
          tone,
          hook_style as "hookStyle",
          viral_score as "viralScore",
          0 as similarity,
          ROW_NUMBER() OVER (PARTITION BY category, tone ORDER BY viral_score DESC) as rn
        FROM viral_posts
      )
      SELECT id, text, author, category, tone, "hookStyle", "viralScore", similarity
      FROM ranked_posts
      WHERE rn <= 2
      ORDER BY "viralScore" DESC
      LIMIT $1
    `;

    const results = await prisma.$queryRawUnsafe<ViralPostResult[]>(query, limit);
    return results;

  } catch (error) {
    console.error('Error getting diverse posts:', error);
    throw new Error(`Failed to get diverse posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
