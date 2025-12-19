/**
 * Utility functions for managing posts
 */

import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

/**
 * Update expired scheduled posts to published status
 * Posts with scheduledFor <= now will be marked as PUBLISHED
 * 
 * @returns Number of posts updated
 */
export async function updateExpiredScheduledPosts(): Promise<number> {
    try {
        const now = new Date();

        const result = await prisma.post.updateMany({
            where: {
                status: 'SCHEDULED',
                scheduledFor: {
                    lte: now, // scheduled time is less than or equal to now
                },
            },
            data: {
                status: 'PUBLISHED',
                publishedAt: now,
            },
        });

        if (result.count > 0) {
            logger.info(`Updated ${result.count} expired scheduled posts to PUBLISHED`, {
                updatedCount: result.count,
                timestamp: now.toISOString(),
            });
        }

        return result.count;
    } catch (error) {
        logger.error('Failed to update expired scheduled posts', error as Error);
        throw error;
    }
}

/**
 * Get posts that are scheduled to be published soon (next 24 hours)
 * Useful for notifications and scheduling UI
 */
export async function getUpcomingScheduledPosts(userId: string, hoursAhead: number = 24) {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    return prisma.post.findMany({
        where: {
            userId,
            status: 'SCHEDULED',
            scheduledFor: {
                gte: now,
                lte: futureTime,
            },
        },
        orderBy: {
            scheduledFor: 'asc',
        },
    });
}
