/**
 * Script to populate tone_detected and topic_category columns
 * for viral posts using AI analysis
 * 
 * Run with: npx ts-node scripts/populate-post-metadata.ts
 */

import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Define valid tones and categories
const TONES = [
    'Professional',
    'Inspirational',
    'Educational',
    'Conversational',
    'Humorous',
    'Motivational',
    'Thought-provoking',
    'Storytelling'
] as const;

const CATEGORIES = [
    'Technology',
    'AI & Machine Learning',
    'Leadership',
    'Career Growth',
    'Entrepreneurship',
    'Productivity',
    'Marketing',
    'Personal Development',
    'Business Strategy',
    'Startup',
    'Remote Work',
    'Sales',
    'Finance',
    'Industry Insights',
    'General'
] as const;

interface ClassificationResult {
    tone: string;
    category: string;
}

async function classifyPost(content: string): Promise<ClassificationResult> {
    const prompt = `Analyze this LinkedIn post and classify it:

POST:
"""
${content.substring(0, 1000)}
"""

Classify the post with:
1. TONE: Choose ONE from: ${TONES.join(', ')}
2. CATEGORY: Choose ONE from: ${CATEGORIES.join(', ')}

Respond in JSON format only:
{"tone": "...", "category": "..."}`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a content classifier. Respond only with valid JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 100,
        });

        const text = response.choices[0].message.content?.trim() || '{}';
        // Parse JSON, handling potential markdown code blocks
        const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const result = JSON.parse(jsonStr);

        return {
            tone: TONES.includes(result.tone) ? result.tone : 'Professional',
            category: CATEGORIES.includes(result.category) ? result.category : 'General',
        };
    } catch (error) {
        console.error('Classification error:', error);
        return { tone: 'Professional', category: 'General' };
    }
}

async function processBatch(posts: { id: string; content: string }[], batchNum: number) {
    console.log(`\nProcessing batch ${batchNum} (${posts.length} posts)...`);

    for (const post of posts) {
        try {
            const { tone, category } = await classifyPost(post.content);

            await prisma.$executeRaw`
        UPDATE viral_posts 
        SET tone_detected = ${tone}, topic_category = ${category}
        WHERE id = ${post.id}::uuid
      `;

            process.stdout.write('.');
        } catch (error) {
            console.error(`\nError processing post ${post.id}:`, error);
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

async function main() {
    console.log('Starting metadata population...');

    // Get count of posts needing classification
    const result = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM viral_posts 
    WHERE tone_detected IS NULL OR tone_detected = '' 
       OR topic_category IS NULL OR topic_category = ''
  `;

    const total = Number(result[0].count);
    console.log(`Found ${total} posts to classify`);

    if (total === 0) {
        console.log('All posts already classified!');
        return;
    }

    const batchSize = 50;
    let processed = 0;
    let batchNum = 1;

    while (processed < total) {
        // Fetch batch of unclassified posts
        const posts = await prisma.$queryRaw<{ id: string; content: string }[]>`
      SELECT id::text, content FROM viral_posts 
      WHERE tone_detected IS NULL OR tone_detected = '' 
         OR topic_category IS NULL OR topic_category = ''
      LIMIT ${batchSize}
    `;

        if (posts.length === 0) break;

        await processBatch(posts, batchNum);

        processed += posts.length;
        batchNum++;

        console.log(`\nProgress: ${processed}/${total} (${Math.round(processed / total * 100)}%)`);
    }

    console.log('\n\nClassification complete!');

    // Show summary
    const summary = await prisma.$queryRaw<{ tone_detected: string; count: bigint }[]>`
    SELECT tone_detected, COUNT(*) as count 
    FROM viral_posts 
    WHERE tone_detected IS NOT NULL AND tone_detected != ''
    GROUP BY tone_detected
    ORDER BY count DESC
  `;

    console.log('\nTone Distribution:');
    summary.forEach(row => {
        console.log(`  ${row.tone_detected}: ${row.count}`);
    });

    const catSummary = await prisma.$queryRaw<{ topic_category: string; count: bigint }[]>`
    SELECT topic_category, COUNT(*) as count 
    FROM viral_posts 
    WHERE topic_category IS NOT NULL AND topic_category != ''
    GROUP BY topic_category
    ORDER BY count DESC
  `;

    console.log('\nCategory Distribution:');
    catSummary.forEach(row => {
        console.log(`  ${row.topic_category}: ${row.count}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
