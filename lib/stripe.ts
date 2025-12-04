/**
 * Stripe Integration
 * Handles subscriptions and billing
 */

import Stripe from 'stripe';
import { Plan } from '@prisma/client';
import prisma from './prisma';
import logger, { loggers } from './logger';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

/**
 * Create Stripe customer
 */
export async function createCustomer(params: {
  email: string;
  name?: string;
  userId: string;
}): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: {
        userId: params.userId,
      },
    });

    return customer;
  } catch (error) {
    loggers.error('Failed to create Stripe customer', error as Error);
    throw new Error('Failed to create customer');
  }
}

/**
 * Create checkout session
 */
export async function createCheckoutSession(params: {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    let customerId = user.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId && user.email) {
      const customer = await createCustomer({
        email: user.email,
        name: user.name || undefined,
        userId: user.id,
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        userId: params.userId,
      },
    });

    return session;
  } catch (error) {
    loggers.error('Failed to create checkout session', error as Error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Create portal session for managing subscription
 */
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });

    return session;
  } catch (error) {
    loggers.error('Failed to create portal session', error as Error);
    throw new Error('Failed to create portal session');
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return subscription;
  } catch (error) {
    loggers.error('Failed to cancel subscription', error as Error);
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Get plan from price ID
 */
export function getPlanFromPriceId(priceId: string): Plan {
  const priceIdMap: Record<string, Plan> = {
    [process.env.STRIPE_PRICE_ID_STARTER!]: Plan.STARTER,
    [process.env.STRIPE_PRICE_ID_PRO!]: Plan.PRO,
    [process.env.STRIPE_PRICE_ID_ENTERPRISE!]: Plan.ENTERPRISE,
  };

  return priceIdMap[priceId] || Plan.FREE;
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeCurrentPeriodEnd: true,
      plan: true,
    },
  });

  if (!user || user.plan === Plan.FREE) {
    return false;
  }

  if (!user.stripeCurrentPeriodEnd) {
    return false;
  }

  return user.stripeCurrentPeriodEnd.getTime() > Date.now();
}
