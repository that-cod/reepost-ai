/**
 * NextAuth API Route Handler
 * Note: The handler must be exported directly for Next.js 13+ App Router
 * Wrapping it causes req.query to be undefined
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
