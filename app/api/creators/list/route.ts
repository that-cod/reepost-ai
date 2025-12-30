/**
 * Creators List API with Mock Data
 * GET /api/creators/list - Get all creators
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse } from '@/lib/errors';

// Mock creators data - reusing from trending
const MOCK_CREATORS = [
    {
        id: '1',
        name: 'Ruben Hassid',
        occupation: 'Master AI before it masters you',
        location: 'Tel Aviv District, Israel',
        industry: 'Computer Software',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ruben',
        bio: 'Master AI before it masters you',
        followerCount: 89000,
        isFollowing: true,
        linkedinUrl: 'https://www.linkedin.com/in/rubenhassid/',
    },
    {
        id: '2',
        name: 'Anisha Jain',
        occupation: 'How to write (better) with AI',
        location: 'London, England, United Kingdom',
        industry: 'Publishing',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anisha',
        bio: 'How to write (better) with AI.',
        followerCount: 45000,
        isFollowing: true,
        linkedinUrl: 'https://www.linkedin.com/in/anishajain/',
    },
    {
        id: '3',
        name: 'Axelle Malek',
        occupation: 'Daily post to fight your FOMO on AI',
        location: 'France',
        industry: 'Computer Software',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=axelle',
        bio: 'Daily post to fight your FOMO on AI',
        followerCount: 35000,
        isFollowing: true,
        linkedinUrl: 'https://www.linkedin.com/in/axellemalek/',
    },
    {
        id: '4',
        name: 'Charlie Hills',
        occupation: "The AI Creators' Club - Jan 5th 2026 | I help you create authentic AI content | ...",
        location: 'London, England',
        industry: 'Marketing & Advertising',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
        bio: "The AI Creators' Club - Jan 5th 2026 | I help you create authentic AI content",
        followerCount: 42000,
        isFollowing: true,
        linkedinUrl: 'https://www.linkedin.com/in/charliehills/',
    },
    {
        id: '5',
        name: 'MJ Jaindl',
        occupation: 'Helping CEOs grow their business with AI and smart e-commerce.',
        location: 'New York, New York, United States',
        industry: 'Computer Software',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mj',
        bio: 'Helping CEOs grow their business with AI and smart e-commerce.',
        followerCount: 28000,
        isFollowing: true,
        linkedinUrl: 'https://www.linkedin.com/in/mjjaindl/',
    },
    {
        id: '6',
        name: 'Sahil Chandani',
        occupation: 'Student at Jaipur Engineering College and Research Centre (JECRC)',
        location: 'Jaipur, Rajasthan, India',
        industry: 'Computer Software',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sahil',
        bio: 'Student at Jaipur Engineering College and Research Centre (JECRC)',
        followerCount: 15000,
        isFollowing: true,
        linkedinUrl: 'https://www.linkedin.com/in/sahilchandani/',
    },
    {
        id: '7',
        name: 'Pete Sena',
        occupation: "Your Chief AI Officer - I'll help you use AI to save time and money with you...",
        location: 'New Haven, Connecticut',
        industry: 'Information Technology & Services',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pete',
        bio: "Your Chief AI Officer - I'll help you use AI to save time and money with you",
        followerCount: 52000,
        isFollowing: false,
        linkedinUrl: 'https://www.linkedin.com/in/petesena/',
    },
    {
        id: '8',
        name: 'Luke Tobin',
        occupation: 'Entrepreneur, Advisor & Investor. Follow for daily posts on business & personal...',
        location: 'United Kingdom',
        industry: 'Management Consulting',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luke',
        bio: 'Entrepreneur, Advisor & Investor. Follow for daily posts on business & personal',
        followerCount: 78000,
        isFollowing: false,
        linkedinUrl: 'https://www.linkedin.com/in/luketobin/',
    },
    {
        id: '9',
        name: 'Sarah Chen',
        occupation: 'Product Designer | UX Strategy',
        location: 'San Francisco, California',
        industry: 'Design',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        bio: 'Product Designer helping startups build beautiful products',
        followerCount: 62000,
        isFollowing: false,
        linkedinUrl: 'https://www.linkedin.com/in/sarahchen/',
    },
    {
        id: '10',
        name: 'David Kim',
        occupation: 'Growth Marketing Expert',
        location: 'Austin, Texas',
        industry: 'Marketing & Advertising',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
        bio: 'Helping SaaS companies scale to $10M ARR',
        followerCount: 45000,
        isFollowing: false,
        linkedinUrl: 'https://www.linkedin.com/in/davidkim/',
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
