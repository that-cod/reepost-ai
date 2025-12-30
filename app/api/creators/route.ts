import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100');
        const search = searchParams.get('search') || '';

        // Build where clause for search
        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
                { headline: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Fetch creators with post count and followed status
        const creators = await prisma.trendingCreator.findMany({
            where,
            take: limit,
            orderBy: [
                { followerCount: 'desc' },
                { name: 'asc' }
            ],
            select: {
                id: true,
                name: true,
                username: true,
                headline: true,
                image: true,
                linkedinUrl: true,
                followerCount: true,
                _count: {
                    select: {
                        trendingPosts: true
                    }
                },
                followedBy: {
                    where: {
                        userId: session.user.id
                    },
                    select: {
                        id: true
                    }
                }
            }
        });

        // Format response
        const formattedCreators = creators.map(creator => ({
            id: creator.id,
            name: creator.name,
            username: creator.username,
            headline: creator.headline,
            image: creator.image,
            linkedinUrl: creator.linkedinUrl,
            followerCount: creator.followerCount,
            postCount: creator._count.trendingPosts,
            isFollowing: creator.followedBy.length > 0
        }));

        return NextResponse.json({
            success: true,
            creators: formattedCreators,
            total: formattedCreators.length
        });

    } catch (error) {
        console.error('Error fetching creators:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch creators',
                creators: []
            },
            { status: 500 }
        );
    }
}
