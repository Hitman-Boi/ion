import { prisma } from "@/lib/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import { z } from "zod"
import { authConfig } from "./auth.config"

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma) as any,
    session: { strategy: "jwt" },
    providers: [
        MicrosoftEntraID({
            clientId: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
            issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
        }),
        Credentials({
            async authorize(credentials) {
                const fs = require('fs');
                const log = (msg: string) => fs.appendFileSync('/tmp/auth-debug.log', new Date().toISOString() + ' ' + msg + '\n');

                log("Authorize called with email: " + credentials.email);

                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(1) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    log("Credentials parsed, looking for user: " + email);
                    const user = await prisma.user.findUnique({ where: { email } });

                    if (!user) {
                        log("User not found");
                        return null;
                    }
                    log("User found: " + user.id);

                    if (!user.password) {
                        log("User has no password");
                        return null;
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    log("Password match result: " + passwordsMatch);

                    if (passwordsMatch) return user as any;
                } else {
                    log("Credentials parsing failed");
                }
                return null;
            },
        }),
    ],
})
