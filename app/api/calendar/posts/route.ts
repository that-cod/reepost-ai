import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { nanoid } from 'nanoid';

// GET - Fetch all scheduled posts for the current user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all scheduled and draft posts
        const posts = await prisma.post.findMany({
            where: {
                userId: session.user.id,
                status: {
                    in: ['DRAFT', 'SCHEDULED']
                },
                scheduledFor: {
                    not: null
                }
            },
            orderBy: {
                scheduledFor: 'asc'
            },
            select: {
                id: true,
                content: true,
                scheduledFor: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return NextResponse.json({
            success: true,
            posts,
            total: posts.length
        });

    } catch (error) {
        console.error('Error fetching scheduled posts:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch scheduled posts',
                posts: []
            },
            { status: 500 }
        );
    }
}

// POST - Create a new scheduled post
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { content, scheduledFor } = await request.json();

        // Validate input
        if (!content || !content.trim()) {
            return NextResponse.json(
                { error: "Post content is required" },
                { status: 400 }
            );
        }

        if (!scheduledFor) {
            return NextResponse.json(
                { error: "Schedule date is required" },
                { status: 400 }
            );
        }

        // Validate that scheduled date is in the future
        const scheduledDate = new Date(scheduledFor);
        if (scheduledDate < new Date()) {
            return NextResponse.json(
                { error: "Cannot schedule posts in the past" },
                { status: 400 }
            );
        }

        // Create the post
        const post = await prisma.post.create({
            data: {
                id: nanoid(),
                userId: session.user.id,
                content: content.trim(),
                scheduledFor: scheduledDate,
                status: 'SCHEDULED',
                updatedAt: new Date(),
                mediaUrls: []
            }
        });

        return NextResponse.json({
            success: true,
            message: "Post scheduled successfully",
            post
        });

    } catch (error) {
        console.error('Error creating scheduled post:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to schedule post'
            },
            { status: 500 }
        );
    }
}

// DELETE - Remove a scheduled post
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const postId = searchParams.get('postId');

        if (!postId) {
            return NextResponse.json(
                { error: "Post ID is required" },
                { status: 400 }
            );
        }

        // Verify the post belongs to the user
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            );
        }

        if (post.userId !== session.user.id) {
            return NextResponse.json(
                { error: "You don't have permission to delete this post" },
                { status: 403 }
            );
        }

        // Delete the post
        await prisma.post.delete({
            where: { id: postId }
        });

        return NextResponse.json({
            success: true,
            message: "Post removed successfully"
        });

    } catch (error) {
        console.error('Error deleting scheduled post:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete post'
            },
            { status: 500 }
        );
    }
}

// PATCH - Update a scheduled post
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { postId, content, scheduledFor } = await request.json();

        if (!postId) {
            return NextResponse.json(
                { error: "Post ID is required" },
                { status: 400 }
            );
        }

        // Verify the post belongs to the user
        const existingPost = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!existingPost) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            );
        }

        if (existingPost.userId !== session.user.id) {
            return NextResponse.json(
                { error: "You don't have permission to update this post" },
                { status: 403 }
            );
        }

        // Build update data
        const updateData: any = {
            updatedAt: new Date()
        };

        if (content !== undefined) {
            updateData.content = content.trim();
        }

        if (scheduledFor !== undefined) {
            const scheduledDate = new Date(scheduledFor);
            if (scheduledDate < new Date()) {
                return NextResponse.json(
                    { error: "Cannot schedule posts in the past" },
                    { status: 400 }
                );
            }
            updateData.scheduledFor = scheduledDate;
        }

        // Update the post
        const post = await prisma.post.update({
            where: { id: postId },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            message: "Post updated successfully",
            post
        });

    } catch (error) {
        console.error('Error updating scheduled post:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update post'
            },
            { status: 500 }
        );
    }
}
