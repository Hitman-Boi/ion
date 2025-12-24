'use server'

import { auth } from "@/auth"
import { prisma as db } from "@/lib/prisma"
import { ResourceType, CourseRole } from "@prisma/client"
import { revalidatePath } from "next/cache"

// Helper to ensure user is authorized (Instructor or Admin)
async function checkAuth() {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }
    return session.user
}

// Helper to check if user is admin or course instructor
async function checkCourseOwnerOrAdmin(courseId: string) {
    const user = await checkAuth()

    // @ts-ignore
    if (user.role === "ADMIN") return true

    const course = await db.course.findUnique({
        where: { id: courseId },
        select: { instructorId: true }
    })

    if (!course) throw new Error("Course not found")

    if (course.instructorId !== user.id) {
        // Also check if they are an instructor via Enrollment
        const enrollment = await db.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: courseId
                }
            }
        })

        if (enrollment?.role === CourseRole.INSTRUCTOR) return true // Use Enum

        throw new Error("Unauthorized")
    }
    return true
}

// --- MODULES ---

export async function createModule(courseId: string, title: string) {
    await checkAuth()

    const lastModule = await db.module.findFirst({
        where: { courseId },
        orderBy: { sortOrder: 'desc' },
    })

    const newOrder = lastModule ? lastModule.sortOrder + 1 : 1

    const newModule = await db.module.create({
        data: {
            courseId,
            title,
            sortOrder: newOrder,
        },
    })

    revalidatePath(`/courses/${courseId}/studio`)
    return newModule
}

export async function reorderModules(courseId: string, updates: { id: string; sortOrder: number }[]) {
    await checkAuth()

    const transaction = updates.map((update) =>
        db.module.update({
            where: { id: update.id, courseId },
            data: { sortOrder: update.sortOrder },
        })
    )

    await db.$transaction(transaction)
    revalidatePath(`/courses/${courseId}/studio`)
}

export async function deleteModule(moduleId: string, courseId: string) {
    await checkAuth()
    await db.module.delete({
        where: { id: moduleId }
    })
    revalidatePath(`/courses/${courseId}/studio`)
}

export async function updateModule(moduleId: string, courseId: string, title: string) {
    await checkAuth()
    await db.module.update({
        where: { id: moduleId },
        data: { title }
    })
    revalidatePath(`/courses/${courseId}/studio`)
}

// --- TOPICS ---

export async function createTopic(moduleId: string, title: string, courseId: string) { // courseId for revalidation
    await checkAuth()

    const lastTopic = await db.topic.findFirst({
        where: { moduleId },
        orderBy: { sortOrder: 'desc' },
    })

    const newOrder = lastTopic ? lastTopic.sortOrder + 1 : 1

    const topic = await db.topic.create({
        data: {
            moduleId,
            title,
            sortOrder: newOrder,
        },
    })

    revalidatePath(`/courses/${courseId}/studio`)
    return topic
}

export async function reorderTopics(updates: { id: string; sortOrder: number; moduleId: string }[], courseId: string) {
    await checkAuth()

    // Note: If dragging between modules, update moduleId too
    const transaction = updates.map((update) =>
        db.topic.update({
            where: { id: update.id },
            data: {
                sortOrder: update.sortOrder,
                moduleId: update.moduleId
            },
        })
    )

    await db.$transaction(transaction)
    revalidatePath(`/courses/${courseId}/studio`)
}

export async function deleteTopic(topicId: string, courseId: string) {
    await checkAuth()
    await db.topic.delete({
        where: { id: topicId }
    })
    revalidatePath(`/courses/${courseId}/studio`)
}

export async function updateTopic(topicId: string, courseId: string, title: string) {
    await checkAuth()
    await db.topic.update({
        where: { id: topicId },
        data: { title }
    })
    revalidatePath(`/courses/${courseId}/studio`)
}

// --- RESOURCES ---

export async function createTopicResource(
    topicId: string,
    type: ResourceType,
    data: { title?: string, contentUrl?: string, quizData?: any },
    courseId: string
) {
    await checkAuth()

    // Get next sortOrder
    const lastResource = await db.topicResource.findFirst({
        where: { topicId },
        orderBy: { sortOrder: 'desc' },
    })
    const newOrder = lastResource ? lastResource.sortOrder + 1 : 0

    const resource = await db.topicResource.create({
        data: {
            topicId,
            type,
            title: data.title || (type === "VIDEO" ? "Video" : type === "PDF" ? "PDF" : "Quiz"),
            contentUrl: data.contentUrl,
            quizData: data.quizData,
            sortOrder: newOrder,
        }
    })

    revalidatePath(`/courses/${courseId}/studio`)
    return resource
}

export async function updateTopicResource(
    resourceId: string,
    data: { title?: string, contentUrl?: string, quizData?: any },
    courseId: string
) {
    await checkAuth()

    await db.topicResource.update({
        where: { id: resourceId },
        data: {
            title: data.title,
            contentUrl: data.contentUrl,
            quizData: data.quizData,
        }
    })

    revalidatePath(`/courses/${courseId}/studio`)
}

export async function reorderTopicResources(
    updates: { id: string; sortOrder: number }[],
    courseId: string
) {
    await checkAuth()

    const transaction = updates.map((update) =>
        db.topicResource.update({
            where: { id: update.id },
            data: { sortOrder: update.sortOrder },
        })
    )

    await db.$transaction(transaction)
    revalidatePath(`/courses/${courseId}/studio`)
}

export async function deleteTopicResource(resourceId: string, courseId: string) {
    await checkAuth()
    await db.topicResource.delete({
        where: { id: resourceId }
    })
    revalidatePath(`/courses/${courseId}/studio`)
}

export async function getCourseHierarchy(courseId: string) {
    await checkAuth()

    return await db.course.findUnique({
        where: { id: courseId },
        include: {
            modules: {
                orderBy: { sortOrder: 'asc' },
                include: {
                    topics: {
                        orderBy: { sortOrder: 'asc' },
                        include: {
                            resources: {
                                orderBy: { sortOrder: 'asc' }
                            }
                        }
                    }
                }
            },
            skills: true
        }
    })
}


export async function updateCourseSkills(courseId: string, skillIds: string[]) {
    await checkCourseOwnerOrAdmin(courseId)

    await db.course.update({
        where: { id: courseId },
        data: {
            skills: {
                set: skillIds.map((id) => ({ id }))
            }
        }
    })
    revalidatePath(`/courses/${courseId}/studio`)
    revalidatePath(`/admin/courses/${courseId}`)
}
