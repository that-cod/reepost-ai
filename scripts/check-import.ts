import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImport() {
  try {
    const posts = await prisma.trendingPost.count();
    const creators = await prisma.trendingCreator.count();

    console.log('✅ Import Status:');
    console.log(`   Total posts: ${posts}`);
    console.log(`   Total creators: ${creators}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkImport();
