import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImportProgress() {
    try {
        console.log('🔍 Checking import progress...\n');

        // Count creators
        const creatorCount = await prisma.trendingCreator.count();
        console.log(`👥 Creators in database: ${creatorCount}`);

        // Count posts
        const postCount = await prisma.trendingPost.count();
        console.log(`📝 Posts in database: ${postCount}`);

        if (creatorCount > 0) {
            console.log('\n📊 Sample creators:');
            const sampleCreators = await prisma.trendingCreator.findMany({
                take: 5,
                select: {
                    name: true,
                    linkedinUrl: true,
                    _count: {
                        select: { trendingPosts: true }
                    }
                }
            });

            sampleCreators.forEach((creator, idx) => {
                console.log(`  ${idx + 1}. ${creator.name} - ${creator._count.trendingPosts} posts`);
            });
        }

        if (postCount > 0) {
            console.log('\n📊 Sample posts:');
            const samplePosts = await prisma.trendingPost.findMany({
                take: 3,
                select: {
                    content: true,
                    likes: true,
                    creator: {
                        select: { name: true }
                    }
                }
            });

            samplePosts.forEach((post, idx) => {
                console.log(`  ${idx + 1}. ${post.creator.name}: ${post.content.substring(0, 60)}... (${post.likes} likes)`);
            });
        }

        console.log('\n✅ Database check complete!');

        if (creatorCount === 0 && postCount === 0) {
            console.log('\n⚠️  No data found - import appears stuck or hasn\'t started writing');
        } else {
            console.log(`\n📈 Import progress: ${creatorCount}/254 creators, ${postCount}/11,442 posts`);
        }

    } catch (error) {
        console.error('❌ Error checking database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkImportProgress();
