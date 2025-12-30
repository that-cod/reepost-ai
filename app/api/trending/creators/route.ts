/**
 * Trending Creators API with Mock Data (Temporary)
 * GET /api/trending/creators - Get all creators for filtering
 */

import { NextResponse } from 'next/server';
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
        _count: { trendingPosts: 3 },
    },
    {
        id: '2',
        name: 'Charlie Hills',
        occupation: "The AI Creators' Club - Jan 5th 2026",
        followerCount: 42000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
        _count: { trendingPosts: 5 },
    },
    {
        id: '3',
        name: 'MJ Jaindl',
        occupation: 'Helping CEOs grow their business with AI',
        followerCount: 28000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mj',
        _count: { trendingPosts: 4 },
    },
    {
        id: '4',
        name: 'Axelle Malek',
        occupation: 'Daily post to fight your FOMO on AI',
        followerCount: 35000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=axelle',
        _count: { trendingPosts: 4 },
    },
    {
        id: '5',
        name: 'Ruben Hassid',
        occupation: 'AI Tools & Productivity Expert',
        followerCount: 89000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ruben',
        _count: { trendingPosts: 6 },
    },
    {
        id: '6',
        name: 'Sarah Chen',
        occupation: 'Product Designer | UX Strategy',
        followerCount: 62000,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        _count: { trendingPosts: 5 },
    },
];

export async function GET() {
    try {
        await requireAuth();

        return NextResponse.json({
            creators: MOCK_CREATORS,
            total: MOCK_CREATORS.length,
        });
    } catch (error) {
        const errorResponse = formatErrorResponse(error as Error);
        return NextResponse.json(errorResponse, {
            status: errorResponse.error.statusCode,
        });
    }
}
