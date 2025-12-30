/**
 * Creators List API with Database Integration
 * GET /api/creators/list - Get all creators from database
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        await requireAuth();

        const creators = await prisma.trendingCreator.findMany({
            include: {
                _count: {
                    select: {
                        trendingPosts: true
                    }
                }
            },
            orderBy: {
                followerCount: 'desc'
            }
        });

        return NextResponse.json({
            creators,
            total: creators.length,
        });
    } catch (error) {
        console.error('Creators list API error:', error);
        const errorResponse = formatErrorResponse(error as Error);
        return NextResponse.json(errorResponse, {
            status: errorResponse.error.statusCode,
        });
    }
}
