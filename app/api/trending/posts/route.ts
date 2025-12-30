/**
 * Trending Posts API with Mock Data (20 Posts)
 * GET /api/trending/posts - Get filtered trending posts
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse } from '@/lib/errors';

// Mock data for testing without database
const MOCK_CREATORS = [
    {
        id: '1',
        name: 'Sahil Chandani',
        occupation: 'Student at Jaipur Engineering College and Research Centre',
        followerCount: 15000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sahil',
    },
    {
        id: '2',
        name: 'Charlie Hills',
        occupation: "The AI Creators' Club - Jan 5th 2026",
        followerCount: 42000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
    },
    {
        id: '3',
        name: 'MJ Jaindl',
        occupation: 'Helping CEOs grow their business with AI',
        followerCount: 28000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mj',
    },
    {
        id: '4',
        name: 'Axelle Malek',
        occupation: 'Daily post to fight your FOMO on AI',
        followerCount: 35000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=axelle',
    },
    {
        id: '5',
        name: 'Ruben Hassid',
        occupation: 'AI Tools & Productivity Expert',
        followerCount: 89000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ruben',
    },
    {
        id: '6',
        name: 'Sarah Chen',
        occupation: 'Product Designer | UX Strategy',
        followerCount: 62000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    },
];

const MOCK_POSTS = [
    {
        id: '1',
        creatorId: '5',
        content: `Your AI knowledge stops at ChatGPT.

Staying on top of AI = Staying on top of tools.

Go to how-to-ai.guide to master AI.`,
        mediaType: 'IMAGE',
        mediaUrl: 'https://picsum.photos/seed/1/800/600',
        likes: 125620,
        comments: 1513,
        reposts: 9284,
        views: 1500000,
        outlierIndex: 95,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        keywords: ['AI', 'ChatGPT', 'tools'],
    },
    {
        id: '2',
        creatorId: '5',
        content: `You think AI tools are useless. Think again.

I am aging a woman from 5 to 95 years old.

Everything is AI-made. Here's how.`,
        mediaType: 'VIDEO',
        mediaUrl: 'https://picsum.photos/seed/2/800/600',
        likes: 45110,
        comments: 892,
        reposts: 1205,
        views: 850000,
        outlierIndex: 78,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        keywords: ['AI', 'tools', 'aging'],
    },
    {
        id: '3',
        creatorId: '4',
        content: `This is the single best Veo 3 video I've seen.

This video is 100% AI-generated.

Hashem Al-Ghaili made this video and called it:`,
        mediaType: 'VIDEO',
        mediaUrl: 'https://picsum.photos/seed/3/800/600',
        likes: 21164,
        comments: 334,
        reposts: 357,
        views: 320000,
        outlierIndex: 65,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
        keywords: ['Veo', 'AI', 'video'],
    },
    {
        id: '4',
        creatorId: '2',
        content: `Most people guess LinkedIn.

But ChatGPT can help you analyze it.

Here are 10 AI tools that will change your workflow forever:`,
        mediaType: 'DOCUMENT',
        mediaUrl: 'https://picsum.photos/seed/4/800/600',
        likes: 16530,
        comments: 245,
        reposts: 423,
        views: 280000,
        outlierIndex: 58,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
        keywords: ['LinkedIn', 'ChatGPT', 'productivity'],
    },
    {
        id: '5',
        creatorId: '6',
        content: `The future of AI is not what you think.

I spent 100 hours researching the latest trends.

Here's what I discovered about the next generation of AI tools:`,
        mediaType: 'IMAGE',
        mediaUrl: 'https://picsum.photos/seed/5/800/600',
        likes: 34200,
        comments: 567,
        reposts: 892,
        views: 520000,
        outlierIndex: 72,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        keywords: ['AI', 'future', 'trends'],
    },
    {
        id: '6',
        creatorId: '1',
        content: `Stop using outdated productivity hacks.

These 7 AI-powered methods are 10x more effective.

Thread 🧵👇`,
        mediaType: 'NONE',
        mediaUrl: null,
        likes: 8950,
        comments: 123,
        reposts: 234,
        views: 145000,
        outlierIndex: 42,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
        keywords: ['productivity', 'AI', 'hacks'],
    },
    {
        id: '7',
        creatorId: '3',
        content: `I analyzed 1000+ viral LinkedIn posts.

Here are the 5 patterns that get the most engagement:

1. Start with a bold statement
2. Use short sentences
3. Add visual breaks
4. Include actionable insights
5. End with a strong CTA`,
        mediaType: 'IMAGE',
        mediaUrl: 'https://picsum.photos/seed/7/800/600',
        likes: 52340,
        comments: 823,
        reposts: 1456,
        views: 780000,
        outlierIndex: 85,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        keywords: ['LinkedIn', 'viral', 'engagement'],
    },
    {
        id: '8',
        creatorId: '6',
        content: `AI replaced my entire design workflow.

What used to take 5 hours now takes 30 minutes.

Here's my complete AI design stack:`,
        mediaType: 'VIDEO',
        mediaUrl: 'https://picsum.photos/seed/8/800/600',
        likes: 28750,
        comments: 445,
        reposts: 672,
        views: 425000,
        outlierIndex: 68,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
        keywords: ['AI', 'design', 'workflow'],
    },
    {
        id: '9',
        creatorId: '2',
        content: `The AI revolution is happening NOW.

And most people are sleeping on it.

Here are 12 AI tools you need to try this week:`,
        mediaType: 'DOCUMENT',
        mediaUrl: 'https://picsum.photos/seed/9/800/600',
        likes: 19840,
        comments: 312,
        reposts: 524,
        views: 310000,
        outlierIndex: 61,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        keywords: ['AI', 'tools', 'revolution'],
    },
    {
        id: '10',
        creatorId: '4',
        content: `I built a startup using only AI tools.

Zero developers. Zero designers.

Revenue: $50K/month.

Here's how I did it:`,
        mediaType: 'IMAGE',
        mediaUrl: 'https://picsum.photos/seed/10/800/600',
        likes: 76500,
        comments: 1234,
        reposts: 2345,
        views: 1250000,
        outlierIndex: 92,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        keywords: ['startup', 'AI', 'revenue'],
    },
    {
        id: '11',
        creatorId: '1',
        content: `5 LinkedIn growth hacks that actually work in 2024.

I went from 500 to 50K followers in 6 months.

Here's the exact strategy I used:`,
        mediaType: 'IMAGE',
        mediaUrl: 'https://picsum.photos/seed/11/800/600',
        likes: 42300,
        comments: 678,
        reposts: 1123,
        views: 680000,
        outlierIndex: 81,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        keywords: ['LinkedIn', 'growth', 'strategy'],
    },
    {
        id: '12',
        creatorId: '3',
        content: `The biggest mistake I see entrepreneurs make:

They focus on products, not problems.

Here's how to shift your mindset and 10x your business:`,
        mediaType: 'NONE',
        mediaUrl: null,
        likes: 15670,
        comments: 234,
        reposts: 445,
        views: 245000,
        outlierIndex: 55,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
        keywords: ['entrepreneurship', 'business', 'mindset'],
    },
    {
        id: '13',
        creatorId: '6',
        content: `I spent $10K testing every AI design tool.

Only 3 are worth your money.

Let me save you time and money:`,
        mediaType: 'VIDEO',
        mediaUrl: 'https://picsum.photos/seed/13/800/600',
        likes: 38900,
        comments: 545,
        reposts: 823,
        views: 595000,
        outlierIndex: 74,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
        keywords: ['AI', 'design', 'tools', 'review'],
    },
    {
        id: '14',
        creatorId: '2',
        content: `Your content isn't reaching anyone.

Here's why (and how to fix it):

🔸 Algorithm changes you need to know
🔸 Posting times that actually matter  
🔸 Engagement tactics that work`,
        mediaType: 'DOCUMENT',
        mediaUrl: 'https://picsum.photos/seed/14/800/600',
        likes: 24500,
        comments: 387,
        reposts: 612,
        views: 385000,
        outlierIndex: 67,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(),
        keywords: ['content', 'algorithm', 'engagement'],
    },
    {
        id: '15',
        creatorId: '5',
        content: `AI just replaced my entire marketing team.

Sounds scary? It's actually amazing.

Here's how we're now 5x more productive with 1/10th the cost:`,
        mediaType: 'IMAGE',
        mediaUrl: 'https://picsum.photos/seed/15/800/600',
        likes: 67800,
        comments: 1045,
        reposts: 1876,
        views: 1100000,
        outlierIndex: 89,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        keywords: ['AI', 'marketing', 'productivity'],
    },
    {
        id: '16',
        creatorId: '4',
        content: `Everyone talks about work-life balance.

Nobody talks about work-life integration.

Here's the difference (and why it matters):`,
        mediaType: 'NONE',
        mediaUrl: null,
        likes: 12340,
        comments: 189,
        reposts: 334,
        views: 198000,
        outlierIndex: 48,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16).toISOString(),
        keywords: ['work', 'life', 'balance'],
    },
    {
        id: '17',
        creatorId: '1',
        content: `I interviewed 100 successful LinkedIn creators.

They all had these 7 things in common.

Thread on what makes content go viral 👇`,
        mediaType: 'IMAGE',
        mediaUrl: 'https://picsum.photos/seed/17/800/600',
        likes: 58200,
        comments: 912,
        reposts: 1534,
        views: 890000,
        outlierIndex: 86,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        keywords: ['LinkedIn', 'creators', 'viral'],
    },
    {
        id: '18',
        creatorId: '3',
        content: `The SaaS pricing model is broken.

Here's the new model that's taking over:

Value-based pricing explained in 5 minutes`,
        mediaType: 'VIDEO',
        mediaUrl: 'https://picsum.photos/seed/18/800/600',
        likes: 31200,
        comments: 478,
        reposts: 756,
        views: 485000,
        outlierIndex: 71,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
        keywords: ['SaaS', 'pricing', 'business'],
    },
    {
        id: '19',
        creatorId: '6',
        content: `Designers: Stop using Figma for everything.

These 5 AI tools will change how you work:

1. Midjourney for concepts
2. Runway for animations  
3. ChatGPT for copy
4. Framer for websites
5. Notion AI for docs`,
        mediaType: 'DOCUMENT',
        mediaUrl: 'https://picsum.photos/seed/19/800/600',
        likes: 44600,
        comments: 689,
        reposts: 1087,
        views: 695000,
        outlierIndex: 79,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
        keywords: ['design', 'AI', 'tools', 'Figma'],
    },
    {
        id: '20',
        creatorId: '2',
        content: `I quit my $200K job to build in public.

6 months later, I'm making $80K/month.

Here's everything I learned about building an audience:`,
        mediaType: 'IMAGE',
        mediaUrl: 'https://picsum.photos/seed/20/800/600',
        likes: 98700,
        comments: 1567,
        reposts: 2678,
        views: 1600000,
        outlierIndex: 97,
        publishedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        keywords: ['building', 'public', 'entrepreneurship'],
    },
];

export async function GET(req: NextRequest) {
    try {
        await requireAuth();
        const { searchParams } = new URL(req.url);

        // Pagination
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Basic filters
        const searchQuery = searchParams.get('search')?.toLowerCase() || '';
        const creatorIds = searchParams.get('creatorIds')?.split(',').filter(Boolean) || [];
        const timeframe = searchParams.get('timeframe') || 'all';

        // Advanced filters
        const dateStart = searchParams.get('dateStart');
        const dateEnd = searchParams.get('dateEnd');
        const outlierMin = parseInt(searchParams.get('outlierMin') || '0');
        const outlierMax = parseInt(searchParams.get('outlierMax') || '100');
        const mediaType = searchParams.get('mediaType') || 'all';
        const likesMin = searchParams.get('likesMin') ? parseInt(searchParams.get('likesMin')!) : null;
        const likesMax = searchParams.get('likesMax') ? parseInt(searchParams.get('likesMax')!) : null;
        const commentsMin = searchParams.get('commentsMin') ? parseInt(searchParams.get('commentsMin')!) : null;
        const commentsMax = searchParams.get('commentsMax') ? parseInt(searchParams.get('commentsMax')!) : null;
        const repostsMin = searchParams.get('repostsMin') ? parseInt(searchParams.get('repostsMin')!) : null;
        const repostsMax = searchParams.get('repostsMax') ? parseInt(searchParams.get('repostsMax')!) : null;
        const excludeKeywords = searchParams.get('excludeKeywords')?.split(',').filter(Boolean).map(k => k.toLowerCase()) || [];

        // Filter posts
        let filteredPosts = MOCK_POSTS.filter(post => {
            // Creator filter
            if (creatorIds.length > 0 && !creatorIds.includes(post.creatorId)) {
                return false;
            }

            // Search filter
            if (searchQuery && !post.content.toLowerCase().includes(searchQuery)) {
                return false;
            }

            // Date filters
            const postDate = new Date(post.publishedDate);
            const now = new Date();

            if (timeframe !== 'all') {
                let dateThreshold = new Date();
                switch (timeframe) {
                    case 'last7':
                        dateThreshold.setDate(now.getDate() - 7);
                        break;
                    case 'last30':
                        dateThreshold.setDate(now.getDate() - 30);
                        break;
                    case 'last3months':
                        dateThreshold.setMonth(now.getMonth() - 3);
                        break;
                    case 'last6months':
                        dateThreshold.setMonth(now.getMonth() - 6);
                        break;
                    case 'thisyear':
                        dateThreshold = new Date(now.getFullYear(), 0, 1);
                        break;
                }
                if (postDate < dateThreshold) {
                    return false;
                }
            }

            // Custom date range
            if (dateStart && postDate < new Date(dateStart)) {
                return false;
            }
            if (dateEnd) {
                const endDate = new Date(dateEnd);
                endDate.setHours(23, 59, 59, 999);
                if (postDate > endDate) {
                    return false;
                }
            }

            // Outlier index
            if (post.outlierIndex < outlierMin || post.outlierIndex > outlierMax) {
                return false;
            }

            // Media type
            if (mediaType !== 'all' && post.mediaType.toLowerCase() !== mediaType.toLowerCase()) {
                return false;
            }

            // Engagement filters
            if (likesMin !== null && post.likes < likesMin) return false;
            if (likesMax !== null && post.likes > likesMax) return false;
            if (commentsMin !== null && post.comments < commentsMin) return false;
            if (commentsMax !== null && post.comments > commentsMax) return false;
            if (repostsMin !== null && post.reposts < repostsMin) return false;
            if (repostsMax !== null && post.reposts > repostsMax) return false;

            // Exclude keywords
            if (excludeKeywords.length > 0) {
                const contentLower = post.content.toLowerCase();
                if (excludeKeywords.some(keyword => contentLower.includes(keyword))) {
                    return false;
                }
            }

            return true;
        });

        // Sort by outlier index and likes
        filteredPosts.sort((a, b) => {
            if (b.outlierIndex !== a.outlierIndex) {
                return b.outlierIndex - a.outlierIndex;
            }
            return b.likes - a.likes;
        });

        // Paginate
        const paginatedPosts = filteredPosts.slice(offset, offset + limit);

        // Add creator info to posts
        const postsWithCreators = paginatedPosts.map(post => ({
            ...post,
            creator: MOCK_CREATORS.find(c => c.id === post.creatorId)!,
        }));

        return NextResponse.json({
            posts: postsWithCreators,
            total: filteredPosts.length,
            limit,
            offset,
            hasMore: offset + limit < filteredPosts.length,
        });
    } catch (error) {
        const errorResponse = formatErrorResponse(error as Error);
        return NextResponse.json(errorResponse, {
            status: errorResponse.error.statusCode,
        });
    }
}
