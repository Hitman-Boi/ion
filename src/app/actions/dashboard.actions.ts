"use server"

import { prisma } from "@/lib/prisma"

/**
 * Fetch data for the learner dashboard page.
 */
export async function getLearnerDashboardData(userId: string) {
    // Fetch User with Target Roles & Progress
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            targetRoles: {
                include: {
                    skills: true,
                    learningPaths: {
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
                    }
                }
            },
            skills: { include: { skill: true } }
        }
    })

    // Fetch All Roles for Picker
    const allRoles = await prisma.jobRole.findMany()

    // Fetch User Progress for all completed topics
    const userProgress = await prisma.userProgress.findMany({
        where: {
            userId,
            isTopicComplete: true
        },
        select: { topicId: true }
    })

    // Fetch Directly Subscribed Learning Paths
    const subscribedPaths = await prisma.userLearningPath.findMany({
        where: { userId },
        include: {
            learningPath: {
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
            }
        }
    })

    // Fetch Enrolled Courses
    const enrollments = await prisma.enrollment.findMany({
        where: {
            userId,
            role: "STUDENT",
            course: {
                deletedAt: null
            }
        },
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
        },
        orderBy: { updatedAt: 'desc' }
    })

    return {
        user,
        allRoles,
        userProgress,
        subscribedPaths,
        enrollments
    }
}

/**
 * Fetch data for the instructor dashboard page.
 */
export async function getInstructorDashboardData(userId: string) {
    const teachingCourses = await prisma.course.findMany({
        where: {
            OR: [
                { instructorId: userId },
                { enrollments: { some: { userId, role: "INSTRUCTOR" } } }
            ],
            deletedAt: null,
        },
        include: {
            _count: {
                select: { enrollments: { where: { role: "STUDENT" } } }
            }
        },
        orderBy: { updatedAt: 'desc' }
    })

    return { teachingCourses }
}

/**
 * Fetch data for the admin dashboard page.
 */
export async function getAdminDashboardData() {
    const [adminUsers, courses] = await Promise.all([
        prisma.user.findMany({
            where: { role: "ADMIN" },
            orderBy: { createdAt: "desc" },
        }),
        prisma.course.findMany({
            include: {
                enrollments: {
                    select: { role: true }
                },
                modules: true
            },
            orderBy: { createdAt: "desc" },
        }),
    ])

    return { adminUsers, courses }
}

/**
 * Fetch data for the admin roles page.
 */
export async function getAdminRolesPageData() {
    const roles = await prisma.jobRole.findMany({
        include: {
            learningPaths: true,
        },
        orderBy: { title: 'asc' }
    })

    const learningPaths = await prisma.learningPath.findMany({
        include: {
            items: true,
            roles: true
        },
        orderBy: { title: 'asc' }
    })

    const allCourses = await prisma.course.findMany({
        where: { deletedAt: null },
        select: {
            id: true,
            title: true,
            modules: {
                select: { id: true, title: true, sortOrder: true },
                orderBy: { sortOrder: 'asc' }
            }
        },
        orderBy: { title: 'asc' }
    })

    return { roles, learningPaths, allCourses }
}
