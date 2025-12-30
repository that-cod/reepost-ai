import { PrismaClient, Plan, Tone, Intensity } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createDemoUser() {
  console.log('🌱 Creating demo user...');

  const hashedPassword = await hash('password123', 12);

  try {
    const user = await prisma.user.upsert({
      where: { email: 'demo@reepost.ai' },
      update: {
        password: hashedPassword,
        name: 'Demo User',
        plan: Plan.PRO,
      },
      create: {
        email: 'demo@reepost.ai',
        password: hashedPassword,
        name: 'Demo User',
        plan: Plan.PRO,
        defaultTone: Tone.PROFESSIONAL,
        defaultIntensity: Intensity.MEDIUM,
      },
    });

    console.log('✅ Demo user created/updated successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Email: demo@reepost.ai');
    console.log('   Password: password123');
    console.log('\n🔗 Login URL: http://localhost:3005/auth/signin');
    console.log('\n✨ User Details:');
    console.log('   Name:', user.name);
    console.log('   Plan:', user.plan);
    console.log('   ID:', user.id);
    console.log('');
  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();
