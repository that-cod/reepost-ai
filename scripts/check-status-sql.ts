import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStatus() {
    try {
        console.log('🔍 Checking database status with raw SQL...\n');

        // Count creators using raw SQL
        const creatorResult: any = await prisma.$queryRawUnsafe(
            'SELECT COUNT(*) as count FROM "TrendingCreator"'
        );
        const creatorCount = parseInt(creatorResult[0].count);
        console.log(`👥 Creators in database: ${creatorCount}`);

        // Count posts using raw SQL
        const postResult: any = await prisma.$queryRawUnsafe(
            'SELECT COUNT(*) as count FROM "TrendingPost"'
        );
        const postCount = parseInt(postResult[0].count);
        console.log(`📝 Posts in database: ${postCount}`);

        // Get sample data
        if (creatorCount > 0) {
            console.log('\n📊 Top 5 creators by post count:');
            const topCreators: any = await prisma.$queryRawUnsafe(`
        SELECT 
          c.name,
          c."linkedinUrl",
          COUNT(p.id) as post_count
        FROM "TrendingCreator" c
        LEFT JOIN "TrendingPost" p ON p."creatorId" = c.id
        GROUP BY c.id, c.name, c."linkedinUrl"
        ORDER BY post_count DESC
        LIMIT 5
      `);

            topCreators.forEach((creator: any, idx: number) => {
                console.log(`  ${idx + 1}. ${creator.name} - ${creator.post_count} posts`);
            });
        }

        // Calculate progress
        const expectedCreators = 254;
        const expectedPosts = 11442;
        const creatorProgress = ((creatorCount / expectedCreators) * 100).toFixed(1);
        const postProgress = ((postCount / expectedPosts) * 100).toFixed(1);

        console.log('\n📈 Import Progress:');
        console.log(`   Creators: ${creatorCount}/${expectedCreators} (${creatorProgress}%)`);
        console.log(`   Posts: ${postCount}/${expectedPosts} (${postProgress}%)`);

        if (postCount < expectedPosts) {
            const remaining = expectedPosts - postCount;
            console.log(`\n⏳ Remaining: ${remaining} posts to import`);
        } else {
            console.log('\n✅ Import complete!');
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkStatus();
