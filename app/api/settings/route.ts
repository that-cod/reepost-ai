/**
 * Settings API
 * GET /api/settings - Get user settings
 * PATCH /api/settings - Update user settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse } from '@/lib/errors';
import { Tone, Intensity } from '@prisma/client';

/**
 * GET /api/settings
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    let settings = await prisma.settings.findUnique({
      where: { userId: user.id },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: user.id,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode,
    });
  }
}

const updateSettingsSchema = z.object({
  autoPublish: z.boolean().optional(),
  defaultScheduleTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  preferredAiProvider: z.enum(['openai', 'anthropic']).optional(),
  defaultTone: z.nativeEnum(Tone).optional(),
  defaultIntensity: z.nativeEnum(Intensity).optional(),
  emailNotifications: z.boolean().optional(),
  publishNotifications: z.boolean().optional(),
  engagementNotifications: z.boolean().optional(),
  autoSyncEngagement: z.boolean().optional(),
  syncFrequency: z.number().min(15).max(1440).optional(), // 15 min to 24 hours
});

/**
 * PATCH /api/settings
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = updateSettingsSchema.parse(body);

    const settings = await prisma.settings.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        ...data,
      },
    });

    // Also update user's default tone/intensity if provided
    if (data.defaultTone || data.defaultIntensity) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          defaultTone: data.defaultTone,
          defaultIntensity: data.defaultIntensity,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            message: error.errors[0].message,
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
