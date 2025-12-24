"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRole(data: { title: string; description?: string }) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const role = await prisma.jobRole.create({
        data: {
            title: data.title,
            description: data.description,
        },
    });

    revalidatePath("/admin/roles");
    return role;
}

export async function updateRole(id: string, data: { title: string; description?: string }) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const role = await prisma.jobRole.update({
        where: { id },
        data: {
            title: data.title,
            description: data.description,
        },
    });

    revalidatePath("/admin/roles");
    return role;
}

export async function deleteRole(id: string) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    await prisma.jobRole.delete({
        where: { id },
    });

    revalidatePath("/admin/roles");
}

export async function createRolePath(data: { targetRoleId: string; sourceRoleId?: string; milestones: any[] }) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const path = await prisma.rolePath.create({
        data: {
            targetRoleId: data.targetRoleId,
            sourceRoleId: data.sourceRoleId,
            milestones: data.milestones,
        },
    });

    revalidatePath("/admin/roles");
    return path;
}

export async function getRoles() {
    return await prisma.jobRole.findMany({
        include: {
            paths: {
                include: {
                    targetRole: true
                }
            }
        }
    });
}
