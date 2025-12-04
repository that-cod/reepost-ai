/**
 * Anthropic (Claude) Integration
 * Handles text generation
 */

import Anthropic from '@anthropic-ai/sdk';
import { Tone, Intensity } from '@prisma/client';
import logger, { loggers } from '../logger';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

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
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      temperature: getTemperature(intensity),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = message.content[0];
    const text = content.type === 'text' ? content.text : '';
    const duration = Date.now() - startTime;

    loggers.ai(
      'anthropic',
      DEFAULT_MODEL,
      message.usage.input_tokens + message.usage.output_tokens,
      duration
    );

    return text.trim();
  } catch (error) {
    loggers.error('Anthropic generation failed', error as Error, { topic, tone, intensity });
    throw new Error('Failed to generate content with Anthropic');
  }
}

/**
 * Extract text from image using Claude Vision
 */
export async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    // Fetch image and convert to base64
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mediaType = response.headers.get('content-type') || 'image/jpeg';

    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: base64,
              },
            },
            {
              type: 'text',
              text: 'Extract all text from this image. Provide a clean, formatted transcription.',
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    return content.type === 'text' ? content.text : '';
  } catch (error) {
    loggers.error('Anthropic vision extraction failed', error as Error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Helper: Build system prompt
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
 * Helper: Get temperature
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
