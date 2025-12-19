/**
 * Cron endpoint to update expired scheduled posts
 * Runs periodically to automatically transition SCHEDULED posts to PUBLISHED
 * 
 * Usage:
 * - Vercel Cron: Configure in vercel.json
 * - Manual: GET /api/cron/update-scheduled-posts with valid CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateExpiredScheduledPosts } from '@/lib/posts/updateScheduledPosts';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
    try {
        // Verify authorization - either cron secret or being called from Vercel Cron
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // Check if request is from Vercel Cron (has specific headers)
        const isVercelCron = req.headers.get('x-vercel-cron') === '1';

        // Allow if from Vercel Cron, or if auth header matches secret
        if (!isVercelCron && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
            logger.warn('Unauthorized cron attempt', {
                hasAuthHeader: !!authHeader,
                isVercelCron,
            });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update expired scheduled posts
        const updatedCount = await updateExpiredScheduledPosts();

        logger.info('Cron job completed: update-scheduled-posts', {
            updatedCount,
            isVercelCron,
        });

        return NextResponse.json({
            success: true,
            updatedPosts: updatedCount,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error('Cron job failed: update-scheduled-posts', error as Error);

        return NextResponse.json(
            {
                success: false,
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
