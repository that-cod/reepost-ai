/**
 * API Response Types
 */

import { Post, User, Settings, Analytics, SavedPost } from '@prisma/client';

// Common API Response
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code: string;
    statusCode: number;
    details?: any;
  };
}

// Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Post Responses
export interface PostWithUser extends Post {
  user: Pick<User, 'id' | 'name' | 'image'>;
}

export interface PostWithEngagement extends Post {
  totalEngagement: number;
  engagementRate: number;
}

// Analytics Response
export interface AnalyticsSummary {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalViews: number;
  engagementRate: number;
}

export interface AnalyticsTimeline {
  date: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  clicks: number;
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary;
  timeline: AnalyticsTimeline[];
  topPosts: PostWithEngagement[];
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

// Search Response
export interface SearchResult extends Post {
  similarity: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
}

// Trending Response
export interface TrendingPost extends PostWithUser {
  trendingScore: number;
}

export interface TrendingResponse {
  posts: TrendingPost[];
  total: number;
  limit: number;
  offset: number;
  timeframe: string;
}

// Saved Posts Response
export interface SavedPostWithPost extends SavedPost {
  post: Post;
}

// Subscription Response
export interface SubscriptionResponse {
  plan: string;
  subscriptionId: string | null;
  priceId: string | null;
  currentPeriodEnd: Date | null;
  isActive: boolean;
}

// Generation Response
export interface GenerationResponse {
  content: string;
  provider: 'openai' | 'anthropic';
  model: string;
  topic: string;
  tone: string;
  intensity: string;
}

// Upload Response
export interface UploadResponse {
  url: string;
  extractedText?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

// Billing Response
export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export interface PortalSessionResponse {
  url: string;
}
