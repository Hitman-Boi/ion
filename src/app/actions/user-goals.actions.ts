"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function addTargetRole(roleId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                targetRoles: {
                    connect: { id: roleId }
                }
            }
        })

        revalidatePath("/learner-dashboard")
        return { success: true }
    } catch (error) {
        console.error("Failed to add target role:", error)
        return { success: false, error: "Failed to add career goal" }
    }
}

export async function removeTargetRole(roleId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                targetRoles: {
                    disconnect: { id: roleId }
                }
            }
        })

        revalidatePath("/learner-dashboard")
        return { success: true }
    } catch (error) {
        console.error("Failed to remove target role:", error)
        return { success: false, error: "Failed to remove career goal" }
    }
}
