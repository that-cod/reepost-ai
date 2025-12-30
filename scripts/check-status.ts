import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImportStatus() {
    try {
        console.log('🔍 Checking import status...\n');

        // Use queryRaw with parameterized queries (works with Prisma protocol)
        const creatorCount: any = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM "TrendingCreator"
    `;

        const postCount: any = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM "TrendingPost"
    `;

        const creators = Number(creatorCount[0].count);
        const posts = Number(postCount[0].count);

        console.log(`👥 Creators: ${creators}/254 (${((creators / 254) * 100).toFixed(1)}%)`);
        console.log(`📝 Posts: ${posts}/11,442 (${((posts / 11442) * 100).toFixed(1)}%)\n`);

        if (creators > 0) {
            const topCreators: any = await prisma.$queryRaw`
        SELECT 
          c.name,
          COUNT(p.id)::int as posts
        FROM "TrendingCreator" c
        LEFT JOIN "TrendingPost" p ON p."creatorId" = c.id
        GROUP BY c.id, c.name
        ORDER BY posts DESC
        LIMIT 5
      `;

            console.log('📊 Top creators:');
            topCreators.forEach((c: any, i: number) => {
                console.log(`  ${i + 1}. ${c.name}: ${c.posts} posts`);
            });
        }

        console.log(`\n⏳ Remaining: ${11442 - posts} posts\n`);

        if (posts >= 11442) {
            console.log('✅ Import complete!');
        } else if (posts > 0) {
            console.log('⚠️  Import partially complete');
            console.log('💡 Run "npm run import-csv" to continue (slow)');
            console.log('   OR restart dev server and run "npm run import-csv-batch" (fast)\n');
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Try: Stop dev server → npx prisma generate → restart');
    } finally {
        await prisma.$disconnect();
    }
}

checkImportStatus();
