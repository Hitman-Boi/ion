import NextAuth from 'next-auth';
import AzureAD from 'next-auth/providers/azure-ad';

export default NextAuth({
  providers: [
    AzureAD({
      clientId: process.env.NEXTAUTH_AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.NEXTAUTH_AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.NEXTAUTH_AZURE_AD_TENANT_ID
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 5 * 60 // 5 minutes pre-expiry refresh
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.accessTokenExpires = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number) * 1000) {
        (session as any).accessToken = token.accessToken;
      }
      return session;
    }
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
});