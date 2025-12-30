/**
 * Seed Trending Posts Data
 * Run with: npx tsx scripts/seed-trending.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CREATORS = [
    {
        name: 'Sahil Chandani',
        occupation: 'Student at Jaipur Engineering College and Research Centre',
        followerCount: 15000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sahil',
    },
    {
        name: 'Charlie Hills',
        occupation: "The AI Creators' Club - Jan 5th 2026",
        followerCount: 42000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
    },
    {
        name: 'MJ Jaindl',
        occupation: 'Helping CEOs grow their business with AI',
        followerCount: 28000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mj',
    },
    {
        name: 'Axelle Malek',
        occupation: 'Daily post to fight your FOMO on AI',
        followerCount: 35000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=axelle',
    },
    {
        name: 'Ruben Hassid',
        occupation: 'AI Tools & Productivity Expert',
        followerCount: 89000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ruben',
    },
    {
        name: 'Sarah Chen',
        occupation: 'Product Designer | UX Strategy',
        followerCount: 62000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    },
];

const POST_CONTENTS = [
    {
        content: `Your AI knowledge stops at ChatGPT.

Staying on top of AI = Staying on top of tools.

Go to how-to-ai.guide to master AI.`,
        mediaType: 'IMAGE' as const,
        keywords: ['AI', 'ChatGPT', 'tools'],
    },
    {
        content: `You think AI tools are useless. Think again.

I am aging a woman from 5 to 95 years old.

Everything is AI-made. Here's how.`,
        mediaType: 'VIDEO' as const,
        keywords: ['AI', 'tools', 'aging'],
    },
    {
        content: `This is the single best Veo 3 video I've seen.

This video is 100% AI-generated.

Hashem Al-Ghaili made this video and called it:`,
        mediaType: 'VIDEO' as const,
        keywords: ['Veo', 'AI', 'video'],
    },
    {
        content: `Most people guess LinkedIn.

But ChatGPT can help you analyze it.

Here are 10 AI tools that will change your workflow forever:`,
        mediaType: 'DOCUMENT' as const,
        keywords: ['LinkedIn', 'ChatGPT', 'productivity'],
    },
    {
        content: `The future of AI is not what you think.

I spent 100 hours researching the latest trends.

Here's what I discovered about the next generation of AI tools:`,
        mediaType: 'IMAGE' as const,
        keywords: ['AI', 'future', 'trends'],
    },
    {
        content: `Stop using outdated productivity hacks.

These 7 AI-powered methods are 10x more effective.

Thread 🧵👇`,
        mediaType: 'NONE' as const,
        keywords: ['productivity', 'AI', 'hacks'],
    },
    {
        content: `I analyzed 1000+ viral LinkedIn posts.

Here are the 5 patterns that get the most engagement:

1. Start with a bold statement
2. Use short sentences
3. Add visual breaks
4. Include actionable insights
5. End with a strong CTA`,
        mediaType: 'IMAGE' as const,
        keywords: ['LinkedIn', 'viral', 'engagement'],
    },
    {
        content: `AI replaced my entire design workflow.

What used to take 5 hours now takes 30 minutes.

Here's my complete AI design stack:`,
        mediaType: 'VIDEO' as const,
        keywords: ['AI', 'design', 'workflow'],
    },
    {
        content: `The AI revolution is happening NOW.

And most people are sleeping on it.

Here are 12 AI tools you need to try this week:`,
        mediaType: 'DOCUMENT' as const,
        keywords: ['AI', 'tools', 'revolution'],
    },
    {
        content: `I built a startup using only AI tools.

Zero developers. Zero designers.

Revenue: $50K/month.

Here's how I did it:`,
        mediaType: 'IMAGE' as const,
        keywords: ['startup', 'AI', 'revenue'],
    },
];

async function main() {
    console.log('🌱 Seeding trending posts...');

    // Clear existing data
    await prisma.trendingPost.deleteMany({});
    await prisma.trendingCreator.deleteMany({});

    // Create creators
    const createdCreators = await Promise.all(
        CREATORS.map((creator) =>
            prisma.trendingCreator.create({
                data: {
                    name: creator.name,
                    occupation: creator.occupation,
                    followerCount: creator.followerCount,
                    image: creator.image,
                    bio: `${creator.occupation} | Sharing insights about AI, productivity, and growth.`,
                },
            })
        )
    );

    console.log(`✅ Created ${createdCreators.length} creators`);

    // Create posts for each creator
    let totalPosts = 0;
    for (const creator of createdCreators) {
        // Each creator gets 3-5 posts
        const numPosts = Math.floor(Math.random() * 3) + 3;

        for (let i = 0; i < numPosts; i++) {
            const postTemplate = POST_CONTENTS[Math.floor(Math.random() * POST_CONTENTS.length)];

            // Random engagement metrics
            const baseLikes = Math.floor(Math.random() * 100000) + 5000;
            const likes = baseLikes;
            const comments = Math.floor(baseLikes * (Math.random() * 0.15 + 0.05)); // 5-20% of likes
            const reposts = Math.floor(baseLikes * (Math.random() * 0.1 + 0.02)); // 2-12% of likes
            const views = Math.floor(baseLikes * (Math.random() * 20 + 10)); // 10-30x likes

            // Outlier index based on engagement
            const engagementScore = likes + comments * 3 + reposts * 5;
            const outlierIndex = Math.min(Math.floor((engagementScore / 500000) * 100), 100);

            // Random date within last 6 months
            const publishedDate = new Date();
            publishedDate.setDate(publishedDate.getDate() - Math.floor(Math.random() * 180));

            await prisma.trendingPost.create({
                data: {
                    creatorId: creator.id,
                    content: postTemplate.content,
                    mediaType: postTemplate.mediaType,
                    mediaUrl: postTemplate.mediaType !== 'NONE'
                        ? `https://picsum.photos/seed/${Math.random()}/800/600`
                        : null,
                    likes,
                    comments,
                    reposts,
                    views,
                    outlierIndex,
                    publishedDate,
                    keywords: postTemplate.keywords,
                },
            });

            totalPosts++;
        }
    }

    console.log(`✅ Created ${totalPosts} trending posts`);
    console.log('🎉 Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
