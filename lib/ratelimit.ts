/**
 * Rate Limiting using Upstash Redis
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RateLimitError } from './errors';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Default rate limiter: 100 requests per minute
 */
export const defaultRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
    `${parseInt(process.env.RATE_LIMIT_WINDOW || '60000')} ms`
  ),
  analytics: true,
  prefix: '@ratelimit/default',
});

/**
 * Strict rate limiter for AI generation: 20 requests per hour
 */
export const aiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  analytics: true,
  prefix: '@ratelimit/ai',
});

/**
 * Publishing rate limiter: 10 posts per day
 */
export const publishRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '24 h'),
  analytics: true,
  prefix: '@ratelimit/publish',
});

/**
 * Helper function to check rate limit
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit = defaultRateLimiter
): Promise<void> {
  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  if (!success) {
    throw new RateLimitError(
      `Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds`
    );
  }
}

/**
 * Get rate limit headers for response
 */
export async function getRateLimitHeaders(
  identifier: string,
  limiter: Ratelimit = defaultRateLimiter
): Promise<Record<string, string>> {
  const { limit, reset, remaining } = await limiter.limit(identifier);

  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };
}
