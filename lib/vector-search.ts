import { prisma } from './prisma';
import logger from './logger';

/**
 * Viral post type returned from vector search
 */
export interface ViralPostResult {
  id: string;
  post_id: string;
  text: string;  // mapped from content
  author: string;  // mapped from author_name
  category: string;  // mapped from topic_category
  tone: string;  // mapped from tone_detected
  hookStyle: string;  // derived or empty
  viralScore: number;  // mapped from engagement_score
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
      whereClause += ' AND topic_category = $3';
      params.push(category);
    }

    if (tone) {
      whereClause += ` AND tone_detected = $${params.length + 1}`;
      params.push(tone);
    }

    // Perform similarity search using cosine distance
    // Note: pgvector uses distance (lower is better), so we convert to similarity
    const query = `
      SELECT
        id::text,
        post_id,
        content as text,
        COALESCE(author_name, 'Unknown') as author,
        COALESCE(topic_category, 'General') as category,
        COALESCE(tone_detected, 'Professional') as tone,
        'Standard' as "hookStyle",
        COALESCE(engagement_score, 0)::float as "viralScore",
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
    logger.error('Error in vector search:', error as Error);
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
    logger.error('Error searching by text:', error as Error);
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
          post_id,
          content as text,
          COALESCE(author_name, 'Unknown') as author,
          COALESCE(topic_category, 'General') as category,
          COALESCE(tone_detected, 'Professional') as tone,
          'Standard' as "hookStyle",
          COALESCE(engagement_score, 0)::float as "viralScore",
          0::float as similarity,
          ROW_NUMBER() OVER (PARTITION BY topic_category, tone_detected ORDER BY engagement_score DESC) as rn
        FROM viral_posts
      )
      SELECT id, post_id, text, author, category, tone, "hookStyle", "viralScore", similarity
      FROM ranked_posts
      WHERE rn <= 2
      ORDER BY "viralScore" DESC
      LIMIT $1
    `;

    const results = await prisma.$queryRawUnsafe<ViralPostResult[]>(query, limit);
    return results;

  } catch (error) {
    logger.error('Error getting diverse posts:', error as Error);
    throw new Error(`Failed to get diverse posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
