import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/learner-dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // Redirect logged-in users away from login page
        if (nextUrl.pathname === '/login') {
          return Response.redirect(new URL('/learner-dashboard', nextUrl));
        }
      }
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
} satisfies NextAuthConfig