/**
 * Application Constants
 */

export const APP_NAME = 'EasyGen';
export const APP_DESCRIPTION = 'AI-Powered LinkedIn Content Generation Platform';

// Plan Limits
export const PLAN_LIMITS = {
  FREE: {
    postsPerMonth: 5,
    aiGenerationsPerMonth: 10,
    scheduledPosts: 2,
    storageGB: 0.5,
  },
  STARTER: {
    postsPerMonth: 30,
    aiGenerationsPerMonth: 50,
    scheduledPosts: 10,
    storageGB: 5,
  },
  PRO: {
    postsPerMonth: 100,
    aiGenerationsPerMonth: 200,
    scheduledPosts: 50,
    storageGB: 20,
  },
  ENTERPRISE: {
    postsPerMonth: Infinity,
    aiGenerationsPerMonth: Infinity,
    scheduledPosts: Infinity,
    storageGB: 100,
  },
};

// Rate Limits
export const RATE_LIMITS = {
  API_DEFAULT: {
    requests: 100,
    window: '1m',
  },
  AI_GENERATION: {
    requests: 20,
    window: '1h',
  },
  PUBLISHING: {
    requests: 10,
    window: '24h',
  },
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
};

// Post Settings
export const POST_SETTINGS = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 3000,
  OPTIMAL_LENGTH_MIN: 150,
  OPTIMAL_LENGTH_MAX: 300,
  MAX_HASHTAGS: 10,
};

// Analytics
export const ANALYTICS = {
  TRENDING_WINDOW_HOURS: 48,
  MIN_VIEWS_FOR_TRENDING: 100,
  DEFAULT_METRICS_DAYS: 30,
};

// Search
export const SEARCH = {
  MIN_SIMILARITY_THRESHOLD: 0.7,
  MAX_RESULTS: 50,
  DEFAULT_RESULTS: 10,
};
