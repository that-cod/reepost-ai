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

    // Also get user data for linkedInProfileUrl
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        linkedInProfileUrl: true,
      },
    });

    return NextResponse.json({
      ...settings,
      linkedInProfileUrl: userData?.linkedInProfileUrl || '',
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
  linkedInProfileUrl: z.string().optional(),

  // Publishing preferences
  autoPublish: z.boolean().optional(),
  defaultScheduleTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),

  // AI preferences
  preferredAiProvider: z.enum(['openai', 'anthropic']).optional(),
  defaultTone: z.nativeEnum(Tone).optional(),
  defaultIntensity: z.nativeEnum(Intensity).optional(),
  aiToneText: z.string().optional(),
  contentLength: z.enum(['short', 'medium', 'long']).optional(),
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

    // Extract linkedInProfileUrl to update on User model
    const { linkedInProfileUrl, ...settingsData } = data;

    // Update settings
    const settings = await prisma.settings.upsert({
      where: { userId: user.id },
      update: settingsData,
      create: {
        userId: user.id,
        ...settingsData,
      },
    });

    // Update user's linkedInProfileUrl and default tone/intensity
    const userUpdateData: Record<string, unknown> = {};

    if (linkedInProfileUrl !== undefined) {
      userUpdateData.linkedInProfileUrl = linkedInProfileUrl;
    }
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

    return NextResponse.json({
      ...settings,
      linkedInProfileUrl: linkedInProfileUrl || '',
    });
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

