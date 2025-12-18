/**
 * NextAuth Configuration
 */

import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import LinkedInProvider from 'next-auth/providers/linkedin';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import prisma from './prisma';
import { Adapter } from 'next-auth/adapters';
import logger from './logger';

// Check LinkedIn OAuth configuration
const hasLinkedInCredentials = !!(
  process.env.LINKEDIN_CLIENT_ID &&
  process.env.LINKEDIN_CLIENT_SECRET
);

// Log LinkedIn provider status on startup
if (hasLinkedInCredentials) {
  logger.info('LinkedIn OAuth provider is enabled');
} else {
  logger.warn('LinkedIn OAuth provider is disabled - credentials not configured');
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Host-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  providers: [
    // Only add LinkedIn provider if credentials are configured
    ...(hasLinkedInCredentials
      ? [
        LinkedInProvider({
          clientId: process.env.LINKEDIN_CLIENT_ID!,  // Safe: checked by hasLinkedInCredentials
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,  // Safe: checked by hasLinkedInCredentials
          client: {
            token_endpoint_auth_method: 'client_secret_post',
          },
          issuer: 'https://www.linkedin.com/oauth',
          jwks_endpoint: 'https://www.linkedin.com/oauth/openid/jwks',
          authorization: {
            params: {
              scope: 'openid profile email',
            },
          },
          profile(profile) {
            // Validate required fields from LinkedIn profile
            if (!profile.sub) {
              logger.error('LinkedIn profile missing sub (user ID)', { profile });
              throw new Error('LinkedIn profile is missing required user ID');
            }

            if (!profile.email) {
              logger.error('LinkedIn profile missing email', { sub: profile.sub });
              throw new Error('LinkedIn profile must include email. Please ensure your LinkedIn email is visible.');
            }

            return {
              id: profile.sub,
              name: profile.name || 'LinkedIn User',
              email: profile.email,
              image: profile.picture || null,
              linkedInId: profile.sub,
            };
          },
        }),
      ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }

      // Store LinkedIn access token and update user data
      if (account?.provider === 'linkedin') {
        token.linkedInAccessToken = account.access_token;

        // Update user with LinkedIn URN if available
        if (account.providerAccountId && user?.id) {
          try {
            // Verify user exists before updating
            const existingUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { id: true },
            });

            if (existingUser) {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  linkedInUrn: `urn:li:person:${account.providerAccountId}`,
                },
              });
              logger.info('Updated user LinkedIn URN', {
                userId: user.id,
                providerAccountId: account.providerAccountId
              });
            } else {
              logger.warn('User not found when updating LinkedIn URN', { userId: user.id });
            }
          } catch (error) {
            // Log error but don't block authentication
            logger.error('Failed to update LinkedIn URN', error as Error, {
              userId: user.id,
              providerAccountId: account.providerAccountId,
            });
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.linkedInAccessToken = token.linkedInAccessToken as string;
      }

      return session;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Log sign in - don't block auth if logging fails
      try {
        if (!user?.id) {
          logger.warn('Sign in event missing user ID');
          return;
        }

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'SIGN_IN',
            resource: 'AUTH',
            metadata: {
              provider: account?.provider || 'unknown',
              isNewUser: isNewUser || false,
            },
          },
        });
      } catch (error) {
        logger.error('Failed to create sign-in audit log', error as Error, {
          userId: user?.id,
          provider: account?.provider,
        });
      }
    },
    async signOut({ token }) {
      // Log sign out - don't block auth if logging fails
      try {
        if (!token?.id) {
          logger.warn('Sign out event missing token ID');
          return;
        }

        await prisma.auditLog.create({
          data: {
            userId: token.id as string,
            action: 'SIGN_OUT',
            resource: 'AUTH',
          },
        });
      } catch (error) {
        logger.error('Failed to create sign-out audit log', error as Error, {
          userId: token?.id,
        });
      }
    },
  },
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
    linkedInAccessToken?: string;
  }

  interface User {
    linkedInId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    linkedInAccessToken?: string;
  }
}
