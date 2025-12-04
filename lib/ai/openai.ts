/**
 * OpenAI Integration
 * Handles text generation and embeddings
 */

import OpenAI from 'openai';
import { Tone, Intensity } from '@prisma/client';
import logger, { loggers } from '../logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

/**
 * Generate LinkedIn post content
 */
export async function generatePost(params: {
  topic: string;
  tone: Tone;
  intensity: Intensity;
  context?: string;
}): Promise<string> {
  const { topic, tone, intensity, context } = params;

  const systemPrompt = buildSystemPrompt(tone, intensity);
  const userPrompt = buildUserPrompt(topic, context);

  const startTime = Date.now();

  try {
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: getTemperature(intensity),
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || '';
    const duration = Date.now() - startTime;

    loggers.ai(
      'openai',
      DEFAULT_MODEL,
      completion.usage?.total_tokens || 0,
      duration
    );

    return content.trim();
  } catch (error) {
    loggers.error('OpenAI generation failed', error as Error, { topic, tone, intensity });
    throw new Error('Failed to generate content with OpenAI');
  }
}

/**
 * Generate embeddings for semantic search
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const startTime = Date.now();

  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });

    const duration = Date.now() - startTime;
    loggers.ai('openai-embedding', EMBEDDING_MODEL, response.usage.total_tokens, duration);

    return response.data[0].embedding;
  } catch (error) {
    loggers.error('OpenAI embedding failed', error as Error);
    throw new Error('Failed to generate embedding with OpenAI');
  }
}

/**
 * Extract text from image using GPT-4 Vision
 */
export async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all text from this image. Provide a clean, formatted transcription.',
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    loggers.error('OpenAI vision extraction failed', error as Error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Helper: Build system prompt based on tone and intensity
 */
function buildSystemPrompt(tone: Tone, intensity: Intensity): string {
  const toneDescriptions: Record<Tone, string> = {
    PROFESSIONAL: 'professional, polished, and business-appropriate',
    CASUAL: 'conversational, friendly, and approachable',
    ENTHUSIASTIC: 'energetic, positive, and exciting',
    THOUGHTFUL: 'reflective, insightful, and contemplative',
    BOLD: 'confident, assertive, and impactful',
    INSPIRATIONAL: 'motivating, uplifting, and empowering',
    EDUCATIONAL: 'informative, clear, and teaching-focused',
    HUMOROUS: 'witty, entertaining, and light-hearted',
  };

  const intensityDescriptions: Record<Intensity, string> = {
    LOW: 'subtle and understated',
    MEDIUM: 'balanced and moderate',
    HIGH: 'strong and emphatic',
    EXTREME: 'maximum impact and boldness',
  };

  return `You are an expert LinkedIn content creator. Generate engaging LinkedIn posts that are ${toneDescriptions[tone]} with a ${intensityDescriptions[intensity]} approach.

Rules:
- Keep posts concise (150-300 words ideal)
- Use line breaks for readability
- Include a compelling hook in the first line
- Add relevant hashtags (3-5)
- Make it authentic and valuable
- Optimize for engagement
- Follow LinkedIn best practices`;
}

/**
 * Helper: Build user prompt
 */
function buildUserPrompt(topic: string, context?: string): string {
  let prompt = `Create a LinkedIn post about: ${topic}`;

  if (context) {
    prompt += `\n\nAdditional context: ${context}`;
  }

  return prompt;
}

/**
 * Helper: Get temperature based on intensity
 */
function getTemperature(intensity: Intensity): number {
  const temperatureMap: Record<Intensity, number> = {
    LOW: 0.3,
    MEDIUM: 0.7,
    HIGH: 0.9,
    EXTREME: 1.0,
  };

  return temperatureMap[intensity];
}
