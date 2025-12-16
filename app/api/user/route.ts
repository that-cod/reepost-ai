/**
 * User API
 * GET /api/user - Get current user profile
 * PATCH /api/user - Update user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse } from '@/lib/errors';

/**
 * GET /api/user - Get current user profile
 */
export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth();

        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                linkedInId: true,
                linkedInUsername: true,
                linkedInUrn: true,
                plan: true,
                defaultTone: true,
                defaultIntensity: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(userData);
    } catch (error) {
        const errorResponse = formatErrorResponse(error as Error);
        return NextResponse.json(errorResponse, {
            status: errorResponse.error.statusCode,
        });
    }
}

const updateUserSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    image: z.string().url().optional(),
    linkedInUsername: z.string().optional(),
});

/**
 * PATCH /api/user - Update user profile
 */
export async function PATCH(req: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await req.json();
        const data = updateUserSchema.parse(body);

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.image && { image: data.image }),
                ...(data.linkedInUsername && { linkedInUsername: data.linkedInUsername }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                linkedInUsername: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: {
                        message: error.issues[0].message,
                        code: 'VALIDATION_ERROR',
                        statusCode: 400,
                    },
                },
                { status: 400 }
            );
        }

        const errorResponse = formatErrorResponse(error);
        return NextResponse.json(errorResponse, {
            status: errorResponse.error.statusCode,
        });
    }
}
