/**
 * AI Provider Aggregator
 * Handles switching between OpenAI and Anthropic
 */

import { Tone, Intensity } from '@prisma/client';
import * as openai from './openai';
import * as anthropic from './anthropic';

export type AIProvider = 'openai' | 'anthropic';

interface GenerateParams {
  topic: string;
  tone: Tone;
  intensity: Intensity;
  context?: string;
  provider?: AIProvider;
}

/**
 * Generate post content using specified AI provider
 */
export async function generatePost(params: GenerateParams): Promise<{
  content: string;
  provider: AIProvider;
  model: string;
}> {
  const provider = params.provider || (process.env.DEFAULT_AI_PROVIDER as AIProvider) || 'openai';

  let content: string;
  let model: string;

  if (provider === 'anthropic') {
    content = await anthropic.generatePost(params);
    model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
  } else {
    content = await openai.generatePost(params);
    model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
  }

  return {
    content,
    provider,
    model,
  };
}

/**
 * Generate embeddings (OpenAI only for now)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  return openai.generateEmbedding(text);
}

/**
 * Extract text from image
 */
export async function extractTextFromImage(
  imageUrl: string,
  provider?: AIProvider
): Promise<string> {
  const selectedProvider = provider || (process.env.DEFAULT_AI_PROVIDER as AIProvider) || 'openai';

  if (selectedProvider === 'anthropic') {
    return anthropic.extractTextFromImage(imageUrl);
  } else {
    return openai.extractTextFromImage(imageUrl);
  }
}
