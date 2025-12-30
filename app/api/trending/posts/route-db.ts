/**
 * Trending Posts API with Database Integration
 * GET /api/trending/posts - Get filtered trending posts from database
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

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

        // Build where clause
        const where: any = {
            AND: []
        };

        // Creator filter
        if (creatorIds.length > 0) {
            where.AND.push({
                creatorId: { in: creatorIds }
            });
        }

        // Search filter
        if (searchQuery) {
            where.AND.push({
                content: {
                    contains: searchQuery,
                    mode: 'insensitive'
                }
            });
        }

        // Date filters
        if (timeframe !== 'all') {
            const now = new Date();
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

            where.AND.push({
                publishedDate: { gte: dateThreshold }
            });
        }

        // Custom date range
        if (dateStart) {
            where.AND.push({
                publishedDate: { gte: new Date(dateStart) }
            });
        }

        if (dateEnd) {
            const endDate = new Date(dateEnd);
            endDate.setHours(23, 59, 59, 999);
            where.AND.push({
                publishedDate: { lte: endDate }
            });
        }

        // Outlier index
        where.AND.push({
            outlierIndex: {
                gte: outlierMin,
                lte: outlierMax
            }
        });

        // Media type
        if (mediaType !== 'all') {
            where.AND.push({
                mediaType: mediaType.toUpperCase()
            });
        }

        // Engagement filters
        if (likesMin !== null) {
            where.AND.push({ likes: { gte: likesMin } });
        }
        if (likesMax !== null) {
            where.AND.push({ likes: { lte: likesMax } });
        }
        if (commentsMin !== null) {
            where.AND.push({ comments: { gte: commentsMin } });
        }
        if (commentsMax !== null) {
            where.AND.push({ comments: { lte: commentsMax } });
        }
        if (repostsMin !== null) {
            where.AND.push({ reposts: { gte: repostsMin } });
        }
        if (repostsMax !== null) {
            where.AND.push({ reposts: { lte: repostsMax } });
        }

        // Exclude keywords - filter out posts that contain any of the excluded keywords
        if (excludeKeywords.length > 0) {
            where.AND.push({
                keywords: {
                    none: {
                        in: excludeKeywords
                    }
                }
            });
        }

        // Fetch posts
        const [posts, total] = await Promise.all([
            prisma.trendingPost.findMany({
                where: where.AND.length > 0 ? where : undefined,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            occupation: true,
                            followerCount: true,
                        },
                    },
                },
                orderBy: [
                    { outlierIndex: 'desc' },
                    { likes: 'desc' },
                    { publishedDate: 'desc' },
                ],
                skip: offset,
                take: limit,
            }),
            prisma.trendingPost.count({
                where: where.AND.length > 0 ? where : undefined,
            })
        ]);

        const hasMore = offset + limit < total;

        return NextResponse.json({
            posts,
            total,
            limit,
            offset,
            hasMore,
        });
    } catch (error) {
        console.error('Trending posts API error:', error);
        const errorResponse = formatErrorResponse(error as Error);
        return NextResponse.json(errorResponse, {
            status: errorResponse.error.statusCode,
        });
    }
}
