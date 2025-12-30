import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch posts scheduled in the next 24 hours
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();
        const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Fetch posts scheduled in the next 24 hours
        const posts = await prisma.post.findMany({
            where: {
                userId: session.user.id,
                status: 'SCHEDULED',
                scheduledFor: {
                    gte: now,
                    lte: next24Hours
                }
            },
            orderBy: {
                scheduledFor: 'asc'
            },
            select: {
                id: true,
                content: true,
                scheduledFor: true,
            },
            take: 5 // Limit to 5 upcoming posts
        });

        return NextResponse.json({
            success: true,
            posts,
            total: posts.length
        });

    } catch (error) {
        console.error('Error fetching upcoming posts:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch upcoming posts',
                posts: []
            },
            { status: 500 }
        );
    }
}
