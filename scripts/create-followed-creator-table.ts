import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createFollowedCreatorTable() {
  try {
    console.log('Creating FollowedCreator table...');

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "FollowedCreator" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "creatorId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "FollowedCreator_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('✅ Table created successfully');

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "FollowedCreator_userId_creatorId_key"
      ON "FollowedCreator"("userId", "creatorId");
    `);

    console.log('✅ Unique index created');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "FollowedCreator_userId_idx" ON "FollowedCreator"("userId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "FollowedCreator_creatorId_idx" ON "FollowedCreator"("creatorId");
    `);

    console.log('✅ Indexes created');

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "FollowedCreator"
        ADD CONSTRAINT "FollowedCreator_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e: any) {
      if (!e.message?.includes('already exists')) throw e;
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "FollowedCreator"
        ADD CONSTRAINT "FollowedCreator_creatorId_fkey"
        FOREIGN KEY ("creatorId") REFERENCES "TrendingCreator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e: any) {
      if (!e.message?.includes('already exists')) throw e;
    }

    console.log('✅ Foreign keys created');
    console.log('✅ FollowedCreator table setup complete!');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createFollowedCreatorTable();
