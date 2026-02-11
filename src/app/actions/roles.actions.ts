"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRole(data: { title: string; description?: string; skillIds?: string[] }) {
    // Skip auth check

    const role = await prisma.jobRole.create({
        data: {
            title: data.title,
            description: data.description,
            skills: {
                connect: data.skillIds?.map((id) => ({ id })),
            }
        },
    });

    revalidatePath("/admin-dashboard/roles");
    return role;
}

export async function updateRole(id: string, data: { title: string; description?: string; skillIds?: string[] }) {
    // Skip auth check

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

    revalidatePath("/admin-dashboard/roles");
    return role;
}

export async function deleteRole(id: string) {
    // Skip auth check

    await prisma.jobRole.delete({
        where: { id },
    });

    revalidatePath("/admin-dashboard/roles");
}

export async function updateRoleLinkPath(roleId: string, level: string, pathId: string) {
    // Skip auth check

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

    revalidatePath("/admin-dashboard/roles");
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
                            module: true
                        }
                    }
                }
            }
        }
    });
}
