import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        AzureADProvider({
            clientId: process.env.NEXTAUTH_AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.NEXTAUTH_AZURE_AD_CLIENT_SECRET!,
            tenantId: process.env.NEXTAUTH_AZURE_AD_TENANT_ID,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });
                if (!user) {
                    return null;
                }
                // TODO: Verify password (add bcrypt comparison)
                return { id: user.id.toString(), email: user.email, role: user.role };
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login",
    }
};
