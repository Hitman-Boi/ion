"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createLearningPath(data: { title: string; description?: string; roleIds?: string[]; level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" }) {
    // Skip auth check

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

    revalidatePath("/admin-dashboard/roles");
    return path;
}

export async function updateLearningPath(id: string, data: { title: string; description?: string; level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" }) {
    // Skip auth check

    const path = await prisma.learningPath.update({
        where: { id },
        data: {
            title: data.title,
            description: data.description,
            level: data.level,
        },
    });

    revalidatePath("/admin-dashboard/roles");
    return path;
}

export async function addLearningPathItem(pathId: string, data: { courseId?: string; moduleId?: string }) {
    // Skip auth check

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

    revalidatePath("/admin-dashboard/roles");
    return item;
}

export async function updateLearningPathOrder(pathId: string, items: { id: string; orderIndex: number }[]) {
    // Skip auth check

    await prisma.$transaction(
        items.map((item) =>
            prisma.learningPathItem.update({
                where: { id: item.id },
                data: { orderIndex: item.orderIndex }
            })
        )
    );

    revalidatePath("/admin-dashboard/roles");
}

export async function deleteLearningPathItem(id: string) {
    // Skip auth check

    await prisma.learningPathItem.delete({
        where: { id }
    });

    revalidatePath("/admin-dashboard/roles");
}

export async function getLearningPaths() {
    // Skip auth check

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
    // Skip auth check

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

/**
 * Fetch all data needed for the learning path detail page.
 */
export async function getLearningPathPageData(pathId: string, userId: string) {
    const path = await prisma.learningPath.findUnique({
        where: { id: pathId },
        include: {
            items: {
                orderBy: { orderIndex: 'asc' },
                include: {
                    course: {
                        include: {
                            modules: {
                                include: {
                                    topics: { select: { id: true } }
                                }
                            }
                        }
                    },
                    module: {
                        include: {
                            topics: { select: { id: true } }
                        }
                    }
                }
            }
        }
    })

    // Check subscription status
    const subscription = await prisma.userLearningPath.findUnique({
        where: {
            userId_learningPathId: {
                userId,
                learningPathId: pathId
            }
        }
    })

    // Fetch User Progress
    const userProgress = await prisma.userProgress.findMany({
        where: {
            userId,
            isTopicComplete: true
        },
        select: { topicId: true }
    })

    return {
        path,
        isSubscribed: !!subscription,
        userProgress
    }
}
