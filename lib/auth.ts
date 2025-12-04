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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      client: {
        token_endpoint_auth_method: 'client_secret_post',
      },
      issuer: 'https://www.linkedin.com',
      jwks_endpoint: 'https://www.linkedin.com/oauth/openid/jwks',
      authorization: {
        params: {
          scope: 'openid profile email w_member_social',
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          linkedInId: profile.sub,
        };
      },
    }),
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

      // Store LinkedIn access token
      if (account?.provider === 'linkedin') {
        token.linkedInAccessToken = account.access_token;

        // Update user with LinkedIn URN if available
        if (account.providerAccountId) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              linkedInUrn: `urn:li:person:${account.providerAccountId}`,
            },
          });
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
      // Log sign in
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'SIGN_IN',
          resource: 'AUTH',
          metadata: {
            provider: account?.provider,
            isNewUser,
          },
        },
      });
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
