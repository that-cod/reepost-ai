/**
 * Script to populate tone_detected and topic_category columns
 * Uses pg library directly to avoid Prisma config caching issues
 * 
 * Run with: node scripts/populate-metadata.mjs
 */

import pg from 'pg';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const TONES = [
    'Professional', 'Inspirational', 'Educational', 'Conversational',
    'Humorous', 'Motivational', 'Thought-provoking', 'Storytelling'
];

const CATEGORIES = [
    'Technology', 'AI & Machine Learning', 'Leadership', 'Career Growth',
    'Entrepreneurship', 'Productivity', 'Marketing', 'Personal Development',
    'Business Strategy', 'Startup', 'Remote Work', 'Sales', 'Finance',
    'Industry Insights', 'General'
];

async function classifyPost(content) {
    const prompt = `Analyze this LinkedIn post and classify it:

POST:
"""
${content.substring(0, 800)}
"""

Classify with:
1. TONE: Choose ONE from: ${TONES.join(', ')}
2. CATEGORY: Choose ONE from: ${CATEGORIES.join(', ')}

Respond in JSON only: {"tone": "...", "category": "..."}`;

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
        const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const result = JSON.parse(jsonStr);

        return {
            tone: TONES.includes(result.tone) ? result.tone : 'Professional',
            category: CATEGORIES.includes(result.category) ? result.category : 'General',
        };
    } catch (error) {
        console.error('Classification error:', error.message);
        return { tone: 'Professional', category: 'General' };
    }
}

async function main() {
    console.log('Connecting to database...');
    const client = await pool.connect();

    try {
        // Get count
        const countResult = await client.query(`
      SELECT COUNT(*) as count FROM viral_posts 
      WHERE tone_detected IS NULL OR tone_detected = ''
    `);
        const total = parseInt(countResult.rows[0].count);
        console.log(`Found ${total} posts to classify`);

        if (total === 0) {
            console.log('All posts already classified!');
            return;
        }

        const batchSize = 50;
        let processed = 0;

        while (processed < total) {
            // Fetch batch
            const result = await client.query(`
        SELECT id, content FROM viral_posts 
        WHERE tone_detected IS NULL OR tone_detected = ''
        LIMIT $1
      `, [batchSize]);

            if (result.rows.length === 0) break;

            console.log(`\nBatch: Processing ${result.rows.length} posts...`);

            for (const post of result.rows) {
                const { tone, category } = await classifyPost(post.content);

                await client.query(`
          UPDATE viral_posts 
          SET tone_detected = $1, topic_category = $2
          WHERE id = $3
        `, [tone, category, post.id]);

                process.stdout.write('.');

                // Rate limit delay
                await new Promise(r => setTimeout(r, 100));
            }

            processed += result.rows.length;
            console.log(`\nProgress: ${processed}/${total} (${Math.round(processed / total * 100)}%)`);
        }

        console.log('\n\nClassification complete!');

        // Summary
        const summary = await client.query(`
      SELECT tone_detected, COUNT(*) as count FROM viral_posts 
      GROUP BY tone_detected ORDER BY count DESC
    `);
        console.log('\nTone Distribution:');
        summary.rows.forEach(r => console.log(`  ${r.tone_detected || 'NULL'}: ${r.count}`));

    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(console.error);
