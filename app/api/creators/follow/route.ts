import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Follow a creator
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { creatorId } = await request.json();

        if (!creatorId) {
            return NextResponse.json({ error: "Creator ID is required" }, { status: 400 });
        }

        // Check if creator exists
        const creator = await prisma.trendingCreator.findUnique({
            where: { id: creatorId }
        });

        if (!creator) {
            return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        // Check if already following
        const existing = await prisma.followedCreator.findUnique({
            where: {
                userId_creatorId: {
                    userId: session.user.id,
                    creatorId: creatorId
                }
            }
        });

        if (existing) {
            return NextResponse.json({ error: "Already following this creator" }, { status: 400 });
        }

        // Create follow relationship
        const followed = await prisma.followedCreator.create({
            data: {
                userId: session.user.id,
                creatorId: creatorId
            }
        });

        return NextResponse.json({
            success: true,
            message: "Successfully followed creator",
            followed
        });

    } catch (error) {
        console.error('Error following creator:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to follow creator'
            },
            { status: 500 }
        );
    }
}

// Unfollow a creator
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const creatorId = searchParams.get('creatorId');

        if (!creatorId) {
            return NextResponse.json({ error: "Creator ID is required" }, { status: 400 });
        }

        // Delete follow relationship
        await prisma.followedCreator.deleteMany({
            where: {
                userId: session.user.id,
                creatorId: creatorId
            }
        });

        return NextResponse.json({
            success: true,
            message: "Successfully unfollowed creator"
        });

    } catch (error) {
        console.error('Error unfollowing creator:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to unfollow creator'
            },
            { status: 500 }
        );
    }
}
