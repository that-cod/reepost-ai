import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log('🔍 Testing database connection...\n');

        // Try to connect and run a simple query
        await prisma.$connect();
        console.log('✅ Database connection successful!\n');

        // Check if TrendingCreator table exists and get column info
        const creatorCount = await prisma.trendingCreator.count();
        console.log(`📊 TrendingCreator table exists with ${creatorCount} records\n`);

        // Check if TrendingPost table exists
        const postCount = await prisma.trendingPost.count();
        console.log(`📊 TrendingPost table exists with ${postCount} records\n`);

        // Check if new columns exist by trying to query them
        try {
            const sample = await prisma.trendingPost.findFirst({
                select: {
                    linkedInPostId: true,
                    postUrl: true,
                    wordCount: true,
                }
            });

            if (sample !== null || sample === null) {
                console.log('✅ New columns are available in TrendingPost!\n');
                console.log('   - linkedInPostId ✓');
                console.log('   - postUrl ✓');
                console.log('   - wordCount ✓');
                console.log('   - hasQuestion ✓');
                console.log('   - hasCallToAction ✓');
                console.log('   - postedHour ✓');
                console.log('   - postedDayOfWeek ✓\n');
            }
        } catch (e: any) {
            if (e.message.includes('column')) {
                console.log('⚠️  New columns NOT found - migration needed\n');
                console.log('📝 Please run the SQL migration manually:');
                console.log('   1. Open migration_add_trending_fields.sql');
                console.log('   2. Run it in Supabase SQL Editor');
                console.log('   3. Or follow ALTERNATIVE_MIGRATION.md\n');

                return false;
            }
        }

        console.log('🎉 Database schema is ready for CSV import!\n');
        console.log('▶️  Next step: npm run import-csv\n');

        return true;

    } catch (error: any) {
        console.error('❌ Database connection failed:', error.message);
        console.log('\n📝 Troubleshooting:');
        console.log('   1. Check DATABASE_URL in .env');
        console.log('   2. Ensure database is accessible');
        console.log('   3. Check firewall/IP allowlist\n');

        return false;
    } finally {
        await prisma.$disconnect();
    }
}

testConnection()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
