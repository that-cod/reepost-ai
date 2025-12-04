/**
 * Prisma Client Singleton
 * Ensures only one instance of Prisma Client is created in development
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Enable pgvector extension
 * Run this in a migration or manually:
 * CREATE EXTENSION IF NOT EXISTS vector;
 */
export async function enablePgVector() {
  try {
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector;`;
    console.log('✅ pgvector extension enabled');
  } catch (error) {
    console.error('Failed to enable pgvector:', error);
    throw error;
  }
}

export default prisma;
