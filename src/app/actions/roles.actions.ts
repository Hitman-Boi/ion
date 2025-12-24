"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRole(data: { title: string; description?: string; skillIds?: string[] }) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const role = await prisma.jobRole.create({
        data: {
            title: data.title,
            description: data.description,
            skills: {
                connect: data.skillIds?.map((id) => ({ id })),
            }
        },
    });

    revalidatePath("/admin/roles");
    return role;
}

export async function updateRole(id: string, data: { title: string; description?: string; skillIds?: string[] }) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const role = await prisma.jobRole.update({
        where: { id },
        data: {
            title: data.title,
            description: data.description,
            skills: {
                set: data.skillIds?.map((id) => ({ id })),
            }
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

export async function updateRoleLinkPath(roleId: string, level: string, pathId: string) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    // 1. Find the role and its current paths
    const role = await prisma.jobRole.findUnique({
        where: { id: roleId },
        include: { learningPaths: true }
    });

    if (!role) throw new Error("Role not found");

    // 2. Identify paths of the same level that should be disconnected
    // (We accept that level is a string, assuming it matches the Enum)
    const pathsToDisconnect = role.learningPaths.filter(p => p.level === level);

    // 3. Update: Disconnect old, Connect new
    await prisma.jobRole.update({
        where: { id: roleId },
        data: {
            learningPaths: {
                disconnect: pathsToDisconnect.map(p => ({ id: p.id })),
                connect: { id: pathId }
            }
        }
    })

    revalidatePath("/admin/roles");
}

export async function getRoles() {
    return await prisma.jobRole.findMany({
        include: {
            learningPaths: {
                include: {
                    items: {
                        orderBy: { orderIndex: 'asc' },
                        include: {
                            course: true,
                            chapter: true
                        }
                    }
                }
            }
        }
    });
}
