"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Deprecated: updateTargetRole functionality has been moved to user-goals.ts
// export async function updateTargetRole(roleId: string) { ... }
