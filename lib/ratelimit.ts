/**
 * Rate Limiting using Upstash Redis
 * Falls back to no-op when Redis is not configured
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RateLimitError } from './errors';

// Check if Upstash Redis is properly configured
const isRedisConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  process.env.UPSTASH_REDIS_REST_URL.startsWith('https://')
);

// Only create Redis client if properly configured
const redis = isRedisConfigured
  ? new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  : null;

/**
 * Default rate limiter: 100 requests per minute
 */
export const defaultRateLimiter = redis
  ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
      `${parseInt(process.env.RATE_LIMIT_WINDOW || '60000')} ms`
    ),
    analytics: true,
    prefix: '@ratelimit/default',
  })
  : null;

/**
 * Strict rate limiter for AI generation: 20 requests per hour
 */
export const aiRateLimiter = redis
  ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    analytics: true,
    prefix: '@ratelimit/ai',
  })
  : null;

/**
 * Publishing rate limiter: 10 posts per day
 */
export const publishRateLimiter = redis
  ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '24 h'),
    analytics: true,
    prefix: '@ratelimit/publish',
  })
  : null;

/**
 * Helper function to check rate limit
 * No-op if Redis is not configured
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit | null = defaultRateLimiter
): Promise<void> {
  // Skip rate limiting if not configured
  if (!limiter) {
    console.log('[Rate Limit] Skipping - Redis not configured');
    return;
  }

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
  limiter: Ratelimit | null = defaultRateLimiter
): Promise<Record<string, string>> {
  // Return empty headers if not configured
  if (!limiter) {
    return {};
  }

  const { limit, reset, remaining } = await limiter.limit(identifier);

  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };
}

