/**
 * Authentication Middleware
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthenticationError, AuthorizationError } from '../errors';
import { Plan } from '@prisma/client';
import prisma from '../prisma';

/**
 * Get authenticated user from request
 */
export async function getAuthUser(req?: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new AuthenticationError();
  }

  return session.user;
}

/**
 * Require authentication
 */
export async function requireAuth(req?: NextRequest) {
  return await getAuthUser(req);
}

/**
 * Require specific plan
 */
export async function requirePlan(minPlan: Plan, req?: NextRequest) {
  const user = await getAuthUser(req);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true },
  });

  if (!dbUser) {
    throw new AuthenticationError();
  }

  const planHierarchy: Plan[] = [Plan.FREE, Plan.STARTER, Plan.PRO, Plan.ENTERPRISE];
  const userPlanIndex = planHierarchy.indexOf(dbUser.plan);
  const requiredPlanIndex = planHierarchy.indexOf(minPlan);

  if (userPlanIndex < requiredPlanIndex) {
    throw new AuthorizationError(
      `This feature requires ${minPlan} plan or higher`
    );
  }

  return user;
}

/**
 * Get LinkedIn access token for user
 */
export async function getLinkedInToken(): Promise<string> {
  const session = await getServerSession(authOptions);

  if (!session?.linkedInAccessToken) {
    throw new AuthenticationError('LinkedIn connection required');
  }

  return session.linkedInAccessToken;
}

/**
 * Verify cron secret for scheduled jobs
 */
export function verifyCronSecret(req: NextRequest): void {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    throw new AuthorizationError('Invalid cron secret');
  }
}
