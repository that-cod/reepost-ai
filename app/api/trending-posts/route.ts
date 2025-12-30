import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Get filter parameters
        const sortBy = searchParams.get('sortBy') || 'outlier';
        const mediaType = searchParams.get('mediaType');
        const dayOfWeek = searchParams.get('dayOfWeek');
        const postType = searchParams.get('postType');
        const minEngagement = searchParams.get('minEngagement');
        const hasQuestion = searchParams.get('hasQuestion');
        const hasCTA = searchParams.get('hasCTA');
        const followedOnly = searchParams.get('followedOnly') === 'true';
        const limit = parseInt(searchParams.get('limit') || '50');

        // Get session to check for followed creators filter
        const session = await getServerSession(authOptions);

        // Build where clause
        const where: any = {};

        // Filter by followed creators if requested and user is authenticated
        if (followedOnly && session?.user?.id) {
            const followedCreators = await prisma.followedCreator.findMany({
                where: { userId: session.user.id },
                select: { creatorId: true }
            });

            if (followedCreators.length > 0) {
                where.creatorId = {
                    in: followedCreators.map(fc => fc.creatorId)
                };
            } else {
                // No followed creators, return empty result
                return NextResponse.json({
                    success: true,
                    posts: [],
                    total: 0,
                    stats: {
                        totalPosts: 0,
                        withQuestions: 0,
                        withCTA: 0,
                        highVirality: 0,
                    }
                });
            }
        }

        if (mediaType && mediaType !== 'all') {
            where.mediaType = mediaType;
        }

        if (dayOfWeek && dayOfWeek !== 'all') {
            where.postedDayOfWeek = dayOfWeek;
        }

        if (postType && postType !== 'all') {
            where.postType = postType;
        }

        if (hasQuestion === 'true') {
            where.hasQuestion = true;
        }

        if (hasCTA === 'true') {
            where.hasCallToAction = true;
        }

        if (minEngagement) {
            const minScore = parseInt(minEngagement);
            where.outlierIndex = {
                gte: minScore
            };
        }

        // Build orderBy clause
        let orderBy: any = {};
        switch (sortBy) {
            case 'engagement':
                // Sort by likes (primary engagement metric)
                orderBy = { likes: 'desc' };
                break;
            case 'latest':
                orderBy = { publishedDate: 'desc' };
                break;
            case 'outlier':
            default:
                orderBy = { outlierIndex: 'desc' };
                break;
        }

        // Fetch posts with creator information
        const posts = await prisma.trendingPost.findMany({
            where,
            orderBy,
            take: limit,
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        headline: true,
                        image: true,
                        linkedinUrl: true,
                        followerCount: true,
                    }
                }
            }
        });

        // Get total stats from entire database (not just current page)
        const [totalCount, totalWithQuestions, totalWithCTA, totalHighVirality] = await Promise.all([
            prisma.trendingPost.count({ where }),
            prisma.trendingPost.count({ where: { ...where, hasQuestion: true } }),
            prisma.trendingPost.count({ where: { ...where, hasCallToAction: true } }),
            prisma.trendingPost.count({ where: { ...where, outlierIndex: { gte: 70 } } }),
        ]);

        return NextResponse.json({
            success: true,
            posts,
            total: posts.length,
            stats: {
                totalPosts: totalCount,
                withQuestions: totalWithQuestions,
                withCTA: totalWithCTA,
                highVirality: totalHighVirality,
            }
        });

    } catch (error) {
        console.error('Error fetching trending posts:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch trending posts',
                posts: []
            },
            { status: 500 }
        );
    }
}
