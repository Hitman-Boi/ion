import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // Skip login - allow all requests through
      return true;
    },
    async signIn({ user, account, profile }) {
      // Allow all sign-ins
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id || '';
        // @ts-ignore - role is not defined in default User type yet
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.SESSION_ENCRYPTION_SECRET,
  trustHost: true,
} satisfies NextAuthConfig
