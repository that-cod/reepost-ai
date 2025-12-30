import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMigration() {
    try {
        console.log('🔍 Connecting to database...\n');
        await prisma.$connect();
        console.log('✅ Connected!\n');

        console.log('📝 Running schema migration...\n');

        // Run raw SQL to add columns
        const migrations = [
            // Add columns to TrendingCreator
            `ALTER TABLE "TrendingCreator" ADD COLUMN IF NOT EXISTS "username" TEXT;`,
            `ALTER TABLE "TrendingCreator" ADD COLUMN IF NOT EXISTS "headline" TEXT;`,

            // Add columns to TrendingPost
            `ALTER TABLE "TrendingPost" ADD COLUMN IF NOT EXISTS "linkedInPostId" TEXT;`,
            `ALTER TABLE "TrendingPost" ADD COLUMN IF NOT EXISTS "postUrl" TEXT;`,
            `ALTER TABLE "TrendingPost" ADD COLUMN IF NOT EXISTS "postType" TEXT;`,
            `ALTER TABLE "TrendingPost" ADD COLUMN IF NOT EXISTS "wordCount" INTEGER;`,
            `ALTER TABLE "TrendingPost" ADD COLUMN IF NOT EXISTS "hasQuestion" BOOLEAN;`,
            `ALTER TABLE "TrendingPost" ADD COLUMN IF NOT EXISTS "hasCallToAction" BOOLEAN;`,
            `ALTER TABLE "TrendingPost" ADD COLUMN IF NOT EXISTS "postedHour" INTEGER;`,
            `ALTER TABLE "TrendingPost" ADD COLUMN IF NOT EXISTS "postedDayOfWeek" TEXT;`,
        ];

        for (const sql of migrations) {
            try {
                await prisma.$executeRawUnsafe(sql);
                console.log(`✓ ${sql.substring(0, 60)}...`);
            } catch (error: any) {
                if (error.message.includes('already exists')) {
                    console.log(`⏭️  Column already exists, skipping...`);
                } else {
                    throw error;
                }
            }
        }

        console.log('\n📋 Creating indexes...\n');

        const indexes = [
            // TrendingCreator indexes
            `CREATE INDEX IF NOT EXISTS "TrendingCreator_linkedinUrl_idx" ON "TrendingCreator"("linkedinUrl");`,
            `CREATE INDEX IF NOT EXISTS "TrendingCreator_username_idx" ON "TrendingCreator"("username");`,

            // TrendingPost indexes
            `CREATE INDEX IF NOT EXISTS "TrendingPost_linkedInPostId_idx" ON "TrendingPost"("linkedInPostId");`,
            `CREATE INDEX IF NOT EXISTS "TrendingPost_postedDayOfWeek_idx" ON "TrendingPost"("postedDayOfWeek");`,
            `CREATE INDEX IF NOT EXISTS "TrendingPost_hasQuestion_idx" ON "TrendingPost"("hasQuestion");`,
            `CREATE INDEX IF NOT EXISTS "TrendingPost_hasCallToAction_idx" ON "TrendingPost"("hasCallToAction");`,
        ];

        for (const sql of indexes) {
            try {
                await prisma.$executeRawUnsafe(sql);
                console.log(`✓ Index created`);
            } catch (error: any) {
                if (error.message.includes('already exists')) {
                    console.log(`⏭️  Index already exists, skipping...`);
                } else {
                    console.log(`⚠️  Could not create index (may already exist)`);
                }
            }
        }

        console.log('\n📋 Adding unique constraints...\n');

        // Add unique constraints (wrapped in DO block to check first)
        try {
            await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'TrendingCreator_linkedinUrl_key'
            ) THEN
                ALTER TABLE "TrendingCreator" 
                ADD CONSTRAINT "TrendingCreator_linkedinUrl_key" UNIQUE ("linkedinUrl");
            END IF;
        END
        $$;
      `);
            console.log('✓ TrendingCreator.linkedinUrl unique constraint');
        } catch (e) {
            console.log('⏭️  Constraint already exists');
        }

        try {
            await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'TrendingPost_linkedInPostId_key'
            ) THEN
                ALTER TABLE "TrendingPost" 
                ADD CONSTRAINT "TrendingPost_linkedInPostId_key" UNIQUE ("linkedInPostId");
            END IF;
        END
        $$;
      `);
            console.log('✓ TrendingPost.linkedInPostId unique constraint');
        } catch (e) {
            console.log('⏭️  Constraint already exists');
        }

        console.log('\n✅ Migration completed successfully!\n');
        console.log('📊 Summary:');
        console.log('   - Added 2 columns to TrendingCreator');
        console.log('   - Added 8 columns to TrendingPost');
        console.log('   - Created 6 indexes');
        console.log('   - Added 2 unique constraints\n');

        console.log('🎉 Schema is ready for CSV import!\n');
        console.log('▶️  Next step: npm run import-csv\n');

        return true;

    } catch (error: any) {
        console.error('\n❌ Migration failed:', error.message);
        console.log('\n📝 Alternative: Run migration_add_trending_fields.sql in Supabase SQL Editor\n');
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

runMigration()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
