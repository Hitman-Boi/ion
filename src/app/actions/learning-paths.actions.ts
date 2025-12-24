"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createLearningPath(data: { title: string; description?: string; roleIds?: string[]; level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" }) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const path = await prisma.learningPath.create({
        data: {
            title: data.title,
            description: data.description,
            level: data.level || "BEGINNER",
            roles: {
                connect: data.roleIds?.map((id) => ({ id })),
            }
        },
    });

    revalidatePath("/admin/roles");
    return path;
}

export async function updateLearningPath(id: string, data: { title: string; description?: string; level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" }) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const path = await prisma.learningPath.update({
        where: { id },
        data: {
            title: data.title,
            description: data.description,
            level: data.level,
        },
    });

    revalidatePath("/admin/roles");
    return path;
}

export async function addLearningPathItem(pathId: string, data: { courseId?: string; moduleId?: string }) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    // Get current items count to set orderIndex
    const count = await prisma.learningPathItem.count({
        where: { learningPathId: pathId }
    });

    const item = await prisma.learningPathItem.create({
        data: {
            learningPathId: pathId,
            courseId: data.courseId,
            moduleId: data.moduleId,
            orderIndex: count, // Append to end
        }
    });

    revalidatePath("/admin/roles");
    return item;
}

export async function updateLearningPathOrder(pathId: string, items: { id: string; orderIndex: number }[]) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    await prisma.$transaction(
        items.map((item) =>
            prisma.learningPathItem.update({
                where: { id: item.id },
                data: { orderIndex: item.orderIndex }
            })
        )
    );

    revalidatePath("/admin/roles");
}

export async function deleteLearningPathItem(id: string) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    await prisma.learningPathItem.delete({
        where: { id }
    });

    revalidatePath("/admin/roles");
}

export async function getLearningPaths() {
    // Check auth if needed, but usually fine for viewing if public? Admin only for now.
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    return await prisma.learningPath.findMany({
        include: {
            items: {
                orderBy: { orderIndex: 'asc' },
                include: {
                    course: true,
                    module: true
                }
            },
            roles: true
        }
    });
}

export async function getPublicLearningPaths(searchParams?: { term?: string }) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const where: any = {};

    if (searchParams?.term) {
        where.OR = [
            { title: { contains: searchParams.term, mode: 'insensitive' } },
            { description: { contains: searchParams.term, mode: 'insensitive' } }
        ];
    }

    return await prisma.learningPath.findMany({
        where,
        include: {
            items: {
                orderBy: { orderIndex: 'asc' },
                include: {
                    course: true,
                    module: true
                }
            },
            roles: true,
            _count: {
                select: { items: true }
            }
        },
        orderBy: { title: 'asc' }
    });
}

export async function subscribeToLearningPath(pathId: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    // Check if path exists
    const path = await prisma.learningPath.findUnique({
        where: { id: pathId }
    });

    if (!path) {
        throw new Error("Learning path not found");
    }

    // Check if already subscribed
    const existing = await prisma.userLearningPath.findUnique({
        where: {
            userId_learningPathId: {
                userId: session.user.id,
                learningPathId: pathId
            }
        }
    });

    if (existing) {
        return existing;
    }

    const subscription = await prisma.userLearningPath.create({
        data: {
            userId: session.user.id,
            learningPathId: pathId
        }
    });

    revalidatePath(`/learning-paths/${pathId}`);
    revalidatePath('/learner-dashboard');
    return subscription;
}

export async function unsubscribeFromLearningPath(pathId: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    await prisma.userLearningPath.deleteMany({
        where: {
            userId: session.user.id,
            learningPathId: pathId
        }
    });

    revalidatePath(`/learning-paths/${pathId}`);
    revalidatePath('/learner-dashboard');
}

export async function isSubscribedToLearningPath(pathId: string): Promise<boolean> {
    const session = await auth();
    if (!session?.user) {
        return false;
    }

    const subscription = await prisma.userLearningPath.findUnique({
        where: {
            userId_learningPathId: {
                userId: session.user.id,
                learningPathId: pathId
            }
        }
    });

    return !!subscription;
}

