import { execSync } from 'child_process';

try {
    console.log('🔍 Pulling current database schema...\n');

    // Force pull the schema from database
    execSync('npx prisma db pull --force --print', {
        stdio: 'inherit',
        cwd: process.cwd()
    });

    console.log('\n✅ Schema pulled successfully!');
    console.log('\n📝 Now generating Prisma Client...\n');

    // Generate the client
    execSync('npx prisma generate --no-engine', {
        stdio: 'inherit',
        cwd: process.cwd()
    });

    console.log('\n🎉 Prisma Client generated!');
    console.log('\n▶️  You can now run: npm run import-csv\n');

} catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
}
