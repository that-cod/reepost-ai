/**
 * Database Seed Script
 * Run with: npm run db:seed
 */

import { PrismaClient, Tone, Intensity, PostStatus, Plan } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a test user
  const hashedPassword = await hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@reepost.ai' },
    update: {},
    create: {
      id: 'demo-user-12345',
      email: 'demo@reepost.ai',
      password: hashedPassword,
      name: 'Demo User',
      plan: Plan.PRO,
      defaultTone: Tone.PROFESSIONAL,
      defaultIntensity: Intensity.MEDIUM,
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created user:', user.email);

  // Create settings for user
  const settings = await prisma.settings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      id: 'demo-settings-1',
      userId: user.id,
      autoPublish: false,
      defaultScheduleTime: '09:00',
      preferredAiProvider: 'openai',
      defaultTone: Tone.PROFESSIONAL,
      defaultIntensity: Intensity.MEDIUM,
      emailNotifications: true,
      publishNotifications: true,
      engagementNotifications: true,
      autoSyncEngagement: true,
      syncFrequency: 60,
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created settings for user');

  // Create sample posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        id: 'demo-post-1',
        userId: user.id,
        content: `🚀 Excited to share my thoughts on AI innovation!

Artificial intelligence is transforming how we work, create, and solve problems. The key is finding the right balance between automation and human creativity.

What's your take on AI in your industry?

#AI #Innovation #Technology #FutureOfWork`,
        topic: 'AI Innovation',
        tone: Tone.ENTHUSIASTIC,
        intensity: Intensity.MEDIUM,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        likes: 45,
        comments: 12,
        shares: 8,
        views: 523,
      },
    }),
    prisma.post.create({
      data: {
        id: 'demo-post-2',
        userId: user.id,
        content: `💡 Leadership isn't about being the loudest voice in the room.

It's about:
• Listening to your team
• Empowering others to succeed
• Making difficult decisions with empathy
• Leading by example

What leadership qualities do you value most?

#Leadership #Management #TeamWork #ProfessionalDevelopment`,
        topic: 'Leadership',
        tone: Tone.THOUGHTFUL,
        intensity: Intensity.MEDIUM,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        likes: 67,
        comments: 23,
        shares: 15,
        views: 892,
      },
    }),
    prisma.post.create({
      data: {
        id: 'demo-post-3',
        userId: user.id,
        content: `Draft post about productivity tips...`,
        topic: 'Productivity',
        tone: Tone.PROFESSIONAL,
        intensity: Intensity.LOW,
        status: PostStatus.DRAFT,
        updatedAt: new Date(),
      },
    }),
    prisma.post.create({
      data: {
        id: 'demo-post-4',
        userId: user.id,
        content: `Scheduled post about remote work trends...`,
        topic: 'Remote Work',
        tone: Tone.CASUAL,
        intensity: Intensity.MEDIUM,
        status: PostStatus.SCHEDULED,
        scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        updatedAt: new Date(),
      },
    }),
  ]);

  console.log(`✅ Created ${posts.length} sample posts`);

  // Create analytics for published posts
  const publishedPosts = posts.filter((p) => p.status === PostStatus.PUBLISHED);

  for (let i = 0; i < publishedPosts.length; i++) {
    const post = publishedPosts[i];
    await prisma.analytics.create({
      data: {
        id: `demo-analytics-${i + 1}`,
        userId: user.id,
        postId: post.id,
        eventType: 'POST_PUBLISHED',
        date: post.publishedAt || new Date(),
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        views: post.views,
        engagementRate:
          post.views > 0
            ? ((post.likes + post.comments + post.shares) / post.views) * 100
            : 0,
      },
    });
  }

  console.log('✅ Created analytics data');

  // Create audit logs
  await prisma.auditLog.create({
    data: {
      id: 'demo-audit-log-1',
      userId: user.id,
      action: 'SIGN_UP',
      resource: 'USER',
      metadata: { source: 'seed' },
    },
  });

  console.log('✅ Created audit logs');

  console.log('\n🎉 Seeding completed!');
  console.log('\n📝 Test Account Credentials:');
  console.log('   Email: demo@reepost.ai');
  console.log('   Password: password123');
  console.log('\n🔗 Login at: http://localhost:3005/auth/signin\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
