/**
 * Shared AI Prompt Utilities
 * Common functions used across AI providers (OpenAI, Anthropic)
 */

import { Tone, Intensity } from '@prisma/client';

/**
 * Build a system prompt for LinkedIn content generation
 */
export function buildSystemPrompt(): string {
    return `You are a professional LinkedIn content creator. You write engaging, 
thought-provoking posts that resonate with professional audiences. Your posts 
are authentic, add value, and encourage meaningful engagement.

Guidelines:
- Be concise but impactful
- Use storytelling when appropriate
- Include actionable insights
- Maintain professional tone while being personable
- Avoid clickbait or overly salesy language`;
}

/**
 * Build a user prompt for content generation
 */
export function buildUserPrompt(
    topic: string,
    tone: Tone,
    intensity: Intensity,
    context?: string
): string {
    const toneDescriptions: Record<Tone, string> = {
        PROFESSIONAL: 'professional and authoritative',
        CASUAL: 'casual and conversational',
        ENTHUSIASTIC: 'enthusiastic and energetic',
        THOUGHTFUL: 'thoughtful and reflective',
        BOLD: 'bold and provocative',
        INSPIRATIONAL: 'inspirational and motivating',
        EDUCATIONAL: 'educational and informative',
        HUMOROUS: 'humorous and entertaining',
    };

    const intensityDescriptions: Record<Intensity, string> = {
        LOW: 'subtle and understated',
        MEDIUM: 'balanced and moderate',
        HIGH: 'strong and impactful',
        EXTREME: 'intense and powerful',
    };

    let prompt = `Create a LinkedIn post about: ${topic}\n\n`;
    prompt += `Tone: ${toneDescriptions[tone] || 'professional'}\n`;
    prompt += `Intensity: ${intensityDescriptions[intensity] || 'moderate'}\n`;

    if (context) {
        prompt += `\nAdditional context: ${context}\n`;
    }

    prompt += `\nGuidelines:
- Keep it between 200-400 words for optimal engagement
- Start with a hook that grabs attention
- Include relevant insights or takeaways
- End with a question or call-to-action to encourage engagement
- Use emojis sparingly if appropriate for the tone
- Format with line breaks for readability`;

    return prompt;
}

/**
 * Get temperature setting based on intensity and tone
 */
export function getTemperature(intensity: Intensity, tone: Tone): number {
    // Base temperature by intensity
    const intensityMap: Record<Intensity, number> = {
        LOW: 0.5,
        MEDIUM: 0.7,
        HIGH: 0.85,
        EXTREME: 1.0,
    };

    // Adjust for certain tones
    let temperature = intensityMap[intensity] || 0.7;

    if (tone === 'HUMOROUS' || tone === 'BOLD') {
        temperature = Math.min(temperature + 0.1, 1.0);
    } else if (tone === 'PROFESSIONAL' || tone === 'EDUCATIONAL') {
        temperature = Math.max(temperature - 0.1, 0.3);
    }

    return temperature;
}

/**
 * Format AI usage data for logging
 */
export function formatUsageForLogging(
    provider: 'openai' | 'anthropic',
    model: string,
    inputTokens: number,
    outputTokens: number
): Record<string, unknown> {
    const estimatedCost = estimateCost(provider, model, inputTokens, outputTokens);

    return {
        provider,
        model,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        estimatedCost,
    };
}

/**
 * Estimate cost for AI API call
 */
function estimateCost(
    provider: 'openai' | 'anthropic',
    model: string,
    inputTokens: number,
    outputTokens: number
): number {
    // Approximate pricing per 1M tokens (as of late 2024)
    const pricing: Record<string, { input: number; output: number }> = {
        'gpt-4o': { input: 2.5, output: 10 },
        'gpt-4o-mini': { input: 0.15, output: 0.60 },
        'gpt-4-turbo': { input: 10, output: 30 },
        'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
        'claude-3-5-sonnet': { input: 3, output: 15 },
        'claude-3-opus': { input: 15, output: 75 },
        'claude-3-haiku': { input: 0.25, output: 1.25 },
    };

    const rates = pricing[model] || { input: 5, output: 15 };

    return (
        (inputTokens / 1_000_000) * rates.input +
        (outputTokens / 1_000_000) * rates.output
    );
}

/**
 * Validate and clean generated content
 */
export function cleanGeneratedContent(content: string): string {
    // Remove common AI prefixes
    const prefixes = [
        /^Here'?s? ?(a|your|the) ?(LinkedIn )?post:?\s*/i,
        /^Sure!? ?(Here'?s?)?:?\s*/i,
        /^I'?d? be happy to help:?\s*/i,
        /^(Absolutely|Certainly)!?:?\s*/i,
    ];

    let cleaned = content;

    for (const prefix of prefixes) {
        cleaned = cleaned.replace(prefix, '');
    }

    // Remove trailing quotes if they wrap the entire content
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1);
    }

    return cleaned.trim();
}
