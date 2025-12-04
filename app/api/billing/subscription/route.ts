/**
 * Subscription API
 * GET /api/billing/subscription - Get current subscription
 * DELETE /api/billing/subscription - Cancel subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { formatErrorResponse, ValidationError } from '@/lib/errors';
import { cancelSubscription, hasActiveSubscription } from '@/lib/stripe';

/**
 * GET /api/billing/subscription
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        plan: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!dbUser) {
      throw new Error('User not found');
    }

    const active = await hasActiveSubscription(user.id);

    return NextResponse.json({
      plan: dbUser.plan,
      subscriptionId: dbUser.stripeSubscriptionId,
      priceId: dbUser.stripePriceId,
      currentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
      isActive: active,
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode,
    });
  }
}

/**
 * DELETE /api/billing/subscription - Cancel subscription
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeSubscriptionId: true },
    });

    if (!dbUser?.stripeSubscriptionId) {
      throw new ValidationError('No active subscription found');
    }

    const subscription = await cancelSubscription(dbUser.stripeSubscriptionId);

    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end,
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.error.statusCode,
    });
  }
}
