/**
 * Stripe Customer Portal API
 * POST /api/billing/portal - Create portal session
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse, ValidationError } from '@/lib/errors';
import { createPortalSession } from '@/lib/stripe';

const portalSchema = z.object({
  returnUrl: z.string().url().optional(),
});

/**
 * POST /api/billing/portal
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = portalSchema.parse(body);

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    if (!dbUser?.stripeCustomerId) {
      throw new ValidationError('No active subscription found');
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    const session = await createPortalSession({
      customerId: dbUser.stripeCustomerId,
      returnUrl: data.returnUrl || `${appUrl}/settings`,
    });

    return NextResponse.json({
      url: session.url,
    });
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
