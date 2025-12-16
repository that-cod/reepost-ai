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

    // Get settings with user's linkedInProfileUrl
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

    // Also get user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        linkedInUsername: true,
      },
    });

    return NextResponse.json({
      ...settings,
      linkedInUsername: userData?.linkedInUsername || '',
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode,
    });
  }
}

const updateSettingsSchema = z.object({
  // Profile settings
  timezone: z.string().optional(),
  jobDescriptions: z.array(z.string()).optional(),

  // Publishing preferences
  autoPublish: z.boolean().optional(),
  defaultScheduleTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),

  // AI preferences
  preferredAiProvider: z.enum(['openai', 'anthropic']).optional(),
  defaultTone: z.nativeEnum(Tone).optional(),
  defaultIntensity: z.nativeEnum(Intensity).optional(),
  aiToneText: z.string().optional(),
  contentLength: z.string().optional(), // Accept any string, we'll normalize it
  emojiUsage: z.enum(['minimal', 'moderate', 'frequent']).optional(),
  hashtagCount: z.enum(['none', '1-2', '3-5', '6+']).optional(),

  // Content guidelines
  avoidControversial: z.boolean().optional(),
  professionalLanguage: z.boolean().optional(),
  includeCTA: z.boolean().optional(),

  // Notification preferences
  emailNotifications: z.boolean().optional(),
  publishNotifications: z.boolean().optional(),
  engagementNotifications: z.boolean().optional(),

  // LinkedIn preferences
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

    // Normalize contentLength to lowercase
    if (data.contentLength) {
      data.contentLength = data.contentLength.toLowerCase();
    }

    // Update settings
    const settings = await prisma.settings.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        ...data,
      },
    });

    // Update user's default tone/intensity if provided
    const userUpdateData: Record<string, unknown> = {};

    if (data.defaultTone) {
      userUpdateData.defaultTone = data.defaultTone;
    }
    if (data.defaultIntensity) {
      userUpdateData.defaultIntensity = data.defaultIntensity;
    }

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: userUpdateData,
      });
    }

    return NextResponse.json(settings);
  } catch (error: unknown) {
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

    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode,
    });
  }
}

