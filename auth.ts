import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const auth = () => getServerSession(authOptions);
export { signIn, signOut } from "next-auth/react";
