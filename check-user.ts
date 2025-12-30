import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'demo@reepost.ai' }
    });

    if (user) {
      console.log('✅ User found in database');
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   ID:', user.id);
      console.log('   Plan:', user.plan);
      console.log('   Has password hash:', user.password ? 'Yes' : 'No');
      console.log('   Password hash length:', user.password?.length);
      console.log('   Password starts with:', user.password?.substring(0, 10));
    } else {
      console.log('❌ User NOT found in database');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
