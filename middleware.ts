/**
 * Next.js Middleware
 * Handles authentication and redirects
 */

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Allow request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public paths
        if (
          path.startsWith('/api/auth') ||
          path.startsWith('/api/webhooks') ||
          path.startsWith('/api/cron') ||
          path === '/'
        ) {
          return true;
        }

        // Protected API routes
        if (path.startsWith('/api/')) {
          return !!token;
        }

        // Protected pages
        const protectedPaths = [
          '/trending',
          '/calendar',
          '/engagement',
          '/creators',
          '/my-posts',
          '/saved',
          '/settings',
        ];

        if (protectedPaths.some((p) => path.startsWith(p))) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
