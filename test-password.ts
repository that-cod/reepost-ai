import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

async function testPassword() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'demo@reepost.ai' }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.email);
    console.log('   Has password:', user.password ? 'Yes' : 'No');

    if (user.password) {
      const testPassword = 'password123';
      console.log('   Testing password:', testPassword);

      const isValid = await compare(testPassword, user.password);
      console.log('   Password match:', isValid ? '✅ YES' : '❌ NO');

      if (!isValid) {
        console.log('\n⚠️  Password does not match!');
        console.log('   This means the hash might be incorrect or password is different');
      } else {
        console.log('\n✅ Password is correct!');
        console.log('   You should be able to login with:');
        console.log('   Email: demo@reepost.ai');
        console.log('   Password: password123');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword();
